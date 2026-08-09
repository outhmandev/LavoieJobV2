<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Suggestion;
use App\Models\Assignment;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $client = $request->user()->client;

        if (!$client) {
            // Handle edge case where a user has 'client' role but no associated client record
            return redirect()->route('dashboard')->with('error', 'Aucun profil client associé trouvé.');
        }

        // Onboarding Check
        if (empty($client->project_id) || empty($client->c_ville_a)) {
            return redirect()->route('portal.criteria.edit', ['onboarding' => 1]);
        }

        $pendingSuggestions = Suggestion::where('client_id', $client->id)
            ->where('status', 'pending')
            ->count();

        $activeContracts = Assignment::where('client_id', $client->id)
            ->where('status', 'active')
            ->count();

        return Inertia::render('Portal/Dashboard', [
            'client' => $client,
            'stats' => [
                'pendingSuggestions' => $pendingSuggestions,
                'activeContracts' => $activeContracts
            ]
        ]);
    }
}
