<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Http\Requests\ProfileRequest;
use Illuminate\Http\JsonResponse;

class ProfileController extends Controller
{
    public function index(): JsonResponse
    {
        $profiles = Profile::latest()->paginate(15);
        return response()->json($profiles);
    }

    public function store(ProfileRequest $request): JsonResponse
    {
        $profile = Profile::create($request->validated());
        return response()->json($profile, 201);
    }

    public function show(Profile $profile): JsonResponse
    {
        return response()->json($profile);
    }

    public function update(ProfileRequest $request, Profile $profile): JsonResponse
    {
        $profile->update($request->validated());
        return response()->json($profile);
    }

    public function destroy(Profile $profile): JsonResponse
    {
        $profile->delete();
        return response()->json(null, 204);
    }
}
