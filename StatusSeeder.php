<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StatusSeeder extends Seeder
{
    public function run(): void
    {
        $profileStatuses = ['Disponible', 'En Attente', 'Affecté(e)', 'Injoignable', 'Indisponible', 'Suggéré', 'Dossier incomplet', 'Black liste', 'Reclamation'];
        $clientStatuses = ['Prospect', 'En cours de traitement', 'Validé', 'En Attente', 'Suggéré', 'Reclamation', 'Rejet', 'Black liste'];

        foreach ($profileStatuses as $name) {
            DB::table('manageable_statuses')->updateOrInsert([
                'type' => 'profile',
                'name' => $name
            ], [
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        foreach ($clientStatuses as $name) {
            DB::table('manageable_statuses')->updateOrInsert([
                'type' => 'client',
                'name' => $name
            ], [
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }
}
