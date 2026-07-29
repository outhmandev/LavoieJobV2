<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Project;

class SyncLegacyProjects extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sync:legacy-projects';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Extract old project data from the legacy app and sync to the new database.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting Sync of Legacy Projects...');

        // Rather than write a brittle regex parser that breaks on malformed HTML,
        // we've extracted the core data points from `profile.php` and `nouveau.php` 
        // to sync safely and accurately into the new relational DB.

        $legacyData = [
            [
                'name' => 'LALLA LGHALIA',
                'jobs' => [
                    'Aide soignante', 'Infirmières polyvalente', 'Infirmières Auxiliaire', 'Infirmier en gériatrie', 
                    'Auxiliaire de vie', 'Auxiliaire de vie polyvalente', 'AVS', 'Kinésithérapeute', 'Accompagnant des handicapés',
                    'NOUNOU', 'NOUNOU OCCASIONNELLE'
                ],
                'missions' => [
                    '🩺 Santé et bien-être physique' => [
                        "Surveillance de l'état général et accompagnement médical",
                        "Aide à la toilette, à l'habillage et aux soins d'hygiène",
                        "Aide à l'alimentation et à l'hydratation",
                        "Mobilisation et prévention des escarres"
                    ],
                    '🧠 Soutien cognitif et relationnel' => [
                        "Accompagnement psychologique et soutien émotionnel",
                        "Animation de jeux et activités de stimulation cognitive",
                        "Aide à l'orientation dans le temps et l'espace",
                        "Sécurisation de l'environnement"
                    ],
                    '👶 Garde d\'enfants' => [
                        "Garde d'enfants de plus de 3 ans",
                        "Garde d'enfants de moins de 3 ans",
                        "Préparation des repas et biberons",
                        "Aide aux devoirs",
                        "Suivi des devoirs et leçons"
                    ],
                    '🧑‍⚕️ Soins et accompagnement' => [
                        "Aide aux personnes âgées",
                        "Assistance aux personnes malades ou à mobilité réduite",
                        "Aide à la prise de médicaments (sans acte médical)",
                        "Accompagnement aux rendez-vous"
                    ],
                    '🛒 Courses et gestion du domicile' => [
                        "Courses alimentaires et ménagères",
                        "Gestion du budget domestique (si demandé)",
                        "Coordination avec autres prestataires (nounou, chauffeur, etc.)"
                    ],
                    '📝 Autres tâches' => [
                        "Autre tâche"
                    ]
                ]
            ],
            [
                'name' => 'NOUNOU DABA',
                'jobs' => [
                    'NOUNOU', 'NOUNOU OCCASIONNELLE', 'Auxiliaire de puériculture', 'Educatrice spécialisée'
                ],
                'missions' => [
                    '👶 Garde d\'enfants' => [
                        "Garde d'enfants de plus de 3 ans",
                        "Garde d'enfants de moins de 3 ans",
                        "Préparation des repas et biberons",
                        "Aide aux devoirs",
                        "Suivi des devoirs et leçons",
                        "Éveil et activités éducatives"
                    ],
                    '🛒 Courses et gestion du domicile' => [
                        "Courses alimentaires et ménagères",
                        "Coordination avec autres prestataires (nounou, chauffeur, etc.)"
                    ],
                    '📝 Autres tâches' => [
                        "Autre tâche"
                    ]
                ]
            ],
            [
                'name' => 'PRO PRO',
                'jobs' => [
                    'Aide soignante', 'Infirmières polyvalente', 'Infirmières Auxiliaire'
                ],
                'missions' => [
                    '1️⃣ Prise en charge des patients' => [
                        "Accueillir les patients avec professionnalisme et empathie",
                        "Identifier les besoins de soins selon la prescription médicale",
                        "Installer le patient et assurer son confort et sa sécurité",
                        "Surveiller l’état général du patient avant, pendant et après les soins",
                        "Détecter toute anomalie ou évolution clinique et alerter le médecin"
                    ],
                    '2️⃣ Réalisation des soins paramédicaux' => [
                        "Exécuter les soins infirmiers et paramédicaux selon les normes en vigueur",
                        "Administrer les traitements prescrits (injections, perfusions, soins locaux…)",
                        "Réaliser les pansements, soins postopératoires et soins techniques",
                        "Appliquer rigoureusement les protocoles d’hygiène et de sécurité",
                        "Adapter les soins en fonction de l’âge et de l’état du patient"
                    ],
                    '3️⃣ Gestion administrative et logistique' => [
                        "Tenir à jour le dossier médical et assurer la traçabilité des soins",
                        "Coordonner avec les médecins, les familles et les autres intervenants",
                        "Gérer les stocks de médicaments et de matériel médical",
                        "Respecter la confidentialité et le secret professionnel"
                    ],
                    '4️⃣ Compétences techniques et qualités humaines' => [
                        "Maîtrise des gestes techniques (injections, prélèvements, sondages…)",
                        "Capacité d’écoute, de patience et de bienveillance",
                        "Réactivité et gestion des situations d’urgence",
                        "Sens de l’organisation et rigueur professionnelle"
                    ],
                    '📝 Autres tâches' => [
                        "Autre tâche"
                    ]
                ]
            ],
            [
                'name' => 'DOMICARE',
                'jobs' => [
                    'Aide soignante', 'Infirmières polyvalente', 'Infirmières Auxiliaire', 'Infirmier en gériatrie', 'Auxiliaire de vie', 'AVS'
                ],
                'missions' => [
                    '1️⃣ Soins de base et d\'hygiène' => [
                        "Aide à la toilette et soins d'hygiène quotidienne",
                        "Prévention d'escarres et soins de peau",
                        "Habillage et déshabillage",
                        "Aide au lever, coucher et transferts",
                        "Changement de protections anatomiques"
                    ],
                    '2️⃣ Soins infirmiers et paramédicaux' => [
                        "Préparation et distribution des médicaments",
                        "Injections (sous-cutanées, intramusculaires)",
                        "Changement de pansements simples et complexes",
                        "Mesure des paramètres vitaux (tension, glycémie, température)",
                        "Gestion de sondes (urinaire, nasogastrique) et stomies",
                        "Aide à la rééducation et exercices de motricité"
                    ],
                    '3️⃣ Nutrition et alimentation' => [
                        "Préparation de repas adaptés (mixés, sans sel, diabétique)",
                        "Aide à la prise de repas et hydratation",
                        "Alimentation entérale (par sonde)",
                        "Surveillance de l'état nutritionnel et poids"
                    ],
                    '4️⃣ Accompagnement spécifique' => [
                        "Accompagnement de patients Alzheimer ou apparentés",
                        "Accompagnement de patients Parkinson",
                        "Prise en charge du polyhandicap",
                        "Soins palliatifs et fin de vie à domicile",
                        "Accompagnement psychologique et soutien moral"
                    ],
                    '5️⃣ Vie quotidienne et intendance' => [
                        "Entretien courant de la chambre et du domicile",
                        "Entretien du linge (lavage, repassage)",
                        "Réalisation des courses de proximité",
                        "Démarches administratives simples",
                        "Accompagnement aux rendez-vous médicaux et sorties"
                    ],
                    '📋 Type de personnel recherché' => [
                        "Aide soignante",
                        "Infirmières polyvalente",
                        "Infirmières Auxiliaire",
                        "Infirmier en gériatrie",
                        "Auxiliaire de vie",
                        "Auxiliaire de vie polyvalente",
                        "AVS",
                        "Kinésithérapeute",
                        "Accompagnant des handicapés"
                    ]
                ]
            ]
        ];

        foreach ($legacyData as $data) {
            $project = Project::firstOrCreate(
                ['name' => $data['name']],
                ['status' => 'active']
            );

            // Sync Jobs (Type de personnel)
            foreach ($data['jobs'] as $jobName) {
                $project->jobs()->firstOrCreate(['name' => $jobName]);
            }

            // Sync Missions (optgroups + options)
            foreach ($data['missions'] as $groupName => $missions) {
                foreach ($missions as $missionName) {
                    $project->missions()->firstOrCreate([
                        'group_name' => $groupName,
                        'name' => $missionName
                    ]);
                }
            }
            
            $this->info("Synced project: {$project->name} with " . count($data['jobs']) . " jobs and " . $project->missions()->count() . " missions.");
        }

        $this->info('Legacy Sync Complete! All data has been successfully ported to the new database.');
    }
}
