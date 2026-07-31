import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Dropdown from '@/Components/Dropdown';
import { FiArrowLeft, FiSave, FiCheckCircle, FiChevronRight, FiChevronLeft, FiUser, FiMapPin, FiBriefcase, FiStar, FiPrinter, FiMail, FiPhone, FiCalendar, FiClock, FiMoreVertical, FiEdit2, FiTrash2, FiPlus, FiFileText } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const steps = [
    { id: 1, name: 'Profil', icon: FiUser },
    { id: 2, name: 'Contact', icon: FiMapPin },
    { id: 3, name: 'Expérience', icon: FiBriefcase },
    { id: 4, name: 'Compétences', icon: FiStar },
];

export default function Edit({ profile, projects = [] }) {
    // Extract JSON criteria fields if they exist
    const criteria = profile.criteria || {};

    const { data, setData, put, processing, errors } = useForm({
        matricule: profile.matricule || '',
        full_name: profile.full_name || '', 
        cin: profile.cin || '', 
        cin_validity: profile.cin_validity || '', 
        birth_date: profile.birth_date || '', 
        birth_city: profile.birth_city || '', 
        nationality: profile.nationality || 'Maroc', 
        religion: profile.religion || '', 
        education_level: profile.education_level || '', 
        education_specialty: profile.education_specialty || '', 
        marital_status: profile.marital_status || '', 
        children_count: profile.children_count || '', 
        cin_address: profile.cin_address || '', 
        origin_city: profile.origin_city || '', 
        current_address: profile.current_address || '', 
        current_city: profile.current_city || '', 
        email: profile.email || '', 
        phone_1: profile.phone_1 || '', 
        phone_2: profile.phone_2 || '', 
        source: profile.source || '', 
        rate: profile.rate || 0, 
        status: profile.status || 'active', 
        project_id: profile.project_id || '', 
        job: profile.job || '', 
        min_price: profile.min_price || '', 
        max_price: profile.max_price || '', 
        experience_years: profile.experience_years || '', 
        experience_details: profile.experience_details || '',
        mobility: profile.mobility || 'Oui', 
        languages: profile.languages || '', 
        has_diseases: profile.has_diseases || 'Non', 
        pet_allergies: profile.pet_allergies || 'Non', 
        observation: profile.observation || '',
        
        mode_emploi: criteria.mode_emploi || '', 
        type_contrat: criteria.type_contrat || '', 
        repos: criteria.repos || '', 
        missions: criteria.missions || []
    });

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedProject, setSelectedProject] = useState(projects.find(p => p.id == profile.project_id) || null);

    const handleProjectChange = (e) => {
        const pId = e.target.value;
        setData('project_id', pId);
        const proj = projects.find(p => p.id == pId);
        setSelectedProject(proj);
        setData(prev => ({ ...prev, project_id: pId, job: '', missions: [] }));
    };

    const handleMissionToggle = (missionName) => {
        const isSelected = data.missions.includes(missionName);
        if (isSelected) {
            setData('missions', data.missions.filter(m => m !== missionName));
        } else {
            setData('missions', [...data.missions, missionName]);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('profiles.update', profile.id));
    };

    // Animation Variants
    const slideVariants = {
        enter: (direction) => ({ x: 0, opacity: 0 }),
        center: { zIndex: 1, x: 0, opacity: 1 },
        exit: (direction) => ({ zIndex: 0, x: 0, opacity: 0 })
    };
    const [[page, direction], setPage] = useState([1, 0]);
    const tabs = ['Fiche Profile', 'Mettre à jour', 'Historique', 'Suggestions', 'Affectation', 'Document'];
    const [activeTab, setActiveTab] = useState('Fiche Profile');

    const handlePrint = () => {
        window.print();
    };


    const navigateStep = (newStep) => {
        setPage([newStep, newStep > currentStep ? 1 : -1]);
        setCurrentStep(newStep);
    };

    return (
        <AuthenticatedLayout 
            header={
                <div className="flex items-center justify-between print:hidden">
                    <div className="flex items-center gap-4">
                        <Link href={route('profiles.index')} className="p-2.5 bg-white/5 dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-200/20 dark:border-gray-700/50 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all hover:scale-105">
                            <FiArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 uppercase">
                                {profile?.full_name}
                            </h2>
                            <p className="text-sm text-gray-500">{profile?.education_specialty || 'Profil Polyvalent'} - {profile?.rate || 0} étoiles</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors shadow-sm">
                            <FiPrinter size={18} />
                            <span className="hidden sm:inline">Imprimer le CV</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Profil: ${profile?.full_name}`} />

            <div className="max-w-[95rem] mx-auto pb-20 pt-8 px-4 sm:px-6 lg:px-8 print:p-0 print:m-0 print:max-w-none print:bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 print:flex print:flex-col print:gap-0">
                    
                    {/* LEFT SIDEBAR - HIDDEN ON PRINT */}
                    <div className="lg:col-span-1 space-y-6 print:hidden">
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-800 font-bold text-gray-700 dark:text-gray-300">Aperçu du Profil</div>
                            <div className="p-6 flex flex-col items-center">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-800 mb-4 bg-gray-50 flex items-center justify-center shadow-inner relative group">
                                    {profile.avatar ? (
                                        <img src={`/storage/${profile.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-gray-400"><FiUser size={48} /></div>
                                    )}
                                </div>
                                
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white uppercase text-center mb-1">{profile.full_name}</h3>
                                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-3">{profile.education_specialty || 'Candidat'}</p>
                                
                                <div className="flex gap-1 text-amber-400 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <FiStar key={i} className={i < (profile.rate || 0) ? 'fill-current' : ''} />
                                    ))}
                                </div>

                                <div className="w-full space-y-2 mt-4 text-sm">
                                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 shrink-0"><FiMapPin size={16} /></div>
                                        <span className="truncate">{profile.current_city || 'Ville non spécifiée'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 shrink-0"><FiPhone size={16} /></div>
                                        <span className="truncate">{profile.phone_1 || 'Non spécifié'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 shrink-0"><FiMail size={16} /></div>
                                        <span className="truncate">{profile.email || 'Non spécifié'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-800 font-bold text-gray-700 dark:text-gray-300">Statistiques clés</div>
                            <div className="p-4 grid grid-cols-2 gap-4">
                                <div className="bg-indigo-50 dark:bg-indigo-900/10 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                                    <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Expérience</div>
                                    <div className="text-xl font-black text-gray-900 dark:text-white">{profile.experience_years || 0} <span className="text-sm font-medium text-gray-500">ans</span></div>
                                </div>
                                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
                                    <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Salaire</div>
                                    <div className="text-xl font-black text-gray-900 dark:text-white">{profile.max_price || '-'} <span className="text-sm font-medium text-gray-500">dh</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT MAIN CONTENT */}
                    <div className="lg:col-span-3 print:col-span-1">
                        {/* TABS - HIDDEN ON PRINT */}
                        <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 mb-6 print:hidden">
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

                        {/* CONTENT AREA */}
                        <div className="print:block">
                            
                            {/* CV TAB / PRINT VIEW */}
                            {(activeTab === 'Fiche Profile' || activeTab === 'Print') && (
                                <div className="bg-white print:shadow-none shadow-xl border border-gray-200 print:border-none rounded-2xl overflow-hidden print:w-full print:max-w-[210mm] mx-auto print:bg-white print:text-black min-h-[297mm]">
                                    
                                    {/* CV HEADER - PRINT OPTIMIZED */}
                                    <div className="bg-indigo-600 print:bg-gray-800 text-white p-8 sm:p-12 relative overflow-hidden print:-webkit-print-color-adjust-exact">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 print:hidden"></div>
                                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10 print:hidden"></div>
                                        
                                        <div className="relative z-10 flex flex-col md:flex-row print:flex-row items-center md:items-start print:items-start gap-8">
                                            
                                            {/* CV AVATAR */}
                                            <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl bg-white flex items-center justify-center">
                                                {profile.avatar ? (
                                                    <img src={`/storage/${profile.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-gray-300"><FiUser size={64} /></div>
                                                )}
                                            </div>
                                            
                                            {/* CV TITLE & SUMMARY INFO */}
                                            <div className="text-center md:text-left print:text-left pt-2 flex-grow">
                                                <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-2 drop-shadow-sm">{profile.full_name}</h1>
                                                <div className="inline-block px-4 py-1.5 bg-white/20 print:bg-gray-700 backdrop-blur-md rounded-full font-bold text-white mb-6 border border-white/30">
                                                    {profile.education_specialty || 'Spécialité Non Définie'}
                                                </div>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-sm font-medium text-indigo-100 print:text-gray-300">
                                                    <div className="flex items-center justify-center md:justify-start print:justify-start gap-2">
                                                        <FiPhone className="opacity-70" /> {profile.phone_1 || '-'}
                                                    </div>
                                                    <div className="flex items-center justify-center md:justify-start print:justify-start gap-2">
                                                        <FiMail className="opacity-70" /> {profile.email || '-'}
                                                    </div>
                                                    <div className="flex items-center justify-center md:justify-start print:justify-start gap-2">
                                                        <FiMapPin className="opacity-70" /> {profile.current_city || '-'}
                                                    </div>
                                                    <div className="flex items-center justify-center md:justify-start print:justify-start gap-2">
                                                        <FiCalendar className="opacity-70" /> {profile.birth_date ? `${new Date().getFullYear() - new Date(profile.birth_date).getFullYear()} ans` : '-'}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                        </div>
                                    </div>
                                    
                                    {/* CV BODY */}
                                    <div className="p-8 sm:p-12 grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-12">
                                        
                                        {/* LEFT COLUMN - ABOUT & SKILLS */}
                                        <div className="md:col-span-1 print:col-span-1 space-y-10">
                                            
                                            {/* PROFILE SUMMRY */}
                                            <div>
                                                <h2 className="text-lg font-black uppercase tracking-wider text-gray-900 dark:text-gray-900 border-b-2 border-indigo-500 pb-2 mb-4 inline-block print:text-black">
                                                    Profil
                                                </h2>
                                                <div className="space-y-4 text-sm text-gray-700 dark:text-gray-800 print:text-black">
                                                    <div className="flex justify-between items-center bg-gray-50 print:bg-white p-2 rounded">
                                                        <span className="font-semibold text-gray-500 print:text-gray-600">Expérience:</span>
                                                        <span className="font-bold">{profile.experience_years} ans</span>
                                                    </div>
                                                    <div className="flex justify-between items-center bg-gray-50 print:bg-white p-2 rounded">
                                                        <span className="font-semibold text-gray-500 print:text-gray-600">Mobilité:</span>
                                                        <span className="font-bold">{profile.mobility}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center bg-gray-50 print:bg-white p-2 rounded">
                                                        <span className="font-semibold text-gray-500 print:text-gray-600">Évaluation:</span>
                                                        <span className="font-bold flex items-center gap-1 text-amber-500">
                                                            {profile.rate || 0} <FiStar className="fill-current" />
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center bg-gray-50 print:bg-white p-2 rounded">
                                                        <span className="font-semibold text-gray-500 print:text-gray-600">Disponibilité:</span>
                                                        <span className="font-bold text-emerald-600">Immédiate</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* SKILLS / MISSIONS */}
                                            <div>
                                                <h2 className="text-lg font-black uppercase tracking-wider text-gray-900 dark:text-gray-900 border-b-2 border-indigo-500 pb-2 mb-4 inline-block print:text-black">
                                                    Missions Maîtrisées
                                                </h2>
                                                <div className="flex flex-wrap gap-2">
                                                    {(profile.criteria?.missions || []).map(mission => (
                                                        <span key={mission} className="px-3 py-1 bg-indigo-50 print:bg-gray-100 text-indigo-700 print:text-gray-800 rounded-full text-xs font-bold border border-indigo-100 print:border-gray-300">
                                                            {mission}
                                                        </span>
                                                    ))}
                                                    {(!profile.criteria?.missions || profile.criteria.missions.length === 0) && (
                                                        <span className="text-sm text-gray-400 italic">Aucune mission spécifiée</span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* PERSONAL INFO */}
                                            <div>
                                                <h2 className="text-lg font-black uppercase tracking-wider text-gray-900 dark:text-gray-900 border-b-2 border-indigo-500 pb-2 mb-4 inline-block print:text-black">
                                                    Personnel
                                                </h2>
                                                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-800 print:text-black">
                                                    <div className="flex gap-2">
                                                        <span className="font-semibold text-gray-500 print:text-gray-600 w-24">Statut fam.:</span>
                                                        <span>{profile.family_status || '-'}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span className="font-semibold text-gray-500 print:text-gray-600 w-24">Enfants:</span>
                                                        <span>{profile.children_count || 0}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span className="font-semibold text-gray-500 print:text-gray-600 w-24">Permis:</span>
                                                        <span>{profile.has_driver_license ? 'Oui' : 'Non'}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span className="font-semibold text-gray-500 print:text-gray-600 w-24">Passeport:</span>
                                                        <span>{profile.has_passport ? 'Oui' : 'Non'}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span className="font-semibold text-gray-500 print:text-gray-600 w-24">Fumeur:</span>
                                                        <span>{profile.is_smoker ? 'Oui' : 'Non'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                        </div>
                                        
                                        {/* RIGHT COLUMN - EXPERIENCE & DETAILS */}
                                        <div className="md:col-span-2 print:col-span-2 space-y-10">
                                            
                                            {/* OBSERVATIONS (LIKE AN ABOUT ME) */}
                                            <div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 print:bg-gray-200 flex items-center justify-center text-indigo-600 print:text-gray-800">
                                                        <FiUser size={20} />
                                                    </div>
                                                    <h2 className="text-xl font-black uppercase tracking-wider text-gray-900 dark:text-gray-900 print:text-black">À propos</h2>
                                                </div>
                                                <p className="text-gray-700 dark:text-gray-800 print:text-black text-sm leading-relaxed whitespace-pre-wrap pl-13 print:pl-0 uppercase">
                                                    {profile.observation || 'Aucune observation détaillée disponible pour ce candidat.'}
                                                </p>
                                            </div>
                                            
                                            {/* PREFERENCES / CRITERIA */}
                                            <div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-100 print:bg-gray-200 flex items-center justify-center text-indigo-600 print:text-gray-800">
                                                        <FiCheckCircle size={20} />
                                                    </div>
                                                    <h2 className="text-xl font-black uppercase tracking-wider text-gray-900 dark:text-gray-900 print:text-black">Critères & Préférences</h2>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-13 print:pl-0">
                                                    <div className="bg-gray-50 print:bg-white border border-gray-100 print:border-gray-200 p-4 rounded-xl">
                                                        <div className="text-xs font-bold text-gray-400 uppercase mb-1">Mobilité Demandée</div>
                                                        <div className="font-semibold text-gray-800 print:text-black">{profile.criteria?.mobility || '-'}</div>
                                                    </div>
                                                    <div className="bg-gray-50 print:bg-white border border-gray-100 print:border-gray-200 p-4 rounded-xl">
                                                        <div className="text-xs font-bold text-gray-400 uppercase mb-1">Jours de repos</div>
                                                        <div className="font-semibold text-gray-800 print:text-black">{profile.criteria?.rest_days || '-'}</div>
                                                    </div>
                                                    <div className="bg-gray-50 print:bg-white border border-gray-100 print:border-gray-200 p-4 rounded-xl">
                                                        <div className="text-xs font-bold text-gray-400 uppercase mb-1">Animaux</div>
                                                        <div className="font-semibold text-gray-800 print:text-black">{profile.criteria?.pets || '-'}</div>
                                                    </div>
                                                    <div className="bg-gray-50 print:bg-white border border-gray-100 print:border-gray-200 p-4 rounded-xl">
                                                        <div className="text-xs font-bold text-gray-400 uppercase mb-1">Niveau scolaire</div>
                                                        <div className="font-semibold text-gray-800 print:text-black">{profile.education_level || '-'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* EVALUATION SECTION */}
                                            {profile.evaluation && (
                                                <div className="pt-4 border-t border-gray-100 print:border-gray-200">
                                                    <h2 className="text-sm font-black uppercase text-gray-400 mb-3 print:text-gray-500">Note d'évaluation interne</h2>
                                                    <p className="text-sm italic text-gray-600 print:text-gray-700 bg-amber-50 print:bg-white p-4 rounded-xl border border-amber-100 print:border-gray-200 uppercase">
                                                        "{profile.evaluation}"
                                                    </p>
                                                </div>
                                            )}
                                            
                                        </div>
                                    </div>
                                    
                                </div>
                            )}

                            {activeTab === 'Mettre à jour' && (
                                <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800/50 shadow-xl rounded-2xl overflow-hidden print:hidden">
\n{/* Stepper Header */}
                <div className="mb-10 relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full -z-10 transform -translate-y-1/2"></div>
                    <div 
                        className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700 ease-out -z-10 transform -translate-y-1/2" 
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
                                            isCompleted ? "bg-emerald-600 border-emerald-600 text-white" : 
                                            isCurrent ? "bg-white dark:bg-gray-900 border-emerald-500 text-emerald-500 shadow-emerald-500/30" : 
                                            "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400"
                                        )}
                                    >
                                        <Icon size={20} strokeWidth={isCurrent || isCompleted ? 2.5 : 2} />
                                    </motion.button>
                                    <span className={cn(
                                        "mt-3 text-xs md:text-sm font-bold transition-colors",
                                        isCurrent ? "text-emerald-600 dark:text-emerald-400" : 
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

                {/* Form Container */}
                <div className="relative bg-white dark:bg-gray-900  border border-white/20 dark:border-gray-800/50 shadow-xl rounded-[2rem] overflow-hidden">
                    
                    
                    <form onSubmit={submit} className="relative z-10">
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
                                    key={page} custom={direction} variants={slideVariants}
                                    initial="enter" animate="center" exit="exit"
                                    transition={{ duration: 0.2 }}
                                >
                                    {/* STEP 1: Profil */}
                                    {currentStep === 1 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="md:col-span-2 flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400"><FiUser size={20} /></div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Profil Personnel</h3>
                                            </div>

                                            {/* File Uploads */}
                                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                                <div className="p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-emerald-500 transition-colors bg-gray-50 dark:bg-gray-800">
                                                    <InputLabel value="Photo de profil" className="text-center font-semibold mb-2" />
                                                    <input type="file" className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700" />
                                                </div>
                                                <div className="p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-emerald-500 transition-colors bg-gray-50 dark:bg-gray-800">
                                                    <InputLabel value="CIN / Passeport" className="text-center font-semibold mb-2" />
                                                    <input type="file" className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700" />
                                                </div>
                                                <div className="p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-emerald-500 transition-colors bg-gray-50 dark:bg-gray-800">
                                                    <InputLabel value="CV (Document)" className="text-center font-semibold mb-2" />
                                                    <input type="file" className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <InputLabel value="Matricule / Référence" className="text-gray-600 dark:text-gray-400 font-bold" />
                                                    <TextInput value={data.matricule} onChange={e => setData('matricule', e.target.value)} className="w-full bg-indigo-50/50 border-indigo-200 dark:border-indigo-800 dark:bg-indigo-900/10 rounded-xl" />
                                                </div>
                                                <div className="space-y-2">
                                                    <InputLabel value="Nom et prénom *" className="text-gray-600 dark:text-gray-400" />
                                                    <TextInput value={data.full_name} onChange={e => setData('full_name', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800  rounded-xl" required />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Évaluation du profil" className="text-gray-600 dark:text-gray-400" />
                                                <div className="flex gap-2">
                                                    {[1,2,3,4,5].map(star => (
                                                        <button 
                                                            key={star} 
                                                            type="button"
                                                            onClick={() => setData('rate', star)}
                                                            className={cn("text-2xl transition-all hover:scale-110", data.rate >= star ? "text-amber-400" : "text-gray-300 dark:text-gray-600")}
                                                        >
                                                            ★
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <InputLabel value="CIN / Passeport" className="text-gray-600 dark:text-gray-400" />
                                                    <TextInput value={data.cin} onChange={e => setData('cin', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl" />
                                                </div>
                                                <div className="space-y-2">
                                                    <InputLabel value="Validité CIN" className="text-gray-600 dark:text-gray-400" />
                                                    <TextInput type="date" value={data.cin_validity} onChange={e => setData('cin_validity', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-500" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <InputLabel value="Date de naissance" className="text-gray-600 dark:text-gray-400" />
                                                    <TextInput type="date" value={data.birth_date} onChange={e => setData('birth_date', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-500" />
                                                </div>
                                                <div className="space-y-2">
                                                    <InputLabel value="Ville de naissance" className="text-gray-600 dark:text-gray-400" />
                                                    <TextInput value={data.birth_city} onChange={e => setData('birth_city', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <InputLabel value="Nationalité" className="text-gray-600 dark:text-gray-400" />
                                                    <TextInput value={data.nationality} onChange={e => setData('nationality', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl" />
                                                </div>
                                                <div className="space-y-2">
                                                    <InputLabel value="Religion" className="text-gray-600 dark:text-gray-400" />
                                                    <select value={data.religion} onChange={e => setData('religion', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300">
                                                        <option value="">-- Sélectionnez --</option>
                                                        <option value="Islam">Islam</option>
                                                        <option value="Chrétienté">Chrétienté</option>
                                                        <option value="Judaïsme">Judaïsme</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <InputLabel value="Situation familiale" className="text-gray-600 dark:text-gray-400" />
                                                    <select value={data.marital_status} onChange={e => setData('marital_status', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300">
                                                        <option value="">-- Sélectionnez --</option>
                                                        <option value="Célibataire">Célibataire</option>
                                                        <option value="Marié(e)">Marié(e)</option>
                                                        <option value="Divorcé(e)">Divorcé(e)</option>
                                                        <option value="Veuf(ve)">Veuf(ve)</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <InputLabel value="Enfants" className="text-gray-600 dark:text-gray-400" />
                                                    <TextInput type="number" value={data.children_count} onChange={e => setData('children_count', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 2: Contact */}
                                    {currentStep === 2 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="md:col-span-2 flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400"><FiMapPin size={20} /></div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Contact & Logement</h3>
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Téléphone 1" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.phone_1} onChange={e => setData('phone_1', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl" />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="Téléphone 2" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.phone_2} onChange={e => setData('phone_2', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl" />
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <InputLabel value="Email" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl" />
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Ville Actuelle" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.current_city} onChange={e => setData('current_city', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl" />
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="Ville d'origine" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.origin_city} onChange={e => setData('origin_city', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl" />
                                            </div>

                                            <div className="md:col-span-2 space-y-2">
                                                <InputLabel value="Adresse Actuelle" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.current_address} onChange={e => setData('current_address', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl" />
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <InputLabel value="Adresse CIN" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.cin_address} onChange={e => setData('cin_address', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl" />
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 3: Expérience */}
                                    {currentStep === 3 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="md:col-span-2 flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg text-purple-600 dark:text-purple-400"><FiBriefcase size={20} /></div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Affectation & Expérience</h3>
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Projet Associé *" className="text-gray-600 dark:text-gray-400" />
                                                <select value={data.project_id} onChange={handleProjectChange} className="w-full bg-white dark:bg-gray-800 rounded-xl border-purple-200/50 dark:border-purple-700/50 focus:ring-purple-500/50 font-medium h-12 shadow-sm text-gray-700 dark:text-gray-300" required>
                                                    <option value="">-- Sélectionnez un projet --</option>
                                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <InputLabel value="Type de personnel" className="text-gray-600 dark:text-gray-400" />
                                                <select value={data.job} onChange={e => setData('job', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl border-gray-200/50 dark:border-gray-700/50 h-12 text-gray-700 dark:text-gray-300">
                                                    <option value="">-- Sélectionnez --</option>
                                                    {selectedProject?.jobs?.map(job => <option key={job.id} value={job.name}>{job.name}</option>)}
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <InputLabel value="Niveau d'étude" className="text-gray-600 dark:text-gray-400" />
                                                    <select value={data.education_level} onChange={e => setData('education_level', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300">
                                                        <option value="">-- Sélectionnez --</option>
                                                        <option value="Bac">Bac</option>
                                                        <option value="Bac+2">Bac+2</option>
                                                        <option value="Bac+3">Bac+3</option>
                                                        <option value="Bac+5">Bac+5</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <InputLabel value="Spécialité" className="text-gray-600 dark:text-gray-400" />
                                                    <select value={data.education_specialty} onChange={e => setData('education_specialty', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300">
                                                        <option value="">-- Sélectionnez --</option>
                                                        <option value="Général">Général</option>
                                                        <option value="Technique">Technique</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Années d'expérience" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput type="number" value={data.experience_years} onChange={e => setData('experience_years', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl" />
                                            </div>

                                            <div className="md:col-span-2 space-y-2">
                                                <InputLabel value="Détails de l'expérience" className="text-gray-600 dark:text-gray-400" />
                                                <textarea rows="3" value={data.experience_details} onChange={e => setData('experience_details', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl border-gray-200/50 dark:border-gray-700/50 focus:ring-purple-500/50 text-gray-700 dark:text-gray-300"></textarea>
                                            </div>

                                            <div className="md:col-span-2 p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800/20 rounded-2xl border border-gray-100 dark:border-gray-700/50 mt-4">
                                                <InputLabel value="Attentes Salariales (Dhs)" className="text-gray-700 dark:text-gray-300 font-semibold mb-4" />
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                                    <div className="space-y-2">
                                                        <InputLabel value="Minimum" className="text-gray-500 text-xs uppercase" />
                                                        <TextInput type="number" value={data.min_price} onChange={e => setData('min_price', e.target.value)} className="w-full bg-white dark:bg-gray-900 rounded-xl text-lg font-mono" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <InputLabel value="Maximum" className="text-gray-500 text-xs uppercase" />
                                                        <TextInput type="number" value={data.max_price} onChange={e => setData('max_price', e.target.value)} className="w-full bg-white dark:bg-gray-900 rounded-xl text-lg font-mono" />
                                                    </div>
                                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                                        <InputLabel value="Période" className="text-gray-500 text-xs uppercase" />
                                                        <select className="w-full bg-white dark:bg-gray-900 rounded-xl text-lg border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 h-[50px]">
                                                            <option value="mois">Par mois</option>
                                                            <option value="jour">Par jour</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 4: Compétences */}
                                    {currentStep === 4 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="md:col-span-2 flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg text-amber-600 dark:text-amber-400"><FiStar size={20} /></div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Compétences & Spécificités</h3>
                                            </div>

                                            {/* Dynamic Missions Selection via Chips */}
                                            <div className="md:col-span-2">
                                                <InputLabel value="Missions et Tâches" className="text-gray-600 dark:text-gray-400 font-bold mb-4" />
                                                {!selectedProject ? (
                                                    <div className="p-6 text-center text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                                        Veuillez sélectionner un projet (Étape 3) pour voir les missions disponibles.
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 gap-6">
                                                        {selectedProject.grouped_missions && Object.entries(selectedProject.grouped_missions).map(([group, missions]) => (
                                                            <div key={group} className="bg-white/50 dark:bg-gray-800/30 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/50">
                                                                <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4">{group}</h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {missions.map(mission => {
                                                                        const isSelected = data.missions.includes(mission);
                                                                        return (
                                                                            <button
                                                                                key={mission}
                                                                                type="button"
                                                                                onClick={() => handleMissionToggle(mission)}
                                                                                className={cn(
                                                                                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border-2",
                                                                                    isSelected ? "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-amber-300"
                                                                                )}
                                                                            >
                                                                                {isSelected && <span className="mr-2">✓</span>}
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

                                            <div className="space-y-2">
                                                <InputLabel value="Langues parlées" className="text-gray-600 dark:text-gray-400" />
                                                <select value={data.languages} onChange={e => setData('languages', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300">
                                                    <option value="">-- Sélectionnez --</option>
                                                    <option value="Français">Français</option>
                                                    <option value="Arabe">Arabe</option>
                                                    <option value="Anglais">Anglais</option>
                                                </select>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <InputLabel value="Mobilité du Candidat" className="text-gray-600 dark:text-gray-400" />
                                                <div className="flex gap-4">
                                                    {['Oui', 'Non'].map(opt => (
                                                        <div key={opt} onClick={() => setData('mobility', opt)} className={cn("flex-1 text-center py-2.5 rounded-xl border-2 cursor-pointer transition-all font-semibold", data.mobility === opt ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400" : "border-gray-200 dark:border-gray-700 text-gray-500")}>
                                                            {opt}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="p-5 bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl border border-rose-200/50 dark:border-rose-800/30">
                                                <InputLabel value="Maladies chroniques ?" className="text-rose-900 dark:text-rose-400 mb-3" />
                                                <div className="flex gap-4">
                                                    {['Oui', 'Non'].map(opt => (
                                                        <div key={opt} onClick={() => setData('has_diseases', opt)} className={cn("flex-1 text-center py-2 rounded-xl border-2 cursor-pointer font-semibold", data.has_diseases === opt ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400" : "border-gray-200 dark:border-gray-700 text-gray-500 bg-white dark:bg-gray-800")}>{opt}</div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="p-5 bg-orange-50/50 dark:bg-orange-900/10 rounded-2xl border border-orange-200/50 dark:border-orange-800/30">
                                                <InputLabel value="Allergies aux animaux ?" className="text-orange-900 dark:text-orange-400 mb-3" />
                                                <div className="flex gap-4">
                                                    {['Oui', 'Non'].map(opt => (
                                                        <div key={opt} onClick={() => setData('pet_allergies', opt)} className={cn("flex-1 text-center py-2 rounded-xl border-2 cursor-pointer font-semibold", data.pet_allergies === opt ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400" : "border-gray-200 dark:border-gray-700 text-gray-500 bg-white dark:bg-gray-800")}>{opt}</div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                                <div className="space-y-2">
                                                    <InputLabel value="Statut" className="text-gray-600 dark:text-gray-400" />
                                                    <select value={data.status} onChange={e => setData('status', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300">
                                                        <option value="active">Actif</option>
                                                        <option value="inactive">Inactif</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <InputLabel value="Source de recrutement" className="text-gray-600 dark:text-gray-400" />
                                                    <select value={data.source} onChange={e => setData('source', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300">
                                                        <option value="">-- Sélectionnez --</option>
                                                        <option value="Facebook">Facebook</option>
                                                        <option value="Recommendation">Recommendation</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="md:col-span-2 space-y-2">
                                                <InputLabel value="Observation Générale *" className="text-gray-600 dark:text-gray-400 font-bold" />
                                                <textarea rows="4" value={data.observation} onChange={e => setData('observation', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl border-gray-200/50 dark:border-gray-700/50 focus:ring-amber-500/50 text-gray-700 dark:text-gray-300"></textarea>
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
                                    type="button" 
                                    onClick={() => navigateStep(currentStep + 1)} 
                                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all hover:scale-105"
                                >
                                    Suivant <FiChevronRight size={20} />
                                </button>
                            ) : (
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-amber-500/30 transition-all hover:scale-105 disabled:opacity-75 disabled:hover:scale-100"
                                >
                                    <FiSave size={20} /> Enregistrer la modification
                                </button>
                            )}
                        </div>
                    </form>\n                </div>\n
                                </div>
                            )}

                            
                            {activeTab === 'Suggestions' && (
                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800/80">
                                        <div className="p-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Clients Proposés (Suggestions)</h3>
                                        </div>
                                        <div className="w-full">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Suggéré Par</th>
                                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                    {profile.suggestions && profile.suggestions.length > 0 ? profile.suggestions.map((sugg) => (
                                                        <tr key={sugg.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase">
                                                                        {sugg.client?.c_nom}
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
                                                                {sugg.status === 'accepted' && (
                                                                    <Link href={route('assignments.create', { client_id: sugg.client_id, profile_id: profile.id })} className="px-3 py-1 bg-indigo-500 text-white rounded text-xs font-bold hover:bg-indigo-600 inline-block">
                                                                        Créer Contrat
                                                                    </Link>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )) : (
                                                        <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 bg-gray-50/30 dark:bg-gray-800/10">Aucune suggestion pour ce profil.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}\n\n                            {activeTab === 'Affectation' && (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800/80">
                                    <div className="p-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Affectations du Profil</h3>
                                        <Link href={route('assignments.create', { profile_id: profile.id })} className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 px-4 py-2 rounded-xl font-medium transition-colors">
                                            <FiPlus size={16} /> Nouvelle Affectation
                                        </Link>
                                    </div>
                                    <div className="w-full">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700/50">
                                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client Associé</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Période</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Budget</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                {profile.assignments && profile.assignments.length > 0 ? profile.assignments.map(assignment => (
                                                    <tr key={assignment.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-gray-900 dark:text-white">{assignment.client?.c_nom || 'N/A'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 text-sm">
                                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                                                                assignment.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 
                                                                assignment.status === 'cancelled' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :
                                                                'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                                                            }`}>
                                                                {assignment.status || 'active'}
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
                                                                    <a href={route('assignments.contract', assignment.id)} target="_blank" className="flex items-center gap-2 text-indigo-600 block w-full px-4 py-2 text-start text-sm leading-5 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-800 dark:focus:bg-gray-800">
                                                                        <FiFileText className="text-indigo-400" /> Générer Contrat
                                                                    </a>
                                                                </Dropdown.Content>
                                                            </Dropdown>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="5" className="py-8 text-center text-gray-500">
                                                            Aucune affectation trouvée pour ce profil.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {['Historique', 'Document'].includes(activeTab) && (
                                <div className="p-12 text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800/50 rounded-2xl shadow-sm text-gray-500 print:hidden">
                                    <p className="font-bold">Module {activeTab} en cours de développement</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
