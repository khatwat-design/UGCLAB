<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminLog;
use App\Models\KycDocument;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class KycController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    public function serveFile(Request $request, KycDocument $document)
    {
        // Only the document owner or admin can view the file
        $user = $request->user();
        if ($user->id !== $document->user_id && $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $path = storage_path('app/private/'.$document->file_path);

        if (! file_exists($path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return response()->file($path);
    }

    public function upload(Request $request)
    {
        $validated = $request->validate([
            'document_type' => ['required', 'string', 'in:id_card,passport,business_license,portfolio'],
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf,doc,docx,webp,gif', 'max:51200'],
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();

        $directory = 'kyc-documents/'.$request->user()->id;
        $storagePath = storage_path('app/private/'.$directory);
        if (! file_exists($storagePath)) {
            mkdir($storagePath, 0755, true);
        }

        $path = $file->store($directory, 'local');

        $document = KycDocument::create([
            'user_id' => $request->user()->id,
            'document_type' => $validated['document_type'],
            'file_path' => $path,
            'original_name' => $originalName,
            'status' => 'pending',
        ]);

        $request->user()->update(['kyc_status' => 'pending']);

        return response()->json($document, 201);
    }

    public function myDocuments(Request $request)
    {
        return response()->json(
            $request->user()->kycDocuments()->latest()->get()
        );
    }

    public function review(Request $request, KycDocument $document)
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:approved,rejected'],
            'admin_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $document->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? null,
        ]);

        $user = $document->user;

        // Check if all documents are approved
        $totalDocs = $user->kycDocuments()->count();

        $allApproved = $totalDocs > 0 && $user->kycDocuments()
            ->where('status', '!=', 'approved')
            ->count() === 0;

        $hasPendingOrRejected = $totalDocs > 0 && $user->kycDocuments()
            ->whereIn('status', ['pending', 'rejected'])
            ->count() > 0;

        if ($validated['status'] === 'rejected') {
            $user->update(['kyc_status' => 'rejected']);
        } elseif ($allApproved) {
            $user->update(['kyc_status' => 'verified']);
            // Mark profile as verified
            if ($user->isCreator()) {
                $user->creatorProfile()->update(['is_verified' => true]);
            } elseif ($user->isAdvertiser()) {
                $user->advertiserProfile()->update(['is_verified' => true]);
            }
        } elseif (! $hasPendingOrRejected) {
            $user->update(['kyc_status' => 'verified']);
            if ($user->isCreator()) {
                $user->creatorProfile()->update(['is_verified' => true]);
            } elseif ($user->isAdvertiser()) {
                $user->advertiserProfile()->update(['is_verified' => true]);
            }
        } else {
            $user->update(['kyc_status' => 'pending']);
        }

        AdminLog::create([
            'admin_id' => auth()->id(),
            'action' => 'review_kyc',
            'target_type' => 'kyc_document',
            'target_id' => $document->id,
            'metadata' => $validated,
        ]);

        // Notify user
        try {
            $this->notificationService->send(
                $user,
                'kyc_'.$validated['status'],
                [
                    'message' => $validated['status'] === 'approved'
                        ? 'تم توثيق حسابك بنجاح'
                        : 'لم يتم توثيق حسابك'.($validated['admin_notes'] ? ': '.$validated['admin_notes'] : ''),
                    'document_type' => $document->document_type,
                    'admin_notes' => $validated['admin_notes'] ?? null,
                ]
            );
        } catch (\Exception $e) {
        }

        return response()->json($document->fresh());
    }

    public function pendingUsers(Request $request)
    {
        $query = User::where('kyc_status', 'pending')
            ->orWhere(function ($q) {
                $q->whereHas('kycDocuments', fn ($qq) => $qq->where('status', 'pending'));
            })
            ->with(['kycDocuments', 'creatorProfile', 'advertiserProfile'])
            ->latest();

        return $query->paginate(20);
    }

    public function allUsers(Request $request)
    {
        $query = User::whereIn('role', ['creator', 'advertiser'])
            ->with(['kycDocuments', 'creatorProfile', 'advertiserProfile']);

        if ($request->kyc_status) {
            $query->where('kyc_status', $request->kyc_status);
        }

        if ($request->role) {
            $query->where('role', $request->role);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        return $query->latest()->paginate(20);
    }
}
