<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Http\Requests\AssignmentRequest;
use Illuminate\Http\JsonResponse;

class AssignmentController extends Controller
{
    public function index(): JsonResponse
    {
        $assignments = Assignment::with(['client', 'profile', 'user'])->latest()->paginate(15);
        return response()->json($assignments);
    }

    public function store(AssignmentRequest $request): JsonResponse
    {
        $assignment = Assignment::create($request->validated());
        return response()->json($assignment, 201);
    }

    public function show(Assignment $assignment): JsonResponse
    {
        $assignment->load(['client', 'profile', 'user']);
        return response()->json($assignment);
    }

    public function update(AssignmentRequest $request, Assignment $assignment): JsonResponse
    {
        $assignment->update($request->validated());
        return response()->json($assignment);
    }

    public function destroy(Assignment $assignment): JsonResponse
    {
        $assignment->delete();
        return response()->json(null, 204);
    }
}
