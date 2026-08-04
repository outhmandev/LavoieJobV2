<?php

namespace App\Console\Commands;

use App\Models\Profile;
use App\Models\Project;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class SyncProfile extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:sync-profile';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronize candidate profiles from the remote API';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->components->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->components->info('🚀 Starting profile synchronization...');
        $this->components->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        $start = microtime(true);
        $endpoint = 'https://lavoiejob.ma/api/fetch';

        try {
            $this->line('🌐 Fetching remote API...');

            $response = Http::timeout(60)->get($endpoint);

            if (!$response->successful()) {
                $this->components->error('❌ Failed to fetch API endpoint.');
                return self::FAILURE;
            }

            $data = $response->json();

            if (!isset($data['profiles']) || !is_array($data['profiles'])) {
                $this->components->error('❌ Invalid API response structure (profiles key missing).');
                return self::FAILURE;
            }

            $profilesData = $data['profiles'];
            $projects = Project::all();

            $this->newLine();
            $this->info("📦 Found " . count($profilesData) . " profiles.");
            $this->newLine();

            $bar = $this->output->createProgressBar(count($profilesData));
            $bar->setFormat(
                " %current%/%max% [%bar%] %percent:3s%%\n".
                " ⏳ %elapsed:6s% | ETA: %estimated:-6s%\n"
            );

            $bar->start();

            $created = 0;
            $updated = 0;

            foreach ($profilesData as $item) {
                $matricule = $item['p_mat'] ?? null;
                if (empty($matricule)) {
                    $bar->advance();
                    continue;
                }

                // Resolve project_id from p_fonction_source
                $projectId = null;
                if (!empty($item['p_fonction_source'])) {
                    $cleanSource = strtoupper(trim(str_replace(['_', "\r", "\n"], [' ', '', ' '], $item['p_fonction_source'])));
                    $cleanSource = preg_replace('/\s+/', ' ', $cleanSource);

                    $matchedProject = $projects->first(function ($p) use ($cleanSource) {
                        $cleanName = strtoupper(trim($p->name));
                        return $cleanSource === $cleanName || str_contains($cleanSource, $cleanName) || str_contains($cleanName, $cleanSource);
                    });

                    if ($matchedProject) {
                        $projectId = $matchedProject->id;
                    }
                }

                // Parse boolean flags safely
                $hasDiseases = false;
                if (!empty($item['p_maladie'])) {
                    $val = strtolower(trim((string)$item['p_maladie']));
                    $hasDiseases = in_array($val, ['1', 'true', 'oui', 'yes']);
                }

                $petAllergies = false;
                if (!empty($item['p_allergie_animaux'])) {
                    $val = strtolower(trim((string)$item['p_allergie_animaux']));
                    $petAllergies = in_array($val, ['1', 'true', 'oui', 'yes']);
                }

                $attributes = [
                    'project_id' => $projectId,
                    'matricule' => (string) $matricule,
                    'full_name' => $item['p_nom'] ?? '',
                    'avatar' => $item['p_file_img'] ?? null,
                    'status' => $item['p_statut'] ?? 'active',
                    'cin' => $item['p_cin'] ?? null,
                    'cin_validity' => $this->nullableDate($item['p_cin_v'] ?? null),
                    'birth_date' => $this->nullableDate($item['p_date_naissance'] ?? null),
                    'birth_city' => $item['p_ville_n'] ?? null,
                    'rate' => isset($item['p_rate']) ? (float)$item['p_rate'] : 0,
                    'nationality' => $item['p_nationalite'] ?? 'Maroc',
                    'religion' => $item['p_religion'] ?? null,
                    'education_level' => $item['p_niveau_etude'] ?? null,
                    'marital_status' => $item['p_situation_fam'] ?? null,
                    'children_count' => isset($item['p_n_enfant']) ? (int)$item['p_n_enfant'] : 0,
                    'children_details' => $item['p_enfants_details'] ?? null,
                    'cin_address' => $item['p_adresse_cin'] ?? null,
                    'origin_city' => $item['p_ville_o'] ?? null,
                    'current_address' => $item['p_adresse_act'] ?? null,
                    'current_city' => $item['p_ville_a'] ?? null,
                    'education_specialty' => $item['p_spe_etude'] ?? null,
                    'email' => $item['p_email'] ?? null,
                    'phone_1' => $item['p_gsm1'] ?? null,
                    'phone_2' => $item['p_gsm2'] ?? null,
                    'source' => $item['p_source'] ?? null,
                    'job' => $item['p_fonction'] ?? null,
                    'min_price' => isset($item['p_prix_min']) ? (float)$item['p_prix_min'] : null,
                    'max_price' => isset($item['p_prix_max']) ? (float)$item['p_prix_max'] : null,
                    'experience_years' => $item['p_experience'] ?? null,
                    'experience_details' => $item['p_experience_detail'] ?? null,
                    'has_diseases' => $hasDiseases,
                    'disease_details' => $item['p_maladie_details'] ?? null,
                    'mobility' => $item['p_mobilite'] ?? $item['p_mode'] ?? null,
                    'observation' => $item['p_observation'] ?? null,
                    'pet_allergies' => $petAllergies,
                    'allergy_details' => $item['p_allergies_details'] ?? null,
                    'criteria' => $item['p_criteres'] ?? null,
                    'attending_physician' => $item['p_nom_medecin'] ?? null,
                    'languages' => $item['p_langue'] ?? $item['p_langue_autre'] ?? null,
                ];

                $profile = Profile::where('matricule', (string)$matricule)->first();

                if ($profile) {
                    $profile->update($attributes);
                    $updated++;
                } else {
                    Profile::create($attributes);
                    $created++;
                }

                $bar->advance();
            }

            $bar->finish();
            $time = round(microtime(true) - $start, 2);

            $this->newLine(2);
            $this->components->twoColumnDetail('✅ Created', $created);
            $this->components->twoColumnDetail('🔄 Updated', $updated);
            $this->components->twoColumnDetail('📦 Total Profiles Processed', count($profilesData));
            $this->components->twoColumnDetail('⏱ Time', "{$time}s");
            $this->newLine();

            $this->components->info('🎉 Profile synchronization completed successfully!');

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

        if (str_starts_with($date, '0000-00-00')) {
            return null;
        }

        return $date;
    }
}
