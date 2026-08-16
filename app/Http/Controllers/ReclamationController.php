<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Reclamation;
use App\Models\Client;

class ReclamationController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
        ]);
        
        $reclamations = Reclamation::where('client_id', $request->client_id)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($reclamations);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'profil_litigieux' => 'nullable|string|max:255',
            'description' => 'required|string',
            'resolu' => 'required|boolean',
            'date_reclamation' => 'required|date',
        ]);

        $reclamation = Reclamation::create($validated);

        return response()->json([
            'message' => 'Réclamation créée avec succès',
            'reclamation' => $reclamation
        ]);
    }

    public function update(Request $request, Reclamation $reclamation)
    {
        $validated = $request->validate([
            'profil_litigieux' => 'sometimes|nullable|string|max:255',
            'description' => 'sometimes|required|string',
            'resolu' => 'sometimes|required|boolean',
            'date_reclamation' => 'sometimes|required|date',
        ]);

        $reclamation->update($validated);

        return response()->json([
            'message' => 'Réclamation mise à jour',
            'reclamation' => $reclamation
        ]);
    }

    public function destroy(Reclamation $reclamation)
    {
        $reclamation->delete();

        return response()->json([
            'message' => 'Réclamation supprimée'
        ]);
    }
}
