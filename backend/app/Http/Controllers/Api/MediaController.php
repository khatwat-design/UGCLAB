<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function upload(Request $request)
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'max:102400', 'mimes:jpg,jpeg,png,webp,gif,mp4,mov,avi,webm,pdf,doc,docx'],
            'collection' => ['required', 'string', 'in:portfolio,deliverable,avatar,kyc,general'],
        ]);

        $file = $request->file('file');
        $collection = $validated['collection'];
        $user = $request->user();

        $path = $file->store("uploads/{$collection}/{$user->id}", 'public');

        $media = Media::create([
            'user_id' => $user->id,
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'collection' => $collection,
        ]);

        return response()->json([
            'id' => $media->id,
            'url' => $media->url,
            'original_name' => $media->original_name,
            'mime_type' => $media->mime_type,
            'size' => $media->size,
            'is_video' => str_starts_with($media->mime_type, 'video/'),
            'is_image' => str_starts_with($media->mime_type, 'image/'),
        ], 201);
    }

    public function delete(Media $medium)
    {
        if ($medium->user_id !== request()->user()->id && ! request()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        Storage::disk('public')->delete($medium->file_path);
        $medium->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
