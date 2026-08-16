<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>Seeding Statuses...</h1>";

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

try {
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    
    // We can just use the DB facade to insert them directly
    $profileStatuses = ['Disponible', 'En Attente', 'Affecté(e)', 'Injoignable', 'Indisponible', 'Suggéré', 'Dossier incomplet', 'Black liste', 'Reclamation'];
    $clientStatuses = ['Prospect', 'En cours de traitement', 'Validé', 'En Attente', 'Suggéré', 'Reclamation', 'Rejet', 'Black liste'];
    
    foreach ($profileStatuses as $name) {
        Illuminate\Support\Facades\DB::table('manageable_statuses')->updateOrInsert([
            'type' => 'profile',
            'name' => $name
        ], [
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }
    
    foreach ($clientStatuses as $name) {
        Illuminate\Support\Facades\DB::table('manageable_statuses')->updateOrInsert([
            'type' => 'client',
            'name' => $name
        ], [
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }
    
    echo "<pre>Successfully seeded statuses.</pre>";
} catch (\Exception $e) {
    echo "<h2>Exception:</h2>";
    echo "<pre>" . $e->getMessage() . "</pre>";
}
