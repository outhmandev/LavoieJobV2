<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Project;
use App\Models\ProjectMission;

class ProProMissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $projectNames = ['PRO PRO'];
        $project = Project::whereIn('name', $projectNames)->first();

        if (!$project) {
            $this->command->info('Project PRO PRO not found.');
            return;
        }

        // Wipe old missions for this project to start fresh
        ProjectMission::where('project_id', $project->id)->delete();

        $missionsData = [
            'Postes' => [
                'Agent de gardiennage',
                'Agent marketing',
                'Aide comptable',
                'Aide pharmacie',
                'Aide soignante',
                'Assistante dentaire',
                'Assistante de direction',
                'Assistante médicale',
                'Assistante vétérinaire',
                "Chef d'équipe",
                'Comptable',
                'Délégué médical',
                'Délégué pharmaceutique',
                'Femme de ménage',
                'Infirmière anesthésiste',
                'Infirmière auxiliaire',
                'Infirmière de bloc',
                'Infirmière spécialisée',
                'Infirmier de travail',
                'Infirmier(ère)',
                'Infirmier(ère) polyvalente',
                'Major de bloc',
                'Major de service',
                'Médecin',
                'Prothésiste dentaire',
                'Sage-femme',
                'Secrétaire médicale',
                'Technicien de laboratoire',
                'Technicien en radiologie'
            ]
        ];

        $count = 0;

        foreach ($missionsData as $groupName => $missions) {
            foreach ($missions as $missionName) {
                ProjectMission::create([
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
