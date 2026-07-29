<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Assignment;
use App\Models\Client;
use App\Models\Profile;
use App\Models\Project;
use App\Services\ContractGenerator;
use Illuminate\Support\Facades\DB;

DB::beginTransaction();

try {
    $project = Project::firstOrCreate(['name' => 'DOMICARE'], ['status' => 'active']);
    $client = Client::create([
        'c_nom' => 'Monsieur Test Client',
        'c_cin' => 'KB123456',
        'c_adresse_act' => '123 Rue de la Paix, Paris',
        'c_adresse_cin' => '123 Rue de la Paix, Paris',
        'project_id' => $project->id,
    ]);
    $profile = Profile::create([
        'full_name' => 'Jeanne Dupont',
        'cin' => 'AB98765',
        'job' => 'Infirmiere',
        'birth_date' => '1990-01-01',
        'cin_validity_date' => '2030-01-01',
    ]);
    
    $assignment = Assignment::create([
        'client_id' => $client->id,
        'profile_id' => $profile->id,
        'status' => 'completed',
        'agreed_price' => 5000,
        'payment_schedule' => 'par mois',
    ]);
    
    $generator = new ContractGenerator();
    $pdfOutput = $generator->generate($assignment);
    
    file_put_contents(__DIR__ . '/public/test_contract.pdf', $pdfOutput);
    echo "SUCCESS: public/test_contract.pdf\n";

} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n" . $e->getTraceAsString();
}

DB::rollBack();
