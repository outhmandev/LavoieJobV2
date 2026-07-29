<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Assignment;
use App\Services\ContractGenerator;

class ContractController extends Controller
{
    public function index(Request $request)
    {
        $client = $request->user()->client;

        if (!$client) abort(403);

        $contracts = Assignment::with(['candidateProfile', 'project', 'client'])
            ->where('client_id', $client->id)
            ->latest()
            ->get();

        return Inertia::render('Portal/Contracts/Index', [
            'contracts' => $contracts
        ]);
    }

    public function download(Request $request, Assignment $assignment, ContractGenerator $contractGenerator)
    {
        $client = $request->user()->client;

        if (!$client || $assignment->client_id !== $client->id) {
            abort(403);
        }

        return $contractGenerator->generate($assignment);
    }
}
