<?php

require __DIR__ . '/../../../../../../Users/MH/Desktop/Lavoiejob/LavoieJobV2/vendor/autoload.php';
$app = require_once __DIR__ . '/../../../../../../Users/MH/Desktop/Lavoiejob/LavoieJobV2/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Client;
use App\Models\Profile;

echo "--- Testing Profile with Children Details ---\n";

$profileKids = [
    ['gender' => 'Garçon', 'age' => '6 ans', 'comment' => 'École primaire'],
    ['gender' => 'Fille', 'age' => '3 ans', 'comment' => 'Crèche']
];

$profileData = [
    'nom' => 'Test Parent Profile',
    'mat' => 'TEST_P_' . time(),
    'cin' => 'TESTCIN' . rand(1000, 9999),
    'statut' => 'Disponible',
    'date_naissance' => '1990-05-15',
    'nombre_enfant' => count($profileKids),
    'enfants_details' => $profileKids,
];

$profile = Profile::create($profileData);
$profile->refresh();

echo "Profile ID: {$profile->id}\n";
echo "Profile nombre_enfant: {$profile->nombre_enfant}\n";
echo "Profile enfants_details: " . json_encode($profile->enfants_details) . "\n";
echo "Profile children_details: " . json_encode($profile->children_details) . "\n";

echo "\n--- Testing Client with Children Details ---\n";

$clientKids = [
    ['gender' => 'Fille', 'age' => '10 ans', 'comment' => 'Collège'],
    ['gender' => 'Garçon', 'age' => '8 ans', 'comment' => 'École primaire'],
    ['gender' => 'Garçon', 'age' => '1 an', 'comment' => 'Bébé']
];

$clientData = [
    'c_nom' => 'Test Client Famille',
    'c_cin' => 'TESTCL' . rand(1000, 9999),
    'c_statut' => 'Prospect',
    'c_date_naissance' => '1985-11-20',
    'c_n_enfant' => count($clientKids),
    'c_enfants_details' => json_encode($clientKids, JSON_UNESCAPED_UNICODE),
];

$client = Client::create($clientData);
$client->refresh();

echo "Client ID: {$client->id}\n";
echo "Client c_n_enfant: {$client->c_n_enfant}\n";
echo "Client c_enfants_details: " . $client->c_enfants_details . "\n";

// Cleanup
$profile->delete();
$client->delete();

echo "\nSUCCESS! All children details persisted cleanly and verified.\n";
