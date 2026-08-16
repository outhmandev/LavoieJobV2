<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'outhmane.hajli@lavoiejob.ma'],
            ['name' => 'Outhmane Hajli', 'password' => bcrypt('password')]
        );

        $this->call([
            ProjectSeeder::class,
            RoleSeeder::class,
            LallaGhaliaMissionsSeeder::class,
            ProProMissionsSeeder::class,
            SettingsSeeder::class,
        ]);

        $user->assignRole('System Administrator');
    }
}
