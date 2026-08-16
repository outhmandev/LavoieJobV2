<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Define default roles
        $roles = [
            'System Administrator',
            'Super Admin',
            'Admin',
            'Membre',
            'Client',
            'Marketing',
            'RH',
            'Gestion'
        ];

        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }

        // Migrate existing users to the new Spatie Role
        $users = User::all();
        foreach ($users as $user) {
            if (!empty($user->role)) {
                $roleExists = Role::where('name', $user->role)->first();
                if ($roleExists) {
                    $user->assignRole($user->role);
                }
            }
        }
    }
}
