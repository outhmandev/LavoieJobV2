<?php

namespace App\Http\Controllers;

use App\Models\Suggestion;
use Illuminate\Http\Request;

class SuggestionController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'profile_id' => 'required|exists:profiles,id',
            'notes' => 'nullable|string',
        ]);

        $validated['user_id'] = auth()->id();
        $validated['status'] = 'pending';

        // Check if a suggestion already exists and is pending
        $existing = Suggestion::where('client_id', $validated['client_id'])
            ->where('profile_id', $validated['profile_id'])
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return back()->withErrors(['message' => 'This profile is already suggested to this client and is pending.']);
        }

        Suggestion::create($validated);

        return back()->with('success', 'Profile successfully suggested to client.');
    }

    public function updateStatus(Request $request, Suggestion $suggestion)
    {
        $validated = $request->validate([
            'status' => 'required|in:accepted,rejected',
        ]);

        $suggestion->update(['status' => $validated['status']]);

        $message = $validated['status'] === 'accepted' 
            ? 'Suggestion accepted! You can now create a contract for this profile.' 
            : 'Suggestion rejected.';

        return back()->with('success', $message);
    }
}
