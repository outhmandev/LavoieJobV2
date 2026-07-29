<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\Client;
use App\Models\Profile;
use App\Http\Requests\AssignmentRequest;
use Inertia\Inertia;

class AssignmentController extends Controller
{
    public function index()
    {
        $assignments = Assignment::with(['client', 'profile', 'user'])->latest()->paginate(10);
        return Inertia::render('Assignments/Index', [
            'assignments' => $assignments
        ]);
    }

    public function create()
    {
        $clients = Client::orderBy('c_nom')->get();
        $profiles = Profile::orderBy('full_name')->get();
        return Inertia::render('Assignments/Create', [
            'clients' => $clients,
            'profiles' => $profiles
        ]);
    }

    public function store(AssignmentRequest $request)
    {
        Assignment::create($request->validated());
        return redirect()->route('assignments.index')->with('success', 'Affectation/Contrat créé avec succès.');
    }

    public function show(Assignment $assignment)
    {
        $assignment->load(['client', 'profile']);
        return Inertia::render('Assignments/Show', [
            'assignment' => $assignment
        ]);
    }

    public function edit(Assignment $assignment)
    {
        $clients = Client::orderBy('c_nom')->get();
        $profiles = Profile::orderBy('full_name')->get();
        return Inertia::render('Assignments/Edit', [
            'assignment' => $assignment,
            'clients' => $clients,
            'profiles' => $profiles
        ]);
    }

    public function update(AssignmentRequest $request, Assignment $assignment)
    {
        $assignment->update($request->validated());
        return redirect()->route('assignments.index')->with('success', 'Affectation/Contrat mis à jour avec succès.');
    }

    public function generateContract(Assignment $assignment, \App\Services\ContractGenerator $generator)
    {
        $pdfOutput = $generator->generate($assignment);

        return response($pdfOutput, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="Protocole_LavoieJob_LPS_' . $assignment->id . '.pdf"'
        ]);
    }

    public function destroy(Assignment $assignment)
    {
        $assignment->delete();
        return redirect()->route('assignments.index')->with('success', 'Affectation/Contrat supprimé avec succès.');
    }
}
