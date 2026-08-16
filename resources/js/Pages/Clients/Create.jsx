import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import CinCheckInput from '@/Components/CinCheckInput';
import ChildrenDetailsEditor from '@/Components/ChildrenDetailsEditor';
import LanguageSelector from '@/Components/LanguageSelector';
import DomesticAnimalsSelector from '@/Components/DomesticAnimalsSelector';
import DynamicSelect from '@/Components/DynamicSelect';
import DiseaseSelector from '@/Components/DiseaseSelector';
import GroupedMissionsManager from '@/Components/GroupedMissionsManager';
import { FiArrowLeft, FiSave, FiCheckCircle, FiChevronRight, FiChevronLeft, FiUser, FiMapPin, FiBriefcase, FiHeart, FiFileText } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CLIENT_STATUSES, RECRUITMENT_SOURCES, C_MODE_OPTIONS, C_TYPE_CONTRAT_OPTIONS, C_EXPERIENCE_OPTIONS } from '@/constants';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}


const standardSteps = [
    { id: 1, name: 'Identité', icon: FiUser },
    { id: 2, name: 'Contact & Logement', icon: FiMapPin },
    { id: 3, name: 'Projet & Critères', icon: FiBriefcase },
    { id: 4, name: 'Médical', icon: FiHeart },
];

const domicareSteps = [
    { id: 1, name: 'Demandeur', icon: FiUser },
    { id: 2, name: 'Patient', icon: FiUser },
    { id: 3, name: 'Médical', icon: FiHeart },
    { id: 4, name: 'Demande', icon: FiFileText },
];


export default function Create({ projects = [], statuses = [], nextMatricule = 1000 }) {
    const availableStatuses = statuses || [];

    const { data, setData, post, processing, errors } = useForm({
        c_nom: '', 
        mat: nextMatricule || '',
        c_mat: nextMatricule || '',
        project_id: '', 
        c_fonction: '', 
        statut: 'Prospect', 
        c_statut: 'Prospect', 
        status: 'Prospect',
        c_cin: '', 
        c_cin_v: '', 
        c_date_naissance: '', 
        c_nationalite: 'Maroc', 
        c_situation_fam: '',
        c_gsm1: '', 
        c_gsm2: '', 
        c_ville_o: '', 
        c_ville_a: '', 
        c_adresse_cin: '', 
        c_adresse_act: '',
        c_logement: '',
        domicare_data: {
            // Demandeur
            lien_patient: '',
            // Patient
            patient_nom: '',
            patient_cin: '',
            patient_assurance: '',
            patient_age: '',
            patient_nationalite: 'Marocaine',
            patient_adresse: '',
            patient_ville: '',
            patient_gsm1: '',
            patient_gsm2: '',
            patient_situation_mat: '',
            patient_situation_vie: '',
            patient_profil: '',
            patient_autonomie: '',
            // Medical
            conscience: '',
            respiration: '',
            fatigue: 'Non',
            douleur: 'Non',
            etat_psy: '',
            memoire: '',
            etat_cutane: '',
            continence: '',
            nutrition: '',
            // Demande
            motif_appel: '',
            ambulance: 'Non',
            autres_besoins: '',
            profil_recherche: '',
            urgence: '',
        }, 
        c_n_enfant: 0, 
        c_enfants_details: '',
        missions: [],
        languages: '',
        mobility: 'Oui',
        c_presence_animaux: 'Non', 
        c_nombre_animaux: 0, 
        c_animaux_details: '',
        allergies: '', 
        treatment: '', 
        attending_physician: '',
        c_source: '', 
        c_prix_min: '', 
        c_prix_max: '', 
        c_observation: '',
        c_mode: '',
        c_type_contrat: '',
        c_experience: '',
        blacklist_motif: '',
    });

    const [currentStep, setCurrentStep] = useState(1);
    const isDomicare = selectedProject?.name === "DOMICARE";
    const steps = isDomicare ? domicareSteps : standardSteps;
    const [selectedProject, setSelectedProject] = useState(null);

    const handleProjectChange = (e) => {
        const pId = e.target.value;
        setData('project_id', pId);
        const proj = projects.find(p => p.id == pId);
        setSelectedProject(proj);
        setData(prev => ({ ...prev, project_id: pId, c_fonction: '', missions: [] }));
    };

    const handleMissionToggle = (missionName) => {
        const isSelected = (data.missions || []).includes(missionName);
        if (isSelected) {
            setData('missions', data.missions.filter(m => m !== missionName));
        } else {
            setData('missions', [...(data.missions || []), missionName]);
        }
    };

    const submit = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (currentStep !== steps.length) {
            return;
        }
        post(route('clients.store'));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    // Animation Variants
    const slideVariants = {
        enter: (direction) => ({
            x: 0,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: 0,
            opacity: 0
        })
    };
    const [[page, direction], setPage] = useState([1, 0]);

    const navigateStep = (newStep) => {
        setPage([newStep, newStep > currentStep ? 1 : -1]);
        setCurrentStep(newStep);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('clients.index')} className="p-2.5 bg-white/5 dark:bg-gray-800/50  rounded-xl shadow-sm border border-gray-200/20 dark:border-gray-700/50 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all hover:scale-105">
                            <FiArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                                Nouveau Client
                            </h2>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-sm font-medium text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-5 py-2 rounded-full shadow-sm">
                        <FiCheckCircle size={16} /> Connexion Sécurisée
                    </div>
                </div>
            }
        >
            <Head title="Créer un Client" />

            <div className="max-w-6xl mx-auto pb-20 pt-8">

                
                {/* Project Selection (Global) */}
                <div className="bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 mb-8 shadow-sm flex flex-col md:flex-row items-center gap-6 z-20 relative">
                    <div className="p-4 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                        <FiBriefcase size={24} />
                    </div>
                    <div className="flex-1 w-full space-y-2">
                        <InputLabel value="Projet Associé (Requis pour commencer)" className="text-gray-700 dark:text-gray-300 font-bold text-lg" />
                        <select 
                            value={data.project_id} 
                            onChange={handleProjectChange} 
                            className="w-full bg-gray-50 dark:bg-gray-800 border-emerald-300 dark:border-emerald-700 focus:ring-emerald-500 rounded-xl text-gray-800 dark:text-gray-200 font-medium h-14 shadow-sm text-lg" 
                            required
                        >
                            <option value="">-- Sélectionnez d'abord un projet --</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                </div>

                {!selectedProject && (
                    <div className="text-center p-12 bg-white/50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 backdrop-blur-sm">
                        <FiBriefcase size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400">Veuillez sélectionner un projet pour commencer.</h3>
                    </div>
                )}

                {selectedProject && (
                    <>

                {/* Stepper Header */}
                <div className="mb-10 relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full -z-10 transform -translate-y-1/2"></div>
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700 ease-out -z-10 transform -translate-y-1/2"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    ></div>

                    <div className="flex justify-between relative z-10 px-2">
                        {steps.map((step) => {
                            const isCompleted = currentStep > step.id;
                            const isCurrent = currentStep === step.id;
                            const Icon = step.icon;

                            return (
                                <div key={step.id} className="flex flex-col items-center" onClick={() => navigateStep(step.id)}>
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 border-2",
                                            isCompleted ? "bg-indigo-600 border-indigo-600 text-white" :
                                                isCurrent ? "bg-white dark:bg-gray-900 border-indigo-500 text-indigo-500 shadow-indigo-500/30" :
                                                    "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400"
                                        )}
                                    >
                                        <Icon size={20} strokeWidth={isCurrent || isCompleted ? 2.5 : 2} />
                                    </motion.button>
                                    <span className={cn(
                                        "mt-3 text-xs md:text-sm font-bold transition-colors",
                                        isCurrent ? "text-indigo-600 dark:text-indigo-400" :
                                            isCompleted ? "text-gray-900 dark:text-gray-200" :
                                                "text-gray-400 dark:text-gray-500"
                                    )}>
                                        {step.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Form Container with Glassmorphism */}
                <div className="relative bg-white dark:bg-gray-900  border border-white/20 dark:border-gray-800/50 shadow-xl rounded-[2rem] overflow-hidden">


                    <form onSubmit={submit} onKeyDown={handleKeyDown} className="relative z-10">
                        {Object.keys(errors).length > 0 && (
                            <div className="mx-8 mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl">
                                <p className="text-red-600 dark:text-red-400 font-bold mb-1">Attention, le formulaire contient des erreurs :</p>
                                <ul className="list-disc list-inside text-sm text-red-500 dark:text-red-400/80">
                                    {Object.values(errors).map((err, idx) => (
                                        <li key={idx}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="min-h-[400px] p-8 md:p-12 overflow-hidden">
                            <AnimatePresence initial={false} custom={direction} mode="wait">
                                <motion.div
                                    key={page}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.2 }}
                                >
                                    
                                    {/* DOMICARE - STEP 1 : Demandeur */}
                                    {isDomicare && currentStep === 1 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="md:col-span-2 flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400"><FiUser size={20} /></div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Informations Demandeur</h3>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <InputLabel value="Nom et prénom *" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.c_nom} onChange={e => setData('c_nom', e.target.value)} className="w-full" required />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="Lien avec le patient" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.domicare_data.lien_patient} onChange={e => setData('domicare_data', {...data.domicare_data, lien_patient: e.target.value})} className="w-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="Statut (Demandeur)" className="text-gray-600 dark:text-gray-400" />
                                                <select value={data.statut} onChange={e => {setData('statut', e.target.value); setData('status', e.target.value); setData('c_statut', e.target.value);}} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200/50 dark:border-gray-700/50 rounded-xl text-gray-700 dark:text-gray-300">
                                                    {availableStatuses.map(st => <option key={st} value={st}>{st}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="CIN ou Pass" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.c_cin} onChange={e => setData('c_cin', e.target.value)} className="w-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="Adresse actuelle" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.c_adresse_act} onChange={e => setData('c_adresse_act', e.target.value)} className="w-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="Mail" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput type="email" value={data.c_email} onChange={e => setData('c_email', e.target.value)} className="w-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="GSM 1 *" className="text-gray-600 dark:text-gray-400 font-bold" />
                                                <TextInput value={data.c_gsm1} onChange={e => setData('c_gsm1', e.target.value)} className="w-full" required />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="GSM 2 (si possible)" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.c_gsm2} onChange={e => setData('c_gsm2', e.target.value)} className="w-full" />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <InputLabel value="Source" className="text-gray-600 dark:text-gray-400" />
                                                <DynamicSelect value={data.c_source} onChange={val => setData('c_source', val)} options={RECRUITMENT_SOURCES} className="w-full h-[42px]" />
                                            </div>
                                        </div>
                                    )}

                                    {/* DOMICARE - STEP 2 : Patient */}
                                    {isDomicare && currentStep === 2 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2 flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400"><FiUser size={20} /></div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Informations Patient</h3>
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Nom et prénom du patient" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.domicare_data.patient_nom} onChange={e => setData('domicare_data', {...data.domicare_data, patient_nom: e.target.value})} className="w-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="CIN / PAS" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.domicare_data.patient_cin} onChange={e => setData('domicare_data', {...data.domicare_data, patient_cin: e.target.value})} className="w-full" />
                                            </div>
                                            <div className="space-y-2 md:col-span-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                                <InputLabel value="Affiliation à un régime d'assurance obligatoire" className="text-gray-600 dark:text-gray-400 mb-2 font-bold" />
                                                <div className="flex flex-wrap gap-4">
                                                    {['CNOPS', 'CNSS', 'AMO', 'Non'].map(opt => (
                                                        <label key={opt} className="flex items-center gap-2 cursor-pointer p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                                            <input type="radio" name="assurance" value={opt} checked={data.domicare_data.patient_assurance === opt} onChange={e => setData('domicare_data', {...data.domicare_data, patient_assurance: e.target.value})} className="text-indigo-600 focus:ring-indigo-500" />
                                                            <span className="text-gray-700 dark:text-gray-300 font-medium">{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="Âge" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.domicare_data.patient_age} onChange={e => setData('domicare_data', {...data.domicare_data, patient_age: e.target.value})} className="w-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="Nationalité" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.domicare_data.patient_nationalite} onChange={e => setData('domicare_data', {...data.domicare_data, patient_nationalite: e.target.value})} className="w-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="Adresse actuelle" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.domicare_data.patient_adresse} onChange={e => setData('domicare_data', {...data.domicare_data, patient_adresse: e.target.value})} className="w-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="Ville" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.domicare_data.patient_ville} onChange={e => setData('domicare_data', {...data.domicare_data, patient_ville: e.target.value})} className="w-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="GSM 1 (Patient)" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.domicare_data.patient_gsm1} onChange={e => setData('domicare_data', {...data.domicare_data, patient_gsm1: e.target.value})} className="w-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="GSM 2 (Patient)" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.domicare_data.patient_gsm2} onChange={e => setData('domicare_data', {...data.domicare_data, patient_gsm2: e.target.value})} className="w-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="Situation matrimoniale" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.domicare_data.patient_situation_mat} onChange={e => setData('domicare_data', {...data.domicare_data, patient_situation_mat: e.target.value})} className="w-full" />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="Situation de vie" className="text-gray-600 dark:text-gray-400" />
                                                <select value={data.domicare_data.patient_situation_vie} onChange={e => setData('domicare_data', {...data.domicare_data, patient_situation_vie: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200/50 dark:border-gray-700/50 rounded-xl text-gray-700 dark:text-gray-300">
                                                    <option value="">-- Sélectionnez --</option>
                                                    <option value="Vit seul(e)">Vit seul(e)</option>
                                                    <option value="Vit avec la famille">Vit avec la famille</option>
                                                    <option value="Autre">Autre (à préciser dans observation)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <InputLabel value="Profil du patient" className="text-gray-600 dark:text-gray-400 font-bold" />
                                                <div className="flex flex-wrap gap-3">
                                                    {['Personne âgée', 'Opéré', 'Malade chronique', 'Porteur prothèse/plâtre', 'Autre'].map(opt => (
                                                        <label key={opt} className="flex items-center gap-2 p-2 px-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                                                            <input type="radio" name="profil_pat" value={opt} checked={data.domicare_data.patient_profil === opt} onChange={e => setData('domicare_data', {...data.domicare_data, patient_profil: e.target.value})} className="text-indigo-600" />
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <InputLabel value="Autonomie du patient" className="text-gray-600 dark:text-gray-400 font-bold" />
                                                <div className="flex flex-wrap gap-3">
                                                    {['Totalement dépendant (Alité)', 'Semi-autonome', 'Autonome'].map(opt => (
                                                        <label key={opt} className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex-1 justify-center">
                                                            <input type="radio" name="autonomie" value={opt} checked={data.domicare_data.patient_autonomie === opt} onChange={e => setData('domicare_data', {...data.domicare_data, patient_autonomie: e.target.value})} className="text-emerald-600" />
                                                            <span className="font-semibold text-gray-700 dark:text-gray-300">{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* DOMICARE - STEP 3 : Médical */}
                                    {isDomicare && currentStep === 3 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2 flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-rose-100 dark:bg-rose-500/20 rounded-lg text-rose-600 dark:text-rose-400"><FiHeart size={20} /></div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Informations Médicales (Patient)</h3>
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="Allergie" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.allergies} onChange={e => setData('allergies', e.target.value)} className="w-full" placeholder="Précisez si oui..." />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="Médecin traitant" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.attending_physician} onChange={e => setData('attending_physician', e.target.value)} className="w-full" />
                                            </div>
                                            
                                            <div className="md:col-span-2 mt-4 p-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-xl">
                                                <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">L'évaluation de l'état du bénéficiaire</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <InputLabel value="Conscience" className="text-gray-600 dark:text-gray-400" />
                                                        <TextInput value={data.domicare_data.conscience} onChange={e => setData('domicare_data', {...data.domicare_data, conscience: e.target.value})} className="w-full" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <InputLabel value="Respiration" className="text-gray-600 dark:text-gray-400" />
                                                        <TextInput value={data.domicare_data.respiration} onChange={e => setData('domicare_data', {...data.domicare_data, respiration: e.target.value})} className="w-full" />
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        <InputLabel value="Fatigue" className="text-gray-600 dark:text-gray-400" />
                                                        <select value={data.domicare_data.fatigue} onChange={e => setData('domicare_data', {...data.domicare_data, fatigue: e.target.value})} className="w-full bg-white dark:bg-gray-800 rounded-lg">
                                                            <option value="Non">Non</option><option value="Oui">Oui</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <InputLabel value="Douleur" className="text-gray-600 dark:text-gray-400" />
                                                        <select value={data.domicare_data.douleur} onChange={e => setData('domicare_data', {...data.domicare_data, douleur: e.target.value})} className="w-full bg-white dark:bg-gray-800 rounded-lg">
                                                            <option value="Non">Non</option><option value="Oui">Oui</option>
                                                        </select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <InputLabel value="État psychologique" className="text-gray-600 dark:text-gray-400" />
                                                        <TextInput value={data.domicare_data.etat_psy} onChange={e => setData('domicare_data', {...data.domicare_data, etat_psy: e.target.value})} className="w-full" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <InputLabel value="Mémoire" className="text-gray-600 dark:text-gray-400" />
                                                        <TextInput value={data.domicare_data.memoire} onChange={e => setData('domicare_data', {...data.domicare_data, memoire: e.target.value})} className="w-full" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <InputLabel value="Etat cutanée" className="text-gray-600 dark:text-gray-400" />
                                                        <TextInput value={data.domicare_data.etat_cutane} onChange={e => setData('domicare_data', {...data.domicare_data, etat_cutane: e.target.value})} className="w-full" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <InputLabel value="Continence" className="text-gray-600 dark:text-gray-400" />
                                                        <TextInput value={data.domicare_data.continence} onChange={e => setData('domicare_data', {...data.domicare_data, continence: e.target.value})} className="w-full" />
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <InputLabel value="Nutrition et hydratation" className="text-gray-600 dark:text-gray-400" />
                                                        <TextInput value={data.domicare_data.nutrition} onChange={e => setData('domicare_data', {...data.domicare_data, nutrition: e.target.value})} className="w-full" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* DOMICARE - STEP 4 : Demande */}
                                    {isDomicare && currentStep === 4 && (
                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg text-amber-600 dark:text-amber-400"><FiFileText size={20} /></div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Demande & Besoins</h3>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <InputLabel value="Motif d'appel" className="text-gray-600 dark:text-gray-400 font-bold" />
                                                <textarea rows="3" value={data.domicare_data.motif_appel} onChange={e => setData('domicare_data', {...data.domicare_data, motif_appel: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200/50 dark:border-gray-700/50 rounded-xl" placeholder="Décrivez le motif de l'appel..."></textarea>
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Besoin d'Ambulance ?" className="text-gray-600 dark:text-gray-400 font-bold" />
                                                <div className="flex gap-4">
                                                    {['Oui', 'Non'].map(opt => (
                                                        <label key={opt} className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20 flex-1 justify-center">
                                                            <input type="radio" name="ambulance" value={opt} checked={data.domicare_data.ambulance === opt} onChange={e => setData('domicare_data', {...data.domicare_data, ambulance: e.target.value})} className="text-amber-600" />
                                                            <span className="font-semibold text-gray-700 dark:text-gray-300">{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Autres besoins spécifiques" className="text-gray-600 dark:text-gray-400" />
                                                <textarea rows="2" value={data.domicare_data.autres_besoins} onChange={e => setData('domicare_data', {...data.domicare_data, autres_besoins: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200/50 dark:border-gray-700/50 rounded-xl"></textarea>
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Profil recherché (Personnel souhaité)" className="text-gray-600 dark:text-gray-400 font-bold" />
                                                <textarea rows="2" value={data.domicare_data.profil_recherche} onChange={e => setData('domicare_data', {...data.domicare_data, profil_recherche: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200/50 dark:border-gray-700/50 rounded-xl"></textarea>
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Urgence de la prise en charge" className="text-gray-600 dark:text-gray-400 font-bold" />
                                                <div className="flex gap-4 flex-wrap">
                                                    {['Immédiate', '48h programmé'].map(opt => (
                                                        <label key={opt} className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 flex-1 justify-center">
                                                            <input type="radio" name="urgence" value={opt} checked={data.domicare_data.urgence === opt} onChange={e => setData('domicare_data', {...data.domicare_data, urgence: e.target.value})} className="text-red-600" />
                                                            <span className="font-semibold text-gray-700 dark:text-gray-300">{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <InputLabel value="Observation Libre (Optionnel)" className="text-gray-600 dark:text-gray-400" />
                                                <textarea rows="2" value={data.c_observation} onChange={e => setData('c_observation', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200/50 dark:border-gray-700/50 rounded-xl"></textarea>
                                            </div>
                                        </div>
                                    )}

                                    {/* STANDARD - STEP 1 */}
                                    {!isDomicare && currentStep === 1 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="md:col-span-2 flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400"><FiUser size={20} /></div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Identité Personnelle</h3>
                                            </div>

                                            

                                            <div className="space-y-2">
                                                <InputLabel value="Catégorie du Profil / Type de personnel" className="text-gray-600 dark:text-gray-400" />
                                                <select value={data.c_fonction} onChange={e => setData('c_fonction', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200/50 dark:border-gray-700/50 rounded-xl text-gray-700 dark:text-gray-300 h-12">
                                                    <option value="">-- Sélectionnez --</option>
                                                    {selectedProject?.jobs?.map(job => <option key={job.id} value={job.name}>{job.name}</option>)}
                                                </select>
                                                {!selectedProject && <p className="text-xs text-gray-400 mt-1 italic">Veuillez d'abord sélectionner un projet.</p>}
                                            </div>

                                            {(selectedProject?.name === 'LALLA GHALIA' || selectedProject?.name === 'LALLA LGHALIA') && 
                                             ['NOUBONNE', 'NOUNOU', 'NOUNOU OCCASIONNELLE', 'NOUBONNE OCCASIONNELLE'].includes(data.c_fonction) && (
                                                <div className="grid grid-cols-2 gap-4 md:col-span-2 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-800/30">
                                                    <div className="space-y-2">
                                                        <InputLabel value="Tranche d'âge possible de garder" className="text-gray-600 dark:text-gray-400" />
                                                        <select value={data.tranche_age} onChange={e => setData('tranche_age', e.target.value)} className="w-full bg-white dark:bg-gray-800 rounded-xl border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 h-12">
                                                            <option value="">-- Sélectionnez --</option>
                                                            <option value="0 - 1 an">0 - 1 an</option>
                                                            <option value="1 - 3 ans">1 - 3 ans</option>
                                                            <option value="3 - 6 ans">3 - 6 ans</option>
                                                            <option value="6 - 10 ans">6 - 10 ans</option>
                                                            <option value="+ 10 ans">+ 10 ans</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <InputLabel value="Combien d'enfants avez-vous ?" className="text-gray-600 dark:text-gray-400" />
                                                        <select value={data.enfants_gardes} onChange={e => setData('enfants_gardes', e.target.value)} className="w-full bg-white dark:bg-gray-800 rounded-xl border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 h-12">
                                                            <option value="">-- Sélectionnez --</option>
                                                            <option value="1">1 enfant</option>
                                                            <option value="2">2 enfants</option>
                                                            <option value="3">3 enfants</option>
                                                            <option value="4+">4 et plus</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <InputLabel value="Mode d'emploi" className="text-gray-600 dark:text-gray-400" />
                                                <DynamicSelect 
                                                    value={data.c_mode} 
                                                    onChange={val => setData('c_mode', val)} 
                                                    options={C_MODE_OPTIONS}
                                                    className="w-full h-12"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Type De Contrat" className="text-gray-600 dark:text-gray-400" />
                                                <DynamicSelect 
                                                    value={data.c_type_contrat} 
                                                    onChange={val => setData('c_type_contrat', val)} 
                                                    options={C_TYPE_CONTRAT_OPTIONS}
                                                    className="w-full h-12"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Age du profil (ans)" className="text-gray-600 dark:text-gray-400" />
                                                <DynamicSelect 
                                                    value={data.c_experience} 
                                                    onChange={val => setData('c_experience', val)} 
                                                    options={C_EXPERIENCE_OPTIONS}
                                                    className="w-full h-12"
                                                />
                                            </div>

                                            {/* Dynamic Project Missions & Criteria Selection via Chips */}
                                            <div className="md:col-span-2 space-y-3">
                                                <InputLabel value="Critères & Missions demandées pour le profil" className="text-gray-700 dark:text-gray-300 font-bold" />
                                                {!selectedProject ? (
                                                    <div className="p-6 text-center text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                                        Veuillez sélectionner un projet ci-dessus pour voir les critères et missions disponibles.
                                                    </div>
                                                ) : (!selectedProject.grouped_missions || Object.keys(selectedProject.grouped_missions).length === 0) ? (
                                                    <div className="p-4 text-center text-gray-400 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700">
                                                        Aucun critère spécifique configuré pour ce projet.
                                                    </div>
                                                ) : (
                                                    <GroupedMissionsManager
                                                        groupedMissions={selectedProject.grouped_missions || {}}
                                                        selectedMissions={data.missions || []}
                                                        onChange={(newMissions) => setData('missions', newMissions)}
                                                    />
                                                )}
                                            </div>

                                            {/* Language Selector */}
                                            <div className="md:col-span-2">
                                                <LanguageSelector
                                                    value={data.languages}
                                                    onChange={val => setData('languages', val)}
                                                />
                                            </div>

                                            {/* Candidate Mobility Preference */}
                                            <div className="space-y-2">
                                                <InputLabel value="Mobilité requise du candidat" className="text-gray-600 dark:text-gray-400" />
                                                <div className="flex gap-4">
                                                    {['Oui', 'Non'].map(opt => (
                                                        <div
                                                            key={opt}
                                                            onClick={() => setData('mobility', opt)}
                                                            className={cn(
                                                                "flex-1 text-center py-2.5 rounded-xl border-2 cursor-pointer transition-all font-semibold",
                                                                data.mobility === opt ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                            )}
                                                        >
                                                            {opt === 'Oui' ? '✓ Mobilité requise' : '✕ Non requise'}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Budget */}
                                            <div className="md:col-span-2 p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800/20 rounded-2xl border border-gray-100 dark:border-gray-700/50 mt-2">
                                                <InputLabel value="Budget Proposé (Dhs)" className="text-gray-700 dark:text-gray-300 font-semibold mb-4" />
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <InputLabel value="Budget Minimum" className="text-gray-500 text-xs uppercase tracking-wider" />
                                                        <TextInput type="number" value={data.c_prix_min} onChange={e => setData('c_prix_min', e.target.value)} className="w-full bg-white dark:bg-gray-900 rounded-xl text-lg font-mono" placeholder="0.00" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <InputLabel value="Budget Maximum" className="text-gray-500 text-xs uppercase tracking-wider" />
                                                        <TextInput type="number" value={data.c_prix_max} onChange={e => setData('c_prix_max', e.target.value)} className="w-full bg-white dark:bg-gray-900 rounded-xl text-lg font-mono" placeholder="0.00" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 4 */}
                                    {!isDomicare && currentStep === 4 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="md:col-span-2 flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-rose-100 dark:bg-rose-500/20 rounded-lg text-rose-600 dark:text-rose-400"><FiHeart size={20} /></div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Médical & Spécificités</h3>
                                            </div>

                                            <div className="p-6 bg-white/50 dark:bg-gray-800/30 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                                                <InputLabel value="Mobilité du Patient" className="text-gray-700 dark:text-gray-300 mb-4" />
                                                <div className="flex gap-4">
                                                    {['Oui', 'Non'].map(opt => (
                                                        <div
                                                            key={opt}
                                                            onClick={() => setData('mobility', opt)}
                                                            className={cn(
                                                                "flex-1 text-center py-3 rounded-xl border-2 cursor-pointer transition-all font-semibold",
                                                                data.mobility === opt ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : "border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                            )}
                                                        >
                                                            {opt === 'Oui' ? 'Mobile' : 'Réduite/Alitée'}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <DomesticAnimalsSelector
                                                hasAnimals={data.c_presence_animaux}
                                                onHasAnimalsChange={val => setData('c_presence_animaux', val)}
                                                count={data.c_nombre_animaux}
                                                onCountChange={val => setData('c_nombre_animaux', val)}
                                                details={data.c_animaux_details}
                                                onDetailsChange={val => setData('c_animaux_details', val)}
                                            />

                                            <div className="space-y-2">
                                                <InputLabel value="Allergies connues" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.allergies} onChange={e => setData('allergies', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800  rounded-xl" />
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Médecin Traitant" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.attending_physician} onChange={e => setData('attending_physician', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800  rounded-xl" />
                                            </div>

                                            <div className="md:col-span-2 space-y-2">
                                                <InputLabel value="Traitement en cours" className="text-gray-600 dark:text-gray-400" />
                                                <textarea rows="2" value={data.treatment} onChange={e => setData('treatment', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800  border-gray-200/50 dark:border-gray-700/50 focus:ring-indigo-500/50 rounded-xl text-gray-700 dark:text-gray-300"></textarea>
                                            </div>

                                            <div className="md:col-span-2 space-y-2">
                                                <InputLabel value="Observation Générale *" className="text-gray-600 dark:text-gray-400 font-bold" />
                                                <textarea rows="4" value={data.c_observation} onChange={e => setData('c_observation', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800  border-gray-200/50 dark:border-gray-700/50 focus:ring-indigo-500/50 rounded-xl text-gray-700 dark:text-gray-300"></textarea>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Bottom Navigation */}
                        <div className="border-t border-gray-100/20 dark:border-gray-800/50 bg-gray-50 dark:bg-gray-900  p-6 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => navigateStep(currentStep - 1)}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all",
                                    currentStep === 1 ? "opacity-0 pointer-events-none" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-700"
                                )}
                            >
                                <FiChevronLeft size={20} /> Précédent
                            </button>

                            {currentStep < steps.length ? (
                                <button
                                    key="btn-next"
                                    type="button"
                                    onClick={() => navigateStep(currentStep + 1)}
                                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all hover:scale-105"
                                >
                                    Suivant <FiChevronRight size={20} />
                                </button>
                            ) : (
                                <button
                                    key="btn-submit"
                                    type="button"
                                    onClick={submit}
                                    disabled={processing}
                                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 disabled:opacity-75 disabled:hover:scale-100"
                                >
                                    <FiSave size={20} /> Terminer l'Enregistrement
                                </button>
                            )}
                        </div>
                    </form>
                </div>
                </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
