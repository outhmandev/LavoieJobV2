<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\Profile;
use App\Models\Client;
use App\Models\Document;
use Carbon\Carbon;

class SyncLegacyDocumentsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'documents:sync';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync legacy documents (p_file_img and c_file_img) from API';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Fetching data from API...');
        $response = Http::get('https://www.lavoiejob.ma/api/fetch');

        if (!$response->successful()) {
            $this->error('Failed to fetch data from API.');
            return;
        }

        $data = $response->json();
        
        $profilesSyncCount = 0;
        if (isset($data['profiles']) && is_array($data['profiles'])) {
            foreach ($data['profiles'] as $legacyProfile) {
                if (!empty($legacyProfile['p_file_img'])) {
                    $profile = Profile::where('matricule', $legacyProfile['p_mat'])->first();
                    if ($profile) {
                        $exists = $profile->documents()->where('file_name', $legacyProfile['p_file_img'])->exists();
                        if (!$exists) {
                            $profile->documents()->create([
                                'type' => 'Image de profil',
                                'file_name' => $legacyProfile['p_file_img'],
                                'file_path' => 'legacy/' . $legacyProfile['p_file_img'],
                                'size' => 0,
                                'created_at' => !empty($legacyProfile['p_edit_date']) ? Carbon::parse($legacyProfile['p_edit_date']) : now(),
                            ]);
                            $profilesSyncCount++;
                        }
                    }
                }
            }
        }
        $this->info("Synced {$profilesSyncCount} profile documents.");

        $clientsSyncCount = 0;
        if (isset($data['clients']) && is_array($data['clients'])) {
            foreach ($data['clients'] as $legacyClient) {
                if (!empty($legacyClient['c_file_img'])) {
                    $client = Client::where('matricule', $legacyClient['c_mat'])->first();
                    if ($client) {
                        $exists = $client->documents()->where('file_name', $legacyClient['c_file_img'])->exists();
                        if (!$exists) {
                            $client->documents()->create([
                                'type' => 'Document Client',
                                'file_name' => $legacyClient['c_file_img'],
                                'file_path' => 'legacy/' . $legacyClient['c_file_img'],
                                'size' => 0,
                                'created_at' => !empty($legacyClient['c_edit_date']) ? Carbon::parse($legacyClient['c_edit_date']) : now(),
                            ]);
                            $clientsSyncCount++;
                        }
                    }
                }
            }
        }
        $this->info("Synced {$clientsSyncCount} client documents.");

        $this->info('Done!');
    }
}
