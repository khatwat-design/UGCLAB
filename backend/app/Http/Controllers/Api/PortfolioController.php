<?php

namespace App\Http\Controllers\Api;

use App\Models\PortfolioItem;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class PortfolioController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->portfolioItems()->orderBy('sort_order')->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'media_id' => ['nullable', 'exists:media,id'],
            'link_url' => ['nullable', 'url', 'max:2048'],
            'is_video' => ['nullable', 'boolean'],
        ]);

        $maxSort = $request->user()->portfolioItems()->max('sort_order') ?? 0;

        if ($validated['media_id'] ?? null) {
            $media = \App\Models\Media::find($validated['media_id']);
            $validated['image_url'] = $media->url;
            $validated['is_video'] = str_starts_with($media->mime_type, 'video/');
            $media->update(['model_type' => \App\Models\PortfolioItem::class]);
        }

        $item = $request->user()->portfolioItems()->create([
            ...$validated,
            'sort_order' => $maxSort + 1,
        ]);

        if ($validated['media_id'] ?? null) {
            \App\Models\Media::where('id', $validated['media_id'])->update(['model_id' => $item->id]);
        }

        return response()->json($item, 201);
    }

    public function update(Request $request, PortfolioItem $portfolioItem)
    {
        if ($portfolioItem->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'media_id' => ['nullable', 'exists:media,id'],
            'link_url' => ['nullable', 'url', 'max:2048'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_video' => ['nullable', 'boolean'],
        ]);

        if ($validated['media_id'] ?? null) {
            $media = \App\Models\Media::find($validated['media_id']);
            $validated['image_url'] = $media->url;
            $validated['is_video'] = str_starts_with($media->mime_type, 'video/');
            $media->update(['model_type' => \App\Models\PortfolioItem::class, 'model_id' => $portfolioItem->id]);
        }

        $portfolioItem->update($validated);

        return response()->json($portfolioItem);
    }

    public function destroy(Request $request, PortfolioItem $portfolioItem)
    {
        if ($portfolioItem->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $portfolioItem->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function showByUser($userId)
    {
        return PortfolioItem::where('user_id', $userId)
            ->orderBy('sort_order')
            ->latest()
            ->get();
    }
}
