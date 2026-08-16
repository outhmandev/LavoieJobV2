<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\Reclamation;
use App\Models\Client;
use Carbon\Carbon;

class SyncReclamationsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reclamations:sync';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch and sync reclamations from lavoiejob API';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("Fetching data from API...");
        
        try {
            $response = Http::get('https://www.lavoiejob.ma/api/fetch');
            
            if (!$response->successful()) {
                $this->error("Failed to fetch data from API. Status: " . $response->status());
                return;
            }
            
            $data = $response->json();
            
            if (!isset($data['allrecs']) || !is_array($data['allrecs'])) {
                $this->error("Invalid format: 'allrecs' key missing or not an array.");
                return;
            }
            
            $reclamations = $data['allrecs'];
            $count = count($reclamations);
            $this->info("Found $count reclamations. Syncing...");
            
            $syncedCount = 0;
            $skippedCount = 0;
            
            $bar = $this->output->createProgressBar($count);
            $bar->start();
            
            foreach ($reclamations as $rec) {
                // Find local client by mat (which corresponds to c_mat in remote)
                $client = Client::where('mat', $rec['c_mat'])->first();
                $profile = \App\Models\Profile::where('matricule', (string)$rec['p_mat'])->first();
                
                if ($client) {
                    $resolu = (strtolower(trim($rec['recla_resolu'])) === 'oui');
                    $dateReclamationStr = $rec['recla_date'];
                    $dateReclamation = ($dateReclamationStr && $dateReclamationStr !== '0000-00-00 00:00:00') 
                        ? Carbon::parse($dateReclamationStr) 
                        : now();
                    
                    Reclamation::updateOrCreate(
                        ['legacy_id' => $rec['id']],
                        [
                            'client_id' => $client->id,
                            'profile_id' => $profile ? $profile->id : null,
                            'profil_litigieux' => $rec['recla_projet'] ?: null,
                            'description' => $rec['recla_note'],
                            'resolu' => $resolu,
                            'date_reclamation' => $dateReclamation,
                            'created_at' => $dateReclamation,
                            'updated_at' => $dateReclamation,
                        ]
                    );
                    $syncedCount++;
                } else {
                    $skippedCount++;
                }
                
                $bar->advance();
            }
            
            $bar->finish();
            $this->newLine();
            $this->info("Sync completed! Synced: $syncedCount | Skipped (Client not found): $skippedCount");
            
        } catch (\Exception $e) {
            $this->error("Error syncing: " . $e->getMessage());
        }
    }
}
