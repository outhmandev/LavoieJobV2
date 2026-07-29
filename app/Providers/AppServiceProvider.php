<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        
        // Defines who can access the System Configuration (Projects & Roles mapping)
        Gate::define('system_admin', function ($user) {
            return in_array($user->role, ['System Administrator']);
        });

        // Defines who can access high-level admin tools (like managing other users)
        Gate::define('super_admin', function ($user) {
            return in_array($user->role, ['System Administrator', 'super Admin']);
        });

        // General admin gate (for general platform management, adding clients, etc.)
        Gate::define('admin', function ($user) {
            return in_array($user->role, ['System Administrator', 'super Admin', 'Admin']);
        });

        // Client portal access
        Gate::define('client_portal', function ($user) {
            return strtolower($user->role) === 'client';
        });
    }
}
