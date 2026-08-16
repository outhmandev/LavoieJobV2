<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Project;
use App\Models\ProjectMission;

class LallaGhaliaMissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $projectNames = ['LALLA GHALIA', 'LALLA LGHALIA'];
        $project = Project::whereIn('name', $projectNames)->first();

        if (!$project) {
            $this->command->info('Project LALLA GHALIA not found.');
            return;
        }

        // Wipe old missions for this project to start fresh
        ProjectMission::where('project_id', $project->id)->delete();

        $missionsData = [
            'Nettoyage et entretien de la maison' => [
                'Nettoyage quotidien (sols, sanitaires, cuisine, chambres)',
                'Entretien en profondeur (vitres, tapis, rideaux, meubles)',
                'Gestion des produits ménagers et du matériel',
                'Respect des règles d’hygiène et d’organisation du domicile'
            ],
            'Repassage' => [
                'Repassage du linge courant',
                'Repassage de linge délicat (soie, laine, costumes, robes)',
                'Pliage et rangement du linge'
            ],
            'Cuisine' => [
                'Préparation des repas quotidiens',
                'Cuisine marocaine',
                'Cuisine internationale',
                'Régimes spécifiques (diabétique, sans sel, sans gluten, etc.)',
                'Gestion des menus et des stocks alimentaires'
            ],
            'Garde d’enfants' => [
                'Surveillance et sécurité des enfants',
                'Soins quotidiens (repas, toilette, sieste)',
                'Accompagnement à l’école et aux activités',
                'Activités éducatives et ludiques adaptées à l’âge'
            ],
            'Aide aux devoirs' => [
                'Accompagnement scolaire (primaire / collège)',
                'Aide à la lecture et à l’écriture',
                'Suivi des devoirs et leçons'
            ],
            'Soins et accompagnement' => [
                'Aide aux personnes âgées',
                'Assistance aux personnes malades ou à mobilité réduite',
                'Aide à la prise de médicaments (sans acte médical)',
                'Accompagnement aux rendez-vous'
            ],
            'Courses et gestion du domicile' => [
                'Courses alimentaires et ménagères',
                'Gestion du budget domestique (si demandé)',
                'Coordination avec autres prestataires (nounou, chauffeur, etc.)'
            ]
        ];

        $count = 0;

        foreach ($missionsData as $groupName => $missions) {
            foreach ($missions as $missionName) {
                ProjectMission::firstOrCreate([
                    'project_id' => $project->id,
                    'group_name' => $groupName,
                    'name' => $missionName
                ]);
                $count++;
            }
        }

        $this->command->info("Successfully seeded $count missions for project {$project->name}.");
    }
}
