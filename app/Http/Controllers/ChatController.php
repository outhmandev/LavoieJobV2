<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use App\Events\MessageSent;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function getMessages(Request $request)
    {
        $userId = $request->input('user_id'); // If null, means public chat

        $query = Message::with('sender');

        if ($userId) {
            $query->where(function ($q) use ($userId) {
                $q->where('sender_id', auth()->id())
                  ->where('receiver_id', $userId);
            })->orWhere(function ($q) use ($userId) {
                $q->where('sender_id', $userId)
                  ->where('receiver_id', auth()->id());
            });
        } else {
            $query->whereNull('receiver_id'); // Public messages
        }

        return response()->json(
            $query->orderBy('created_at', 'asc')->get()
        );
    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
            'receiver_id' => 'nullable|exists:users,id'
        ]);

        $message = Message::create([
            'sender_id' => auth()->id(),
            'receiver_id' => $request->receiver_id,
            'content' => $request->content,
        ]);

        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message->load('sender'));
    }

    public function getUsers()
    {
        // Return all users except self
        return response()->json(User::where('id', '!=', auth()->id())->get());
    }
}
