<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ManageableStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StatusController extends Controller
{
    public function index()
    {
        $clientStatuses = ManageableStatus::where('type', 'client')->orderBy('name')->get();
        $profileStatuses = ManageableStatus::where('type', 'profile')->orderBy('name')->get();

        return Inertia::render('Admin/Statuses/Index', [
            'clientStatuses' => $clientStatuses,
            'profileStatuses' => $profileStatuses,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:client,profile',
            'name' => 'required|string|max:255',
        ]);

        ManageableStatus::firstOrCreate($validated);

        return redirect()->back()->with('success', 'Statut ajouté avec succès.');
    }

    public function update(Request $request, ManageableStatus $status)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $status->update($validated);

        return redirect()->back()->with('success', 'Statut modifié avec succès.');
    }

    public function destroy(ManageableStatus $status)
    {
        $status->delete();
        return redirect()->back()->with('success', 'Statut supprimé avec succès.');
    }
}
