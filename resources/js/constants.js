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
    'Islam',
    'Christianisme',
    'Judaïsme',
    'Bouddhisme',
    'Hindouisme',
    'Agnostique',
    'Athée',
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

export const C_MODE_OPTIONS = [
    "Couchante", "Non Couchante", "Stage", "Plein temps", "Temps partiel", 
    "Freelance", "CDD", "CDI", "Job Etudiant", "Contrat pro", "Télétravail", 
    "Mission intérim", "Saisonnier", "Bénévolat", "Consultant", "Volontariat"
];

export const C_TYPE_CONTRAT_OPTIONS = [
    "CDI", "CDD", "Intérim", "Anapec", "Apprentissage", "Professionnalisation", 
    "Temps partiel", "Saisonnier", "Job étudiant", "Free-lance"
];

export const C_EXPERIENCE_OPTIONS = [
    "18 - 20 ans", "20 – 25 ans", "26 – 30 ans", "31 – 40 ans", "41 – 50 ans", 
    "Plus de 50 ans", "Indifférent"
];
