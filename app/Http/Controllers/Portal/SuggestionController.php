<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Suggestion;

class SuggestionController extends Controller
{
    public function index(Request $request)
    {
        $client = $request->user()->client;

        if (!$client) abort(403);

        $suggestions = Suggestion::with(['client', 'profile', 'profile.project'])
            ->where('client_id', $client->id)
            ->latest()
            ->get();

        return Inertia::render('Portal/Suggestions/Index', [
            'suggestions' => $suggestions
        ]);
    }

    public function updateStatus(Request $request, Suggestion $suggestion)
    {
        $client = $request->user()->client;

        if (!$client || $suggestion->client_id !== $client->id) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => 'required|in:accepted,rejected'
        ]);

        $suggestion->update([
            'status' => $validated['status']
        ]);

        return back()->with('success', 'Statut de la suggestion mis à jour avec succès.');
    }
}
