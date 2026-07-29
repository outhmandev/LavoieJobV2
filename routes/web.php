<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\CandidateProfileController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\Admin\ProjectController as AdminProjectController;
use App\Http\Controllers\Api\ProjectController as ApiProjectController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function (Illuminate\Http\Request $request) {
    if (strtolower($request->user()->role) === 'client') {
        return redirect()->route('portal.dashboard');
    }
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Public API routes for dropdowns
Route::middleware('auth')->group(function () {
    Route::get('/api/projects', [ApiProjectController::class, 'index'])->name('api.projects.index');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('clients', ClientController::class);
    Route::resource('profiles', CandidateProfileController::class);
    Route::resource('assignments', AssignmentController::class);
    Route::get('/assignments/{assignment}/contract', [App\Http\Controllers\AssignmentController::class, 'generateContract'])->name('assignments.contract');
    
    Route::post('suggestions', [\App\Http\Controllers\SuggestionController::class, 'store'])->name('suggestions.store');
    Route::patch('suggestions/{suggestion}/status', [\App\Http\Controllers\SuggestionController::class, 'updateStatus'])->name('suggestions.status');

    // Admin Routes
    Route::middleware('can:system_admin')->prefix('admin')->name('admin.')->group(function () {
        Route::resource('projects', AdminProjectController::class)->except(['create', 'show', 'edit']);
        Route::post('projects/{project}/jobs', [AdminProjectController::class, 'storeJob'])->name('projects.jobs.store');
        Route::delete('projects/{project}/jobs/{job}', [AdminProjectController::class, 'destroyJob'])->name('projects.jobs.destroy');
        Route::post('projects/{project}/missions', [AdminProjectController::class, 'storeMission'])->name('projects.missions.store');
        Route::delete('projects/{project}/missions/{mission}', [AdminProjectController::class, 'destroyMission'])->name('projects.missions.destroy');
        
        Route::resource('users', \App\Http\Controllers\Admin\UserController::class)->only(['index', 'edit', 'update']);
        Route::resource('roles', \App\Http\Controllers\Admin\RoleController::class)->except(['show']);
        Route::get('audits', [\App\Http\Controllers\Admin\AuditController::class, 'index'])->name('audits.index');
        Route::resource('mail-accounts', \App\Http\Controllers\Admin\MailAccountController::class)->except(['create', 'show', 'edit']);
    });

    // Chat Routes
    Route::get('/chat/messages', [\App\Http\Controllers\ChatController::class, 'getMessages'])->name('chat.messages');
    Route::post('/chat/messages', [\App\Http\Controllers\ChatController::class, 'sendMessage'])->name('chat.send');
    Route::get('/chat/users', [\App\Http\Controllers\ChatController::class, 'getUsers'])->name('chat.users');

    // Time Tracking Routes
    Route::get('/time-tracking/status', [\App\Http\Controllers\TimeTrackingController::class, 'currentStatus'])->name('time.status');
    Route::post('/time-tracking/start', [\App\Http\Controllers\TimeTrackingController::class, 'startWork'])->name('time.start');
    Route::post('/time-tracking/pause', [\App\Http\Controllers\TimeTrackingController::class, 'startBreak'])->name('time.pause');
    Route::post('/time-tracking/resume', [\App\Http\Controllers\TimeTrackingController::class, 'endBreak'])->name('time.resume');
    Route::post('/time-tracking/stop', [\App\Http\Controllers\TimeTrackingController::class, 'stopWork'])->name('time.stop');
    // Client Portal Routes
    Route::middleware('can:client_portal')->prefix('portal')->name('portal.')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Portal\DashboardController::class, 'index'])->name('dashboard');
        
        Route::get('/criteria', [\App\Http\Controllers\Portal\ClientCriteriaController::class, 'edit'])->name('criteria.edit');
        Route::put('/criteria', [\App\Http\Controllers\Portal\ClientCriteriaController::class, 'update'])->name('criteria.update');

        Route::get('/suggestions', [\App\Http\Controllers\Portal\SuggestionController::class, 'index'])->name('suggestions.index');
        Route::patch('/suggestions/{suggestion}/status', [\App\Http\Controllers\Portal\SuggestionController::class, 'updateStatus'])->name('suggestions.status');
        
        Route::get('/contracts', [\App\Http\Controllers\Portal\ContractController::class, 'index'])->name('contracts.index');
        Route::get('/contracts/{assignment}/download', [\App\Http\Controllers\Portal\ContractController::class, 'download'])->name('contracts.download');
    });
});

require __DIR__.'/auth.php';
