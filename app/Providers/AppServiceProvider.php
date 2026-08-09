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
        
        // Defines who can access the System Configuration (Projects, Users, Roles)
        Gate::define('system_admin', function ($user) {
            return in_array($user->role, ['System Administrator', 'super Admin', 'Super Admin'])
                || (method_exists($user, 'isSuperAdmin') && $user->isSuperAdmin());
        });

        // Defines who can access high-level admin tools (like managing other users)
        Gate::define('super_admin', function ($user) {
            return in_array($user->role, ['System Administrator', 'super Admin', 'Super Admin'])
                || (method_exists($user, 'isSuperAdmin') && $user->isSuperAdmin());
        });

        // General admin gate (for general platform management, adding clients, etc.)
        Gate::define('admin', function ($user) {
            return in_array($user->role, ['System Administrator', 'super Admin', 'Super Admin', 'Admin', 'admin'])
                || (method_exists($user, 'isAdmin') && $user->isAdmin());
        });

        // Client portal access
        Gate::define('client_portal', function ($user) {
            return strtolower($user->role ?? '') === 'client';
        });


        // Register Policies
        Gate::policy(\App\Models\ContractRequest::class, \App\Policies\ContractRequestPolicy::class);
    }
}

