import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Dropdown from '@/Components/Dropdown';
import ChildrenDetailsEditor from '@/Components/ChildrenDetailsEditor';
import LanguageSelector from '@/Components/LanguageSelector';
import DomesticAnimalsSelector from '@/Components/DomesticAnimalsSelector';
import DynamicSelect from '@/Components/DynamicSelect';
import { FiArrowLeft, FiSave, FiCheckCircle, FiChevronRight, FiChevronLeft, FiUser, FiMapPin, FiBriefcase, FiHeart, FiFileText, FiMoreVertical, FiEdit2, FiTrash2, FiPlus, FiEye, FiDownload, FiFile, FiUploadCloud } from 'react-icons/fi';
import { CLIENT_STATUSES, RECRUITMENT_SOURCES, C_MODE_OPTIONS, C_TYPE_CONTRAT_OPTIONS, C_EXPERIENCE_OPTIONS } from '@/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const steps = [
    { id: 1, name: 'Identité', icon: FiUser },
    { id: 2, name: 'Contact & Logement', icon: FiMapPin },
    { id: 3, name: 'Projet & Critères', icon: FiBriefcase },
    { id: 4, name: 'Médical', icon: FiHeart },
];

const formatDateForInput = (val) => {
    if (!val) return '';
    const s = String(val).trim();
    if (s.includes('T')) return s.split('T')[0];
    if (s.includes(' ')) return s.split(' ')[0];
    return s.substring(0, 10);
};

export default function Edit({ client, projects = [], profiles = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        c_nom: client?.c_nom || '', 
        mat: client?.mat || client?.c_mat || '',
        c_mat: client?.c_mat || client?.mat || '',
        project_id: client.project_id || '', 
        c_fonction: client?.c_fonction || '', 
        status: client.status || 'active',
        c_cin: client?.c_cin || '', 
        c_cin_v: formatDateForInput(client?.c_cin_v || client?.cin_v), 
        c_date_naissance: formatDateForInput(client?.c_date_naissance || client?.date_naissance), 
        c_nationalite: client?.c_nationalite || 'Maroc', 
        c_situation_fam: client?.c_situation_fam || '',
        c_gsm1: client?.c_gsm1 || '', 
        c_gsm2: client?.c_gsm2 || '', 
        c_ville_o: client?.c_ville_o || '', 
        c_ville_a: client?.c_ville_a || '', 
        c_adresse_cin: client?.c_adresse_cin || '', 
        c_adresse_act: client?.c_adresse_act || '',
        c_logement: client?.c_logement || '', 
        c_n_enfant: client?.c_n_enfant || 0, 
        c_enfants_details: client?.c_enfants_details || '', 
        missions: client?.missions || [],
        languages: client?.languages || '',
        mobility: client?.mobility || 'Oui',
        c_presence_animaux: client?.c_presence_animaux ? 'Oui' : 'Non', 
        c_nombre_animaux: client?.c_nombre_animaux || 0, 
        c_animaux_details: client?.c_animaux_details || '',
        allergies: client.allergies || '', 
        treatment: client.treatment || '', 
        attending_physician: client.attending_physician || '',
        c_source: client?.c_source || '', 
        c_prix_min: client?.c_prix_min || '', 
        c_prix_max: client?.c_prix_max || '', 
        c_observation: client?.c_observation || '',
        c_mode: client?.c_mode || '',
        c_type_contrat: client?.c_type_contrat || '',
        c_experience: client?.c_experience || '',
    });

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedProject, setSelectedProject] = useState(projects.find(p => p.id == client.project_id) || null);

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
        put(route('clients.update', client.id));
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
    const tabs = ['Mettre à jour', 'Historique', 'Suggestion des Profiles', 'Affectation', 'Réclamation', 'Document'];
    const [activeTab, setActiveTab] = useState('Mettre à jour');


    const navigateStep = (newStep) => {
        setPage([newStep, newStep > currentStep ? 1 : -1]);
        setCurrentStep(newStep);
    };

    const handleDelete = () => {
        const clientName = client?.c_nom || client?.nom || 'ce client';
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le client "${clientName}" ? Cette action est irréversible.`)) {
            router.delete(route('clients.destroy', client.id));
        }
    };

    return (
        <AuthenticatedLayout 
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('clients.index')} className="p-2.5 bg-white/5 dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-200/20 dark:border-gray-700/50 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all hover:scale-105">
                            <FiArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 uppercase">
                                {client?.c_nom}
                            </h2>
                            <p className="text-sm text-gray-500">{client?.c_gsm1} - Validé</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-semibold rounded-xl border border-rose-200/60 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors shadow-sm text-sm"
                    >
                        <FiTrash2 size={16} />
                        <span className="hidden sm:inline">Supprimer Client</span>
                    </button>
                </div>
            }
        >
            <Head title={`Client: ${client?.c_nom}`} />

            <div className="max-w-[95rem] mx-auto pb-20 pt-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* LEFT SIDEBAR */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-800 font-bold text-gray-700 dark:text-gray-300">Observations</div>
                            <div className="p-4 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap uppercase">{client?.c_observation || 'Aucune observation'}</div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-800 font-bold text-gray-700 dark:text-gray-300">Informations de contact</div>
                            <div className="p-4 text-sm text-gray-600 dark:text-gray-400 space-y-3">
                                <div><span className="font-semibold text-gray-800 dark:text-gray-200">Responsable / Représentant :</span> {client?.c_nom}</div>
                                <div><span className="font-semibold text-gray-800 dark:text-gray-200">Source :</span> {client?.c_source}</div>
                                <div><span className="font-semibold text-gray-800 dark:text-gray-200">Adresse (CIN) :</span> {client?.c_adresse_cin}</div>
                                <div><span className="font-semibold text-gray-800 dark:text-gray-200">Ville d'origine :</span> {client?.c_ville_o}</div>
                                <div><span className="font-semibold text-gray-800 dark:text-gray-200">Adresse actuelle :</span> {client?.c_adresse_act}</div>
                                <div><span className="font-semibold text-gray-800 dark:text-gray-200">Ville actuelle :</span> {client?.c_ville_a}</div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-800 font-bold text-gray-700 dark:text-gray-300">Informations sur le client</div>
                            <div className="p-4 text-sm text-gray-600 dark:text-gray-400 space-y-2">
                                <div><span className="font-semibold text-gray-800 dark:text-gray-200">Type de logement :</span> {client?.c_logement || '-'}</div>
                                <div><span className="font-semibold text-gray-800 dark:text-gray-200">Date de naissance :</span> {formatDateForInput(client?.c_date_naissance || client?.date_naissance) || '-'}</div>
                                <div><span className="font-semibold text-gray-800 dark:text-gray-200">CIN/PAS :</span> {client?.c_cin || '-'}</div>
                                <div><span className="font-semibold text-gray-800 dark:text-gray-200">Nationalité :</span> {client?.c_nationalite || '-'}</div>
                                <div><span className="font-semibold text-gray-800 dark:text-gray-200">CIN validité :</span> {formatDateForInput(client?.c_cin_v || client?.cin_v) || '-'}</div>
                                <div><span className="font-semibold text-gray-800 dark:text-gray-200">Situation familiale :</span> {client?.c_situation_fam || '-'}</div>
                                <div>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">Nombre d'enfant :</span> {client?.c_n_enfant ?? 0}
                                    {(() => {
                                        let raw = client?.c_enfants_details || client?.enfants_details;
                                        if (!raw) return null;
                                        let kids = [];
                                        if (typeof raw === 'string' && raw.trim().startsWith('[')) {
                                            try { kids = JSON.parse(raw); } catch (e) { kids = []; }
                                        }
                                        if (kids.length > 0) {
                                            return (
                                                <div className="mt-1 pl-2 border-l-2 border-indigo-500/40 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                                                    {kids.map((k, idx) => (
                                                        <div key={idx}>
                                                            • {k.gender === 'Garçon' ? '👦 Garçon' : (k.gender === 'Fille' ? '👧 Fille' : 'Enfant')}
                                                            {k.age ? ` (${k.age})` : ''}
                                                            {k.comment ? ` : ${k.comment}` : ''}
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        } else if (typeof raw === 'string' && raw.trim()) {
                                            return <div className="mt-1 pl-2 border-l-2 border-indigo-500/40 text-xs text-gray-500">{raw}</div>;
                                        }
                                        return null;
                                    })()}
                                </div>
                                <div><span className="font-semibold text-gray-800 dark:text-gray-200">Animaux :</span> {client?.c_presence_animaux ? 'Oui' : 'Non'}</div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT MAIN CONTENT */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                            {tabs.map(tab => (
                                <button
                                    type="button"
                                    key={tab}
                                    onClick={(e) => { e.preventDefault(); setActiveTab(tab); }}
                                    className={["px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors border border-transparent border-b-0", activeTab === tab ? "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-indigo-600 dark:text-indigo-400 shadow-[0_-2px_4px_rgba(0,0,0,0.02)] relative after:content-[''] after:absolute after:bottom-[-3px] after:left-0 after:right-0 after:h-[3px] after:bg-white dark:after:bg-gray-900" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"].join(" ")}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="pt-2">
                            {activeTab === 'Mettre à jour' && (
                                <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800/50 shadow-xl rounded-2xl overflow-hidden">
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
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-300 shadow-md",
                                            isCurrent ? "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-indigo-500/30 ring-4 ring-indigo-500/20" :
                                                isCompleted ? "bg-emerald-500 text-white shadow-emerald-500/20" :
                                                    "bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700"
                                        )}
                                    >
                                        {isCompleted ? <FiCheckCircle size={22} /> : <Icon size={20} />}
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
                                                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200/50 flex items-center gap-1">
                                                        <FiCheckCircle size={11} /> Identifiant Unique
                                                    </span>
                                                </div>
                                                <div className="w-full px-4 py-2.5 bg-indigo-50/40 dark:bg-gray-800/80 border border-indigo-200/40 dark:border-gray-700/50 rounded-xl font-mono text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-between select-none">
                                                    <span className="flex items-center gap-2">
                                                        <span className="text-xs text-indigo-500 dark:text-indigo-400 bg-indigo-100/60 dark:bg-indigo-950/60 px-2 py-0.5 rounded font-mono font-semibold">REF</span>
                                                        <span>{data.c_mat || client?.mat || client?.id || 'AUTO'}</span>
                                                    </span>
                                                    <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">Géré automatiquement</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Nom et prénom *" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.c_nom} onChange={e => setData('c_nom', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800  border-gray-200/50 dark:border-gray-700/50 focus:ring-indigo-500/50 rounded-xl" required placeholder="Ex: Ahmed Alaoui" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <InputLabel value="CIN / Passeport" className="text-gray-600 dark:text-gray-400" />
                                                    <TextInput value={data.c_cin} onChange={e => setData('c_cin', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800  rounded-xl" placeholder="Ex: AB123456" />
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
                                                    <select value={data.status} onChange={e => setData('status', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800  border-gray-200/50 dark:border-gray-700/50 rounded-xl text-gray-700 dark:text-gray-300">
                                                        <option value="active">Actif</option>
                                                        <option value="inactive">Inactif</option>
                                                    </select>
                                                </div>
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
                                                    <div className="grid grid-cols-1 gap-4">
                                                        {Object.entries(selectedProject.grouped_missions).map(([group, missions]) => (
                                                            <div key={group} className="bg-white/60 dark:bg-gray-800/40 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
                                                                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-3">{group}</h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {missions.map(mission => {
                                                                        const isSelected = (data.missions || []).includes(mission);
                                                                        return (
                                                                            <button
                                                                                key={mission}
                                                                                type="button"
                                                                                onClick={() => handleMissionToggle(mission)}
                                                                                className={cn(
                                                                                    "px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border-2 flex items-center gap-1.5",
                                                                                    isSelected 
                                                                                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm" 
                                                                                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-emerald-300"
                                                                                )}
                                                                            >
                                                                                <span>{isSelected ? '✓' : '+'}</span>
                                                                                {mission}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
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
                                    <FiSave size={20} /> Mettre à jour le Client
                                </button>
                            )}
                        </div>
                    </form>
                </div>
                                </div>
                            )}

                            
                            {activeTab === 'Suggestion des Profiles' && (
                                <div className="space-y-6">
                                    {/* Liste des Suggestions (Suggested Profiles) */}
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800/80">
                                        <div className="p-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Profils Suggérés</h3>
                                        </div>
                                        <div className="w-full">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Profil</th>
                                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Suggéré Par</th>
                                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                    {client.suggestions && client.suggestions.length > 0 ? client.suggestions.map((sugg) => (
                                                        <tr key={sugg.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase">
                                                                        {sugg.profile?.full_name}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                                {sugg.user?.name || 'Système'}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={cn(
                                                                    "px-3 py-1 text-xs font-bold rounded-full",
                                                                    sugg.status === 'accepted' ? "bg-emerald-100 text-emerald-700" :
                                                                    sugg.status === 'rejected' ? "bg-red-100 text-red-700" :
                                                                    "bg-amber-100 text-amber-700"
                                                                )}>
                                                                    {sugg.status === 'accepted' ? 'Accepté' : sugg.status === 'rejected' ? 'Refusé' : 'En cours'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right space-x-2">
                                                                {sugg.status === 'pending' && (
                                                                    <>
                                                                        <button type="button" onClick={() => router.patch(route('suggestions.status', sugg.id), { status: 'accepted' }, { preserveScroll: true })} className="px-3 py-1 bg-emerald-500 text-white rounded text-xs font-bold hover:bg-emerald-600">Accepter</button>
                                                                        <button type="button" onClick={() => router.patch(route('suggestions.status', sugg.id), { status: 'rejected' }, { preserveScroll: true })} className="px-3 py-1 bg-red-500 text-white rounded text-xs font-bold hover:bg-red-600">Refuser</button>
                                                                    </>
                                                                )}
                                                                {(sugg.status === 'accepted' || sugg.status === 'pending') && (
                                                                    <Link href={route('assignments.create', { client_id: client.id, profile_id: sugg.profile_id })} className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700 inline-block shadow-sm">
                                                                        Créer Contrat
                                                                    </Link>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )) : (
                                                        <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 bg-gray-50/30 dark:bg-gray-800/10">Aucune suggestion pour le moment.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Nouvelle Suggestion (Suggest a Profile) */}
                                    <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4 flex gap-4">
                                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                                            {profiles ? profiles.length : 0}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-1">Critères de recherche du client (Pour Nouvelle Suggestion)</h3>
                                            <div className="flex flex-wrap gap-2 text-sm text-indigo-700 dark:text-indigo-400">
                                                <span className="bg-white/50 dark:bg-indigo-900/50 px-2 py-1 rounded">Logement: {client?.c_logement}</span>
                                                <span className="bg-white/50 dark:bg-indigo-900/50 px-2 py-1 rounded">Animaux: {client?.c_presence_animaux ? 'Acceptés' : 'Non'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {profiles && profiles.map(profile => {
                                            const isSuggested = client.suggestions && client.suggestions.some(s => s.profile_id === profile.id);
                                            return (
                                                <div key={profile.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative flex flex-col">
                                                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50 shadow-sm z-10 flex items-center gap-1">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                        Disponible
                                                    </div>
                                                    
                                                    <div className="p-5 flex flex-col items-center flex-grow">
                                                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-50 dark:border-gray-800 mb-3 bg-gray-100 flex-shrink-0">
                                                            {profile.avatar ? (
                                                                <img src={`/storage/${profile.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400"><FiUser size={32} /></div>
                                                            )}
                                                        </div>
                                                        
                                                        <h4 className="font-bold text-gray-900 dark:text-white uppercase text-center w-full truncate">{profile.full_name}</h4>
                                                        <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-2">{profile.education_specialty || 'Polyvalente'}</p>
                                                        
                                                        <div className="flex text-amber-400 mb-4">
                                                            {[...Array(5)].map((_, i) => (
                                                                <span key={i}>{i < (profile.rate || 0) ? '★' : '☆'}</span>
                                                            ))}
                                                        </div>
                                                        
                                                        <div className="w-full space-y-1 text-xs text-gray-600 dark:text-gray-400 flex-grow">
                                                            <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-1">
                                                                <span className="font-semibold">Âge</span>
                                                                <span>{profile.birth_date ? new Date().getFullYear() - new Date(profile.birth_date).getFullYear() : 'N/A'} ans</span>
                                                            </div>
                                                            <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-1">
                                                                <span className="font-semibold">Ville</span>
                                                                <span>{profile.current_city || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-1">
                                                                <span className="font-semibold">Expérience</span>
                                                                <span>{profile.experience_years} ans</span>
                                                            </div>
                                                            <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-1">
                                                                <span className="font-semibold">Mode</span>
                                                                <span>{profile.mobility === 'Oui' ? 'Couchante' : 'Plein temps'}</span>
                                                            </div>
                                                            <div className="flex justify-between pb-1">
                                                                <span className="font-semibold">Salaire</span>
                                                                <span className="font-bold text-gray-900 dark:text-white">{profile.max_price} Dhs</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="p-4 pt-0 mt-auto space-y-2">
                                                        <Link href={route('profiles.edit', profile.id)} className="w-full flex items-center justify-center gap-2 py-2 bg-gray-50 hover:bg-indigo-50 dark:bg-gray-800 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold text-sm transition-colors border border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800">
                                                            <span>Voir le profil</span>
                                                            <FiChevronRight />
                                                        </Link>
                                                        {isSuggested ? (
                                                            <div className="w-full text-center py-2 bg-gray-100 text-gray-500 rounded-lg font-bold text-sm cursor-not-allowed">
                                                                Déjà Suggéré
                                                            </div>
                                                        ) : (
                                                            <button 
                                                                type="button" 
                                                                onClick={() => router.post(route('suggestions.store'), { client_id: client.id, profile_id: profile.id }, { preserveScroll: true })}
                                                                className="w-full flex items-center justify-center py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg font-bold text-sm transition-colors border border-emerald-200 dark:border-emerald-700 hover:border-emerald-300"
                                                            >
                                                                Suggérer ce profil
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        
                                        {(!profiles || profiles.length === 0) && (
                                            <div className="col-span-full py-12 text-center text-gray-500 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
                                                <p>Aucun profil disponible pour ces critères actuellement.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}\n\n                            {activeTab === 'Affectation' && (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800/80">
                                    <div className="p-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Affectations du Client</h3>
                                        <Link href={route('assignments.create', { client_id: client.id })} className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 px-4 py-2 rounded-xl font-medium transition-colors">
                                            <FiPlus size={16} /> Nouvelle Affectation
                                        </Link>
                                    </div>
                                    <div className="w-full">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700/50">
                                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Profil Assigné</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Période</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Budget</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                {client.assignments && client.assignments.length > 0 ? client.assignments.map(assignment => (
                                                    <tr key={assignment.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                                    {assignment.profile?.full_name?.charAt(0) || '?'}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-gray-900 dark:text-white">{assignment.profile?.full_name || 'N/A'}</p>
                                                                    <p className="text-xs text-gray-500">{assignment.profile?.job || ''}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 text-sm">
                                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                                                                assignment.status === 'Changement' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300' :
                                                                assignment.status === 'Nouvelle' || assignment.status === 'Nouvel' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300' :
                                                                assignment.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 
                                                                assignment.status === 'cancelled' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :
                                                                'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                                            }`}>
                                                                {assignment.status || 'Actif'}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                                                            <div>{new Date(assignment.start_date).toLocaleDateString()} - </div>
                                                            <div>{assignment.end_date ? new Date(assignment.end_date).toLocaleDateString() : 'En cours'}</div>
                                                        </td>
                                                        <td className="py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                                                            {assignment.agreed_price ? `${assignment.agreed_price} Dhs` : <span className="text-gray-400">-</span>}
                                                        </td>
                                                        <td className="py-4 px-6 text-right">
                                                            <Dropdown>
                                                                <Dropdown.Trigger>
                                                                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                                                        <FiMoreVertical size={18} />
                                                                    </button>
                                                                </Dropdown.Trigger>
                                                                <Dropdown.Content align="right" width="48">
                                                                    <Dropdown.Link href={route('assignments.edit', assignment.id)} className="flex items-center gap-2">
                                                                        <FiEdit2 className="text-gray-400" /> Modifier
                                                                    </Dropdown.Link>
                                                                    <Dropdown.Link href={route('assignments.edit', assignment.id)} className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                                                        <FiFileText className="text-indigo-500" /> Contrat / Workflow
                                                                    </Dropdown.Link>
                                                                </Dropdown.Content>

                                                            </Dropdown>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="5" className="py-8 text-center text-gray-500">
                                                            Aucune affectation trouvée pour ce client.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {['Historique', 'Réclamation'].includes(activeTab) && (
                                <div className="p-12 text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800/50 rounded-2xl shadow-sm text-gray-500">
                                    <p className="font-bold">Module {activeTab} en cours de développement</p>
                                </div>
                            )}

                            {activeTab === 'Document' && (
                                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800/50 rounded-2xl shadow-sm print:hidden p-6 space-y-6">
                                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Documents & Fichiers</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Gérez la CIN, passeport, contrat et autres documents liés à ce client.</p>
                                        </div>
                                        <button className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 font-bold rounded-xl text-sm transition-colors flex items-center gap-2">
                                            <FiPlus /> Ajouter un document
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Mocked Document Cards */}
                                        <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl flex items-start justify-between group hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors bg-gray-50 dark:bg-gray-800/50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                                    <FiFile size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white text-sm">CIN_recto_verso.jpg</p>
                                                    <p className="text-xs text-gray-500">Ajouté récemment • 1.1 MB</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"><FiEye size={14} /></button>
                                                <button className="p-2 text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"><FiDownload size={14} /></button>
                                            </div>
                                        </div>
                                        <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl flex items-start justify-between group hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors bg-gray-50 dark:bg-gray-800/50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                                    <FiFileText size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white text-sm">Contrat_{client.nom || client.c_nom || 'Client'}.pdf</p>
                                                    <p className="text-xs text-gray-500">Généré le {client.created_at ? new Date(client.created_at).toLocaleDateString('fr-FR') : 'Récemment'} • 1.8 MB</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"><FiEye size={14} /></button>
                                                <button className="p-2 text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"><FiDownload size={14} /></button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Upload Area */}
                                    <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer group relative overflow-hidden">
                                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Uploader un fichier" />
                                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform rounded-xl flex items-center justify-center mx-auto mb-4">
                                            <FiUploadCloud size={24} />
                                        </div>
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">Cliquez ou glissez-déposez des fichiers ici</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">PDF, JPG, PNG (Max 5MB)</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
