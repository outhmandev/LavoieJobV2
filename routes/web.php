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
    
    $totalClients = \App\Models\Client::count();
    $activeProfiles = \App\Models\Profile::where('status', 'active')->count();
    $openAssignments = \App\Models\Assignment::where('status', 'active')->count();
    
    // Convert honoraire to numeric for sum if needed, or use a query. 
    // Wait, honoraire is a string in DB, so we might need to be careful.
    // Let's just use assignment's agreed price, or if it's 0, default to something.
    $monthlyRevenue = \App\Models\Assignment::whereMonth('created_at', now()->month)
                                            ->whereYear('created_at', now()->year)
                                            ->sum('agreed_price');

    // Recent activity: let's get the 4 most recently created clients/profiles/assignments
    $recentClients = \App\Models\Client::latest('created_at')->take(4)->get()->map(function($client) {
        $time = $client->created_at ? \Carbon\Carbon::parse($client->created_at)->diffForHumans() : 'Unknown';
        return [
            'id' => 'c' . $client->id,
            'action' => 'New Client Registered',
            'name' => $client->nom ?? 'Unknown Client',
            'time' => $time,
            'status' => 'completed',
            'created_at' => $client->created_at
        ];
    });

    $recentProfiles = \App\Models\Profile::orderBy('id', 'desc')->take(4)->get()->map(function($profile) {
        // Handle profiles not casting created_at automatically
        $time = $profile->created_at ? \Carbon\Carbon::parse($profile->created_at)->diffForHumans() : 'Unknown';
        return [
            'id' => 'p' . $profile->id,
            'action' => 'New Profile Added',
            'name' => $profile->full_name,
            'time' => $time,
            'status' => 'completed',
            'created_at' => $profile->created_at
        ];
    });

    $recentActivity = $recentClients->concat($recentProfiles)
        ->sortByDesc('created_at')
        ->take(4)
        ->values();

    return Inertia::render('Dashboard', [
        'stats' => [
            'totalClients' => $totalClients,
            'activeProfiles' => $activeProfiles,
            'openAssignments' => $openAssignments,
            'monthlyRevenue' => '$' . number_format($monthlyRevenue, 2),
        ],
        'recentActivity' => $recentActivity
    ]);
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
