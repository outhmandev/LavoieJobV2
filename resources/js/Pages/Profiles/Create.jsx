import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import CinCheckInput from '@/Components/CinCheckInput';
import LanguageSelector from '@/Components/LanguageSelector';
import ReligionSelector from '@/Components/ReligionSelector';
import PetAllergiesSelector from '@/Components/PetAllergiesSelector';
import { FiArrowLeft, FiSave, FiCheckCircle, FiChevronRight, FiChevronLeft, FiUser, FiMapPin, FiBriefcase, FiStar } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PROFILE_STATUSES, RECRUITMENT_SOURCES, SPOKEN_LANGUAGES, RELIGIONS, EDUCATION_LEVELS, EDUCATION_SPECIALTIES, SALARY_PERIODS } from '@/constants';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const steps = [
    { id: 1, name: 'Profil', icon: FiUser },
    { id: 2, name: 'Contact', icon: FiMapPin },
    { id: 3, name: 'Expérience', icon: FiBriefcase },
    { id: 4, name: 'Compétences', icon: FiStar },
];

export default function Create({ projects = [], statuses = PROFILE_STATUSES }) {
    const availableStatuses = Array.from(new Set([...(statuses || []), ...PROFILE_STATUSES]));

    const { data, setData, post, processing, errors } = useForm({
        matricule: '',
        full_name: '',
        cin: '',
        cin_validity: '',
        birth_date: '',
        birth_city: '',
        nationality: 'Maroc',
        religion: '',
        education_level: '',
        education_specialty: '',
        marital_status: '',
        children_count: '',
        cin_address: '',
        origin_city: '',
        current_address: '',
        current_city: '',
        email: '',
        phone_1: '',
        phone_2: '',
        source: '',
        rate: 0,
        status: 'Disponible',
        project_id: '',
        job: '',
        min_price: '',
        max_price: '',
        salary_period: 'Mensuel',
        experience_years: '',
        experience_details: '',
        mobility: 'Oui',
        languages: '',
        has_diseases: 'Non',
        pet_allergies: 'Non',
        allergy_details: '',
        observation: '',
        mode_emploi: '',
        type_contrat: '',
        repos: '',
        missions: []
    });

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedProject, setSelectedProject] = useState(null);

    const handleProjectChange = (e) => {
        const pId = e.target.value;
        const proj = projects.find(p => String(p.id) === String(pId)) || null;
        setSelectedProject(proj);
        setData(prevData => ({
            ...prevData,
            project_id: pId,
            job: '',
            missions: []
        }));
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
        post(route('profiles.store'));
    };

    // Animation Variants
    const slideVariants = {
        enter: (direction) => ({ x: 0, opacity: 0 }),
        center: { zIndex: 1, x: 0, opacity: 1 },
        exit: (direction) => ({ zIndex: 0, x: 0, opacity: 0 })
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
                        <Link href={route('profiles.index')} className="p-2.5 bg-white/5 dark:bg-gray-800/50  rounded-xl shadow-sm border border-gray-200/20 dark:border-gray-700/50 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all hover:scale-105">
                            <FiArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-600">
                                Nouveau Profil
                            </h2>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-sm font-medium text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-5 py-2 rounded-full shadow-sm">
                        <FiCheckCircle size={16} /> Création Sécurisée
                    </div>
                </div>
            }
        >
            <Head title="Créer un Profil" />

            <div className="max-w-6xl mx-auto pb-20 pt-8">

                {/* Stepper Header */}
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

                                            <div className="space-y-2">
                                                <InputLabel value="Nom et prénom *" className="text-gray-600 dark:text-gray-400" />
                                                <TextInput value={data.full_name} onChange={e => setData('full_name', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl" required />
                                            </div>

                                            <div className="space-y-2">
                                                <InputLabel value="Évaluation du profil" className="text-gray-600 dark:text-gray-400" />
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4, 5].map(star => (
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
                                                    <CinCheckInput value={data.cin} onChange={e => setData('cin', e.target.value)} type="all" className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl" />
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
                                                <ReligionSelector
                                                    value={data.religion}
                                                    onChange={val => setData('religion', val)}
                                                />
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
                                                        {EDUCATION_LEVELS.map(lvl => (
                                                            <option key={lvl} value={lvl}>{lvl}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <InputLabel value="Spécialité" className="text-gray-600 dark:text-gray-400" />
                                                    <select value={data.education_specialty} onChange={e => setData('education_specialty', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300">
                                                        <option value="">-- Sélectionnez --</option>
                                                        {EDUCATION_SPECIALTIES.map(spec => (
                                                            <option key={spec} value={spec}>{spec}</option>
                                                        ))}
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
                                                        <select
                                                            value={data.salary_period || 'Mensuel'}
                                                            onChange={e => setData('salary_period', e.target.value)}
                                                            className="w-full bg-white dark:bg-gray-900 rounded-xl text-lg border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 h-[50px]"
                                                        >
                                                            {SALARY_PERIODS.map(p => (
                                                                <option key={p} value={p}>{p}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 4: Compétences */}
                                    {currentStep === 4 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
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

                                            <LanguageSelector
                                                value={data.languages}
                                                onChange={val => setData('languages', val)}
                                            />

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

                                            <div className="p-5 bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl border border-rose-200/50 dark:border-rose-800/30 self-start">
                                                <InputLabel value="Maladies chroniques ?" className="text-rose-900 dark:text-rose-400 mb-3" />
                                                <div className="flex gap-4">
                                                    {['Oui', 'Non'].map(opt => (
                                                        <div key={opt} onClick={() => setData('has_diseases', opt)} className={cn("flex-1 text-center py-2 rounded-xl border-2 cursor-pointer font-semibold", data.has_diseases === opt ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400" : "border-gray-200 dark:border-gray-700 text-gray-500 bg-white dark:bg-gray-800")}>{opt}</div>
                                                    ))}
                                                </div>
                                            </div>

                                            <PetAllergiesSelector
                                                isAllergic={data.pet_allergies}
                                                onIsAllergicChange={opt => setData('pet_allergies', opt)}
                                                details={data.allergy_details}
                                                onDetailsChange={val => setData('allergy_details', val)}
                                            />

                                            <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                                <div className="space-y-2">
                                                    <InputLabel value="Statut" className="text-gray-600 dark:text-gray-400" />
                                                    <select value={data.status} onChange={e => setData('status', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300">
                                                        {availableStatuses.map(st => (
                                                            <option key={st} value={st}>{st}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <InputLabel value="Source de recrutement" className="text-gray-600 dark:text-gray-400" />
                                                    <select value={data.source} onChange={e => setData('source', e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300">
                                                        <option value="">-- Sélectionnez --</option>
                                                        {RECRUITMENT_SOURCES.map(src => (
                                                            <option key={src} value={src}>{src}</option>
                                                        ))}
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
