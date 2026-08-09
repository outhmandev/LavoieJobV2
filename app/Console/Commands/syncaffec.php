<?php

namespace App\Console\Commands;

use App\Models\Assignment;
use App\Models\Client;
use App\Models\Profile;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class syncaffec extends Command
{
    protected $signature = 'app:syncaffec';

    protected $description = 'Synchronize assignments from the remote API';

    public function handle(): int
    {
        $this->components->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->components->info('🚀 Starting assignment synchronization...');
        $this->components->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        $start = microtime(true);
        $endpoint = 'https://lavoiejob.ma/api/fetch';

        try {
            $this->line('🌐 Fetching remote API...');

            $response = Http::timeout(60)->get($endpoint);

            if (! $response->successful()) {
                $this->components->error('Unable to fetch API.');
                return self::FAILURE;
            }

            $data = $response->json();

            if (! isset($data['allaffects']) || ! is_array($data['allaffects'])) {
                $this->components->error('Invalid API response (allaffects key missing).');
                return self::FAILURE;
            }

            $rows = $data['allaffects'];

            $this->newLine();
            $this->info('📦 Found ' . count($rows) . ' assignments.');
            $this->newLine();

            $bar = $this->output->createProgressBar(count($rows));
            $bar->setFormat(
                " %current%/%max% [%bar%] %percent:3s%%\n".
                " ⏳ %elapsed:6s% | ETA: %estimated:-6s%\n"
            );
            $bar->start();

            // Cache existing clients & profiles for high performance
            $clientsByMat = Client::whereNotNull('mat')->get()->keyBy(fn ($c) => (string) $c->mat);
            $clientsById  = Client::all()->keyBy('id');

            $profilesByMat = Profile::whereNotNull('matricule')->get()->keyBy(fn ($p) => (string) $p->matricule);
            $profilesById  = Profile::all()->keyBy('id');

            $created = 0;
            $updated = 0;
            $skipped = 0;

            foreach ($rows as $item) {
                $legacyId = $item['id'] ?? null;
                $cMat = isset($item['c_mat']) ? (string) $item['c_mat'] : null;
                $pMat = isset($item['p_mat']) ? (string) $item['p_mat'] : null;

                $client = ($cMat && isset($clientsByMat[$cMat]))
                    ? $clientsByMat[$cMat]
                    : ($cMat && isset($clientsById[$cMat]) ? $clientsById[$cMat] : null);

                $profile = ($pMat && isset($profilesByMat[$pMat]))
                    ? $profilesByMat[$pMat]
                    : ($pMat && isset($profilesById[$pMat]) ? $profilesById[$pMat] : null);

                // Skip if client or profile cannot be resolved
                if (! $client || ! $profile) {
                    $skipped++;
                    $bar->advance();
                    continue;
                }

                $attributes = [
                    'client_id'        => $client->id,
                    'profile_id'       => $profile->id,
                    'status'           => $item['affec_statut'] ?? 'active',
                    'start_date'       => $this->nullableDate($item['affec_start'] ?? null),
                    'end_date'         => $this->nullableDate($item['affec_end'] ?? null),
                    'agreed_price'     => isset($item['affec_prix']) && is_numeric($item['affec_prix']) ? (float) $item['affec_prix'] : null,
                    'payment_schedule' => !empty($item['affec_prix_ech']) ? trim($item['affec_prix_ech']) : null,
                    'rest_days'        => !empty($item['affec_repos']) ? trim($item['affec_repos']) : null,
                    'employment_type'  => !empty($item['affec_mode']) ? trim($item['affec_mode']) : null,
                    'notes'            => !empty($item['affec_note']) ? trim($item['affec_note']) : null,
                ];

                if ($legacyId) {
                    $assignment = Assignment::updateOrCreate(
                        ['legacy_id' => $legacyId],
                        $attributes
                    );
                } else {
                    $assignment = Assignment::updateOrCreate(
                        [
                            'client_id'  => $client->id,
                            'profile_id' => $profile->id,
                            'start_date' => $attributes['start_date'],
                        ],
                        $attributes
                    );
                }

                if ($assignment->wasRecentlyCreated) {
                    $created++;
                } else {
                    $updated++;
                }

                $bar->advance();
            }

            $bar->finish();

            $time = round(microtime(true) - $start, 2);

            $this->newLine(2);
            $this->components->twoColumnDetail('Created', (string) $created);
            $this->components->twoColumnDetail('Updated', (string) $updated);
            $this->components->twoColumnDetail('Skipped (missing client/profile)', (string) $skipped);
            $this->components->twoColumnDetail('Processed', (string) count($rows));
            $this->components->twoColumnDetail('Time', "{$time}s");

            $this->components->info('Synchronization completed.');

            return self::SUCCESS;

        } catch (\Throwable $e) {
            $this->newLine();
            $this->components->error($e->getMessage());

            return self::FAILURE;
        }
    }

    private function nullableDate(?string $date): ?string
    {
        if (empty($date)) {
            return null;
        }

        $date = trim($date);

        if ($date === '0000-00-00' || str_starts_with($date, '0000-00-00')) {
            return null;
        }

        return $date;
    }
}