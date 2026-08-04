export const PROFILE_STATUSES = [
    'Disponible',
    'En Attente',
    'Affecté(e)',
    'Injoignable',
    'Indisponible',
    'Suggéré',
    'Dossier incomplet',
    'Black liste',
    'Reclamation',
    'SUPPRIMER',
];

export const CLIENT_STATUSES = [
    'Prospect',
    'En cours de traitement',
    'Validé',
    'En Attente',
    'Suggéré',
    'Reclamation',
    'Rejet',
    'Black liste',
];

export const RECRUITMENT_SOURCES = [
    'Facebook',
    'Recommendation',
    'Site Web',
    'Instagram',
    'LinkedIn',
    'Bouche à oreille',
    'Autre',
];

export const SPOKEN_LANGUAGES = [
    'Arabe',
    'Français',
    'Anglais',
    'Espagnol',
    'Amazigh',
    'Autre',
];

export const RELIGIONS = [
    'Agnostic',
    'Atheiste',
    'Buddhisme',
    'Christianisme',
    'Hinduisme',
    'Islam',
    'Judaisme',
    'Non religieux',
    'Autre',
];

export const EDUCATION_LEVELS = [
    'Néant',
    'Primaire',
    'Collège',
    'Lycée',
    'Niveau BAC',
    'BAC',
    'BAC +2',
    'BAC +3',
    'BAC +4',
    'BAC +5',
    'BAC +6',
    'Doctorat',
];

export const SALARY_PERIODS = [
    'Hebdomadaire',
    'Quinzaine',
    'Mensuel',
];

export const ANIMAL_ALLERGIES_TYPES = [
    'Chats',
    'Chiens',
    'Oiseaux',
    'Rongeurs',
    'Autre',
];

export const EDUCATION_SPECIALTIES = [
    'Agronomie',
    'Architecture',
    'Art',
    'Biologie',
    'Chimie',
    'Communication',
    'Design',
    'Droit',
    'Éducation',
    'Finance',
    'Géographie',
    'Gestion',
    'Histoire',
    'Ingénierie',
    'Informatique',
    'Langues',
    'Littérature',
    'Logistique',
    'Marketing',
    'Mathématiques',
    'Médecine',
    'Musique',
    'Néant',
    'Pharmacie',
    'Physique',
    'Psychologie',
    'Qualité',
    'Ressources Humaines',
    'Santé et Paramédical',
    'Sciences Économiques',
    'Sciences Politiques',
    'Sociologie',
    'Théâtre',
    'Tourisme',
];

export function getProfileStatusBadgeClass(status) {
    return 'text-gray-700 dark:text-gray-300 font-medium';
}

export function getClientStatusBadgeClass(status) {
    return 'text-gray-700 dark:text-gray-300 font-medium';
}
