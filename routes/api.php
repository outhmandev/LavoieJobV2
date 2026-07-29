<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\AssignmentController;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('clients', ClientController::class);
    Route::apiResource('profiles', ProfileController::class);
    Route::apiResource('assignments', AssignmentController::class);
});
