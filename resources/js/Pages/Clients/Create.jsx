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

const steps = [
    { id: 1, name: 'Identité', icon: FiUser },
    { id: 2, name: 'Contact & Logement', icon: FiMapPin },
    { id: 3, name: 'Projet & Critères', icon: FiBriefcase },
    { id: 4, name: 'Médical', icon: FiHeart },
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
                                    {/* STEP 1 */}
                                    {currentStep === 1 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="md:col-span-2 flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400"><FiUser size={20} /></div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Identité Personnelle</h3>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <InputLabel value="Référence / Matricule Client" className="text-gray-600 dark:text-gray-400 font-semibold" />
                                                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200/50 flex items-center gap-1">
                                                        <FiCheckCircle size={11} /> Auto-généré
                                                    </span>
                                                </div>
                                                <div className="w-full px-4 py-2.5 bg-indigo-50/40 dark:bg-gray-800/80 border border-indigo-200/40 dark:border-gray-700/50 rounded-xl font-mono text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-between select-none">
                                                    <span className="flex items-center gap-2">
                                                        <span className="text-xs text-indigo-500 dark:text-indigo-400 bg-indigo-100/60 dark:bg-indigo-950/60 px-2 py-0.5 rounded font-mono font-semibold">REF</span>
                                                        <span>{data.c_mat || nextMatricule || 'AUTO'}</span>
                                                    </span>
                                                    <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">Génération automatique</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Nom et prénom *" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.c_nom} onChange={e => setData('c_nom', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800  border-gray-200/50 dark:border-gray-700/50 focus:ring-indigo-500/50 rounded-xl" required placeholder="Ex: Ahmed Alaoui" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <InputLabel value="CIN / Passeport" className="text-gray-600 dark:text-gray-400" />
                                                    <CinCheckInput value={data.c_cin} onChange={e => setData('c_cin', e.target.value)} type="all" className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl" placeholder="Ex: AB123456" />
                                                </div>
                                                <div className="space-y-2">
                                                    <InputLabel value="Validité CIN" className="text-gray-600 dark:text-gray-400" />
                                                    <TextInput type="date" value={data.c_cin_v} onChange={e => setData('c_cin_v', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800  rounded-xl text-gray-500" />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Date de naissance" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput type="date" value={data.c_date_naissance} onChange={e => setData('c_date_naissance', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800  rounded-xl text-gray-500" />
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Nationalité" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.c_nationalite} onChange={e => setData('c_nationalite', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800  rounded-xl" />
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Situation familiale" className="text-gray-600 dark:text-gray-400" />
                                                <select value={data.c_situation_fam} onChange={e => setData('c_situation_fam', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800  border-gray-200/50 dark:border-gray-700/50 rounded-xl text-gray-700 dark:text-gray-300">
                                                    <option value="">-- Sélectionnez --</option>
                                                    <option value="Célibataire">Célibataire</option>
                                                    <option value="Marié(e)">Marié(e)</option>
                                                    <option value="Divorcé(e)">Divorcé(e)</option>
                                                    <option value="Veuf(ve)">Veuf(ve)</option>
                                                </select>
                                            </div>

                                            <ChildrenDetailsEditor
                                                count={data.c_n_enfant}
                                                onCountChange={(val) => {
                                                    setData(prev => ({ ...prev, c_n_enfant: val, n_enfant: val }));
                                                }}
                                                details={data.c_enfants_details}
                                                onDetailsChange={(val) => {
                                                    setData(prev => ({ ...prev, c_enfants_details: val, enfants_details: val }));
                                                }}
                                                colorScheme="indigo"
                                                label="Nombre d'enfants"
                                            />

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <InputLabel value="Statut" className="text-gray-600 dark:text-gray-400" />
                                                    <select
                                                        value={data.statut || data.status || data.c_statut}
                                                        onChange={e => {
                                                            setData('statut', e.target.value);
                                                            setData('c_statut', e.target.value);
                                                            setData('status', e.target.value);
                                                        }}
                                                        className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200/50 dark:border-gray-700/50 rounded-xl text-gray-700 dark:text-gray-300"
                                                    >
                                                        {availableStatuses.map(st => (
                                                            <option key={st} value={st}>{st}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {(data.statut === 'Black liste' || data.status === 'Black liste' || data.c_statut === 'Black liste') && (
                                                    <div className="space-y-2 col-span-2">
                                                        <InputLabel value="Motif de la mise sur Black Liste" className="text-red-600 dark:text-red-400 font-bold" />
                                                        <textarea
                                                            value={data.blacklist_motif}
                                                            onChange={e => setData('blacklist_motif', e.target.value)}
                                                            className="w-full bg-red-50 dark:bg-red-900/10 rounded-xl border-red-200 dark:border-red-800/50 text-red-900 dark:text-red-300 min-h-[80px]"
                                                            placeholder="Veuillez spécifier la raison..."
                                                            required
                                                        ></textarea>
                                                    </div>
                                                )}
                                                <div className="space-y-2">
                                                    <InputLabel value="Source" className="text-gray-600 dark:text-gray-400" />
                                                        <DynamicSelect 
                                                            value={data.c_source} 
                                                            onChange={val => setData('c_source', val)} 
                                                            options={RECRUITMENT_SOURCES}
                                                            className="w-full h-[42px]"
                                                        />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 2 */}
                                    {currentStep === 2 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="md:col-span-2 flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg text-purple-600 dark:text-purple-400"><FiMapPin size={20} /></div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Contact & Logement</h3>
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Téléphone Principal (GSM 1)" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.c_gsm1} onChange={e => setData('c_gsm1', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800  rounded-xl" placeholder="06 XX XX XX XX" />
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Téléphone Secondaire (GSM 2)" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.c_gsm2} onChange={e => setData('c_gsm2', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800  rounded-xl" placeholder="06 XX XX XX XX" />
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Ville d'origine" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.c_ville_o} onChange={e => setData('c_ville_o', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800  rounded-xl" />
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Ville Actuelle" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.c_ville_a} onChange={e => setData('c_ville_a', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800  rounded-xl" />
                                            </div>

                                            <div className="md:col-span-2 space-y-2">
                                                <InputLabel value="Adresse Actuelle" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.c_adresse_act} onChange={e => setData('c_adresse_act', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800  rounded-xl" placeholder="Adresse complète..." />
                                            </div>

                                            <div className="md:col-span-2 space-y-2">
                                                <InputLabel value="Adresse figurant sur CIN" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.c_adresse_cin} onChange={e => setData('c_adresse_cin', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800  rounded-xl" />
                                            </div>

                                            <div className="md:col-span-2 space-y-2">
                                                <InputLabel value="Type de Logement" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.c_logement} onChange={e => setData('c_logement', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800  rounded-xl" placeholder="Ex: Appartement, Villa..." />
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 3 */}
                                    {currentStep === 3 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                            <div className="md:col-span-2 flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400"><FiBriefcase size={20} /></div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Projet & Critères Demandés</h3>
                                                    <p className="text-xs text-gray-500">Sélectionnez le projet, la catégorie du profil et les critères recherchés.</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Projet Associé *" className="text-gray-600 dark:text-gray-400" />
                                                <select value={data.project_id} onChange={handleProjectChange} className="w-full bg-white dark:bg-gray-800 border-emerald-200/50 dark:border-emerald-700/50 focus:ring-emerald-500/50 rounded-xl text-gray-700 dark:text-gray-300 font-medium h-12 shadow-sm" required>
                                                    <option value="">-- Sélectionnez un projet --</option>
                                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                </select>
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
                                    {currentStep === 4 && (
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
            </div>
        </AuthenticatedLayout>
    );
}
