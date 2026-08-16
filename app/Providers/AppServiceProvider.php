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
        
        // Implicitly grant "System Administrator" all permissions.
        // Grant "Super Admin" all permissions EXCEPT 'strict_system_admin'.
        Gate::before(function ($user, $ability) {
            $isSysAdmin = strtolower($user->role ?? '') === 'system administrator' || $user->hasRole('System Administrator');
            $isSuperAdmin = in_array(strtolower($user->role ?? ''), ['super admin']) || $user->hasRole('Super Admin');
            
            if ($isSysAdmin) {
                return true;
            }

            if ($isSuperAdmin && $ability !== 'strict_system_admin') {
                return true;
            }
            
            return null;
        });

        // Defines who can access the System Configuration (Projects, Roles)
        Gate::define('system_admin', function ($user) {
            return in_array($user->role, ['System Administrator', 'super Admin', 'Super Admin'])
                || (method_exists($user, 'isSuperAdmin') && $user->isSuperAdmin());
        });

        // Strictly defines who can access high-level access management (Users/Team members)
        Gate::define('strict_system_admin', function ($user) {
            return strtolower($user->role ?? '') === 'system administrator';
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

        // Marketing access
        Gate::define('marketing_access', function ($user) {
            return in_array($user->role, ['System Administrator', 'Super Admin'])
                || $user->hasRole('Marketing')
                || (method_exists($user, 'isSuperAdmin') && $user->isSuperAdmin());
        });


        // Register Policies
        Gate::policy(\App\Models\ContractRequest::class, \App\Policies\ContractRequestPolicy::class);
    }
}

