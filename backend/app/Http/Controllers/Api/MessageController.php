<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index()
    {
        $userId = auth()->id();

        // Get unique conversation partner IDs via subquery for efficiency
        $partnerIds = Message::where('sender_id', $userId)
            ->select('receiver_id')
            ->union(
                Message::where('receiver_id', $userId)->select('sender_id')
            )
            ->distinct()
            ->pluck('receiver_id');

        $result = [];

        foreach ($partnerIds as $partnerId) {
            $lastMessage = Message::where(function ($q) use ($userId, $partnerId) {
                $q->where('sender_id', $userId)->where('receiver_id', $partnerId);
            })->orWhere(function ($q) use ($userId, $partnerId) {
                $q->where('sender_id', $partnerId)->where('receiver_id', $userId);
            })->with(['sender', 'receiver'])->latest()->first();

            if (! $lastMessage) {
                continue;
            }

            $unread = Message::where('sender_id', $partnerId)
                ->where('receiver_id', $userId)
                ->whereNull('read_at')
                ->count();

            $otherUser = $lastMessage->sender_id === $userId
                ? $lastMessage->receiver
                : $lastMessage->sender;

            $result[] = [
                'user' => $otherUser,
                'last_message' => $lastMessage,
                'unread_count' => $unread,
            ];
        }

        // Sort by last message time, most recent first
        usort($result, fn ($a, $b) => strtotime($b['last_message']->created_at) - strtotime($a['last_message']->created_at));

        return response()->json($result);
    }

    public function conversation(User $user)
    {
        $userId = auth()->id();

        $messages = Message::where(function ($q) use ($userId, $user) {
            $q->where('sender_id', $userId)->where('receiver_id', $user->id);
        })->orWhere(function ($q) use ($userId, $user) {
            $q->where('sender_id', $user->id)->where('receiver_id', $userId);
        })->with(['sender', 'receiver'])
            ->oldest()
            ->get();

        Message::where('sender_id', $user->id)
            ->where('receiver_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json($messages);
    }

    public function send(Request $request)
    {
        $validated = $request->validate([
            'receiver_id' => ['required', 'exists:users,id'],
            'content' => ['required', 'string', 'max:5000'],
            'campaign_id' => ['nullable', 'exists:campaigns,id'],
        ]);

        $message = Message::create([
            'sender_id' => auth()->id(),
            'receiver_id' => $validated['receiver_id'],
            'content' => $validated['content'],
            'campaign_id' => $validated['campaign_id'] ?? null,
        ]);

        return response()->json($message->load(['sender', 'receiver']), 201);
    }

    public function markAsRead(Message $message)
    {
        if ($message->receiver_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message->update(['read_at' => now()]);

        return response()->json($message);
    }
}
