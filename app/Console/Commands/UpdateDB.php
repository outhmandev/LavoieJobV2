<?php

namespace App\Console\Commands;

use App\Models\Client;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class UpdateDB extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:update-db';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronize clients from the remote API';

    /**
     * Execute the console command.
     */ 
    public function handle(): int
{
    $this->components->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    $this->components->info('🚀 Starting client synchronization...');
    $this->components->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    $start = microtime(true);

    $endpoint = 'https://lavoiejob.ma/api/fetch';

    try {

        $this->line('🌐 Fetching remote API...');

        $response = Http::timeout(30)->get($endpoint);

        if (! $response->successful()) {
            $this->components->error('❌ Failed to fetch API.');

            return self::FAILURE;
        }

        $data = $response->json();

        if (! isset($data['clients']) || ! is_array($data['clients'])) {
            $this->components->error('❌ Invalid API response.');

            return self::FAILURE;
        }

        $clients = $data['clients'];

        $this->newLine();
        $this->info("📦 Found " . count($clients) . " clients.");
        $this->newLine();

        $bar = $this->output->createProgressBar(count($clients));
        $bar->setFormat(
            " %current%/%max% [%bar%] %percent:3s%%\n".
            " ⏳ %elapsed:6s% | ETA: %estimated:-6s%\n"
        );

        $bar->start();

        $created = 0;
        $updated = 0;

        foreach ($clients as $clientData) {

            $client = Client::where('mat', $clientData['c_mat'])->first();

            if ($client) {
                $client->update([
                    'm_mat' => $clientData['m_mat'],
                    'affectation' => $clientData['c_affectation'],
                    'reclamation' => $clientData['c_reclamation'],
                    'nom' => $clientData['c_nom'],
                    'mat' => $clientData['c_mat'],
                    'file_img' => $clientData['c_file_img'],
                    'statut' => $clientData['c_statut'],
                    'cin' => $clientData['c_cin'],
                    'cin_v' => $this->nullableDate($clientData['c_cin_v']),
                    'date_naissance' => $this->nullableDate($clientData['c_date_naissance']),
                    'nationalite' => $clientData['c_nationalite'],
                    'situation_fam' => $clientData['c_situation_fam'],
                    'n_enfant' => $clientData['c_n_enfant'],
                    'enfants_details' => $clientData['c_enfants_details'],
                    'adresse_cin' => $clientData['c_adresse_cin'],
                    'ville_o' => $clientData['c_ville_o'],
                    'adresse_act' => $clientData['c_adresse_act'],
                    'ville_a' => $clientData['c_ville_a'],
                    'logement' => $clientData['c_logement'],
                    'gsm1' => $clientData['c_gsm1'],
                    'gsm2' => $clientData['c_gsm2'],
                    'source' => $clientData['c_source'],
                    'csource' => $clientData['c_csource'],
                    'responsable' => $clientData['c_responsable'],
                    'fonction' => $clientData['c_fonction'],
                    'fonction_source' => $clientData['c_fonction_source'],
                    'criteres' => $clientData['c_criteres'],
                    'religion' => $clientData['c_p_religion'],
                    'prix_min' => $clientData['c_prix_min'],
                    'prix_max' => $clientData['c_prix_max'],
                    'prix_ech' => $clientData['c_prix_ech'],
                    'repos' => $clientData['c_repos'],
                    'experience' => $clientData['c_experience'],
                    'mode' => $clientData['c_mode'],
                    'honoraire' => $clientData['c_honoraire'],
                    'observation' => $clientData['c_observation'],
                    'inscription_date' => $this->nullableDate($clientData['c_inscription_date']),
                    'edit_date' => $this->nullableDate($clientData['c_edit_date']),
                    'presence_animaux' => $clientData['c_presence_animaux'],
                    'nombre_animaux' => $clientData['c_nombre_animaux'],
                    'animaux_details' => $clientData['c_animaux_details'],
                ]);

                $updated++;
            } else {

                Client::create([
                    'm_mat' => $clientData['m_mat'],
                    'affectation' => $clientData['c_affectation'],
                    'reclamation' => $clientData['c_reclamation'],
                    'nom' => $clientData['c_nom'],
                    'mat' => $clientData['c_mat'],
                    'file_img' => $clientData['c_file_img'],
                    'statut' => $clientData['c_statut'],
                    'cin' => $clientData['c_cin'],
                    'cin_v' => $this->nullableDate($clientData['c_cin_v']),
                    'date_naissance' => $this->nullableDate($clientData['c_date_naissance']),
                    'nationalite' => $clientData['c_nationalite'],
                    'situation_fam' => $clientData['c_situation_fam'],
                    'n_enfant' => $clientData['c_n_enfant'],
                    'enfants_details' => $clientData['c_enfants_details'],
                    'adresse_cin' => $clientData['c_adresse_cin'],
                    'ville_o' => $clientData['c_ville_o'],
                    'adresse_act' => $clientData['c_adresse_act'],
                    'ville_a' => $clientData['c_ville_a'],
                    'logement' => $clientData['c_logement'],
                    'gsm1' => $clientData['c_gsm1'],
                    'gsm2' => $clientData['c_gsm2'],
                    'source' => $clientData['c_source'],
                    'csource' => $clientData['c_csource'],
                    'responsable' => $clientData['c_responsable'],
                    'fonction' => $clientData['c_fonction'],
                    'fonction_source' => $clientData['c_fonction_source'],
                    'criteres' => $clientData['c_criteres'],
                    'religion' => $clientData['c_p_religion'],
                    'prix_min' => $clientData['c_prix_min'],
                    'prix_max' => $clientData['c_prix_max'],
                    'prix_ech' => $clientData['c_prix_ech'],
                    'repos' => $clientData['c_repos'],
                    'experience' => $clientData['c_experience'],
                    'mode' => $clientData['c_mode'],
                    'honoraire' => $clientData['c_honoraire'],
                    'observation' => $clientData['c_observation'],
                    'inscription_date' => $this->nullableDate($clientData['c_inscription_date']),
                    'edit_date' => $this->nullableDate($clientData['c_edit_date']),
                    'presence_animaux' => $clientData['c_presence_animaux'],
                    'nombre_animaux' => $clientData['c_nombre_animaux'],
                    'animaux_details' => $clientData['c_animaux_details'],
                ]);

                $created++;
            }

            $bar->advance();
        }

        $bar->finish();

        $time = round(microtime(true) - $start, 2);

        $this->newLine(2);

        $this->components->twoColumnDetail('✅ Created', $created);
        $this->components->twoColumnDetail('🔄 Updated', $updated);
        $this->components->twoColumnDetail('📦 Total', count($clients));
        $this->components->twoColumnDetail('⏱ Time', "{$time}s");

        $this->newLine();

        $this->components->info('🎉 Synchronization completed successfully!');

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