<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientCriteriaController extends Controller
{
    /**
     * Display the criteria form.
     */
    public function edit(Request $request)
    {
        $client = $request->user()->client;

        if (!$client) {
            abort(403, 'Profil client introuvable.');
        }

        $projects = \App\Models\Project::all();

        return Inertia::render('Portal/Criteria/Edit', [
            'client' => $client,
            'projects' => $projects,
            'isOnboarding' => request()->has('onboarding')
        ]);
    }

    /**
     * Update the client's criteria.
     */
    public function update(Request $request)
    {
        $client = $request->user()->client;

        if (!$client) {
            abort(403, 'Profil client introuvable.');
        }

        $validated = $request->validate([
            'project_id' => 'nullable|exists:projects,id',
            'fonction' => 'nullable|string|max:255',
            'prix_max' => 'nullable|numeric|min:0',
            'ville_a' => 'nullable|string|max:255',
            'presence_animaux' => 'nullable|string|in:Oui,Non',
            'nationalite' => 'nullable|string|max:255',
            'religion' => 'nullable|string|max:255',
            'mode' => 'nullable|string|max:255', // Type de contrat
            'logement' => 'nullable|string|max:255', // Hébergement
            'observation' => 'nullable|string', // Includes start date/remarks
        ]);

        $client->update($validated);

        if ($request->has('onboarding')) {
            return redirect()->route('portal.dashboard')->with('success', 'Merci ! Votre profil a été configuré avec succès.');
        }

        return back()->with('success', 'Vos critères ont été mis à jour avec succès.');
    }
}
