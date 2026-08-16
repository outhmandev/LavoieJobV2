import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router, usePage } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import CinCheckInput from '@/Components/CinCheckInput';
import LanguageSelector from '@/Components/LanguageSelector';
import ReligionSelector from '@/Components/ReligionSelector';
import PetAllergiesSelector from '@/Components/PetAllergiesSelector';
import DiseaseSelector from '@/Components/DiseaseSelector';
import ChildrenDetailsEditor from '@/Components/ChildrenDetailsEditor';
import DynamicSelect from '@/Components/DynamicSelect';
import Dropdown from '@/Components/Dropdown';
import GroupedMissionsManager from '@/Components/GroupedMissionsManager';
import { FiArrowLeft, FiSave, FiCheckCircle, FiChevronRight, FiChevronLeft, FiUser, FiMapPin, FiBriefcase, FiStar, FiPrinter, FiMail, FiPhone, FiCalendar, FiClock, FiMoreVertical, FiEdit2, FiTrash2, FiPlus, FiFileText, FiEye, FiDownload, FiFile, FiUploadCloud, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ImageCropper from '@/Components/ImageCropper';
import { PROFILE_STATUSES, RECRUITMENT_SOURCES, SPOKEN_LANGUAGES, RELIGIONS, EDUCATION_LEVELS, EDUCATION_SPECIALTIES, SALARY_PERIODS, getProfileStatusBadgeClass } from '@/constants';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const steps = [
    { id: 1, name: 'Profil', icon: FiUser },
    { id: 2, name: 'Contact', icon: FiMapPin },
    { id: 3, name: 'Expérience', icon: FiBriefcase },
    { id: 4, name: 'Compétences', icon: FiStar },
];

const formatDateForInput = (val) => {
    if (!val) return '';
    const s = String(val).trim();
    if (s.includes('T')) return s.split('T')[0];
    if (s.includes(' ')) return s.split(' ')[0];
    return s.substring(0, 10);
};

export default function Edit({ profile, projects = [], statuses = [], hasActiveContract = false }) {
    const availableStatuses = Array.from(new Set([
        profile.status,
        profile.statut,
        ...(statuses || [])
    ].filter(Boolean)));

    const { auth } = usePage().props;

    // Extract JSON criteria fields if they exist
    const criteria = profile.criteria || {};

    const { data, setData, put, processing, errors } = useForm({
        matricule: profile.matricule || profile.mat || '',
        full_name: profile.full_name || profile.nom || '',
        cin: profile.cin || '',
        cin_validity: formatDateForInput(profile.cin_validity || profile.cin_v),
        birth_date: formatDateForInput(profile.birth_date || profile.date_naissance),
        birth_city: profile.birth_city || profile.ville_o || '',
        nationality: profile.nationality || profile.nationalite || 'Maroc',
        religion: profile.religion || '',
        education_level: profile.education_level || profile.niveau || '',
        education_specialty: profile.education_specialty || '',
        marital_status: profile.marital_status || profile.situation_familiale || '',
        children_count: profile.children_count || profile.nombre_enfant || '',
        children_details: profile.children_details || profile.enfants_details || '',
        cin_address: profile.cin_address || profile.adresse_cin || '',
        origin_city: profile.origin_city || profile.ville_origin || '',
        current_address: profile.current_address || profile.current_adresse || '',
        current_city: profile.current_city || profile.ville_a || '',
        email: profile.email || '',
        phone_1: profile.phone_1 || profile.gsm1 || profile.gsm_1 || '',
        phone_2: profile.phone_2 || profile.gsm2 || profile.gsm_2 || '',
        source: profile.source || '',
        rate: Number(profile.rate) || 0,
        status: profile.status || profile.statut || 'Disponible',
        project_id: profile.project_id || '',
        job: profile.job || profile.fonction || '',
        min_price: profile.min_price || '',
        max_price: profile.max_price || '',
        salary_period: criteria.salary_period || 'Mensuel',
        experience_years: profile.experience_years || '',
        experience_details: profile.experience_details || '',
        mobility: profile.mobility || 'Oui',
        languages: profile.languages || '',
        has_diseases: (profile.has_diseases === true || profile.has_diseases === 1 || profile.has_diseases === 'Oui') ? 'Oui' : 'Non',
        smoker: profile.smoker || 'Non',
        drinker: profile.drinker || 'Non',
        pet_allergies: (profile.pet_allergies === true || profile.pet_allergies === 1 || profile.pet_allergies === 'Oui') ? 'Oui' : 'Non',
        allergy_details: profile.allergy_details || '',
        tranche_age: profile.tranche_age || '',
        enfants_gardes: profile.enfants_gardes || '',
        observation: profile.observation || '',

        mode_emploi: criteria.mode_emploi || '',
        type_contrat: criteria.type_contrat || '',
        repos: criteria.repos || '',
        missions: criteria.missions || [],
        blacklist_motif: profile.blacklist_motif || ''
    });

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedProject, setSelectedProject] = useState(projects.find(p => String(p.id) === String(profile.project_id)) || null);

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
        if (e && e.preventDefault) e.preventDefault();
        if (currentStep !== steps.length) {
            return;
        }
        // In Inertia, file uploads using PUT methods are not directly supported by PHP/Laravel
        // So we use POST and spoof the PUT method.
        if (data.avatar) {
            router.post(route('profiles.update', profile.id), {
                ...data,
                _method: 'put',
            }, {
                forceFormData: true,
            });
        } else {
            put(route('profiles.update', profile.id));
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
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

    // Dynamic data fetching for Historique and Documents
    const [audits, setAudits] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [uploadType, setUploadType] = useState('CIN (Recto & Verso)');
    const [uploadingDoc, setUploadingDoc] = useState(false);
    
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    const [cropperOpen, setCropperOpen] = useState(false);
    const [cropperImageSrc, setCropperImageSrc] = useState(null);
    const [cinPreviews, setCinPreviews] = useState([]);
    const [cvPreview, setCvPreview] = useState(null);

    const onSelectAvatar = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => setCropperImageSrc(reader.result?.toString() || ''));
            reader.readAsDataURL(e.target.files[0]);
            setCropperOpen(true);
            e.target.value = null;
        }
    };

    const handleCinChange = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        const newFiles = [...(data.cin_files || []), ...files];
        setData('cin_files', newFiles);
        setCinPreviews(newFiles.map(f => URL.createObjectURL(f)));
        e.target.value = null;
    };

    const removeCinFile = (index, e) => {
        e.preventDefault();
        e.stopPropagation();
        const newFiles = [...(data.cin_files || [])];
        newFiles.splice(index, 1);
        setData('cin_files', newFiles);
        
        const newPreviews = [...cinPreviews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setCinPreviews(newPreviews);
    };

    const handleCvChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setData('cv_file', file);
        setCvPreview(file.name);
    };

    React.useEffect(() => {
        if (activeTab === 'Historique') {
            setLoadingData(true);
            window.axios.get(route('admin.audits.model', { model: 'Profile', id: profile.id }))
                .then(res => setAudits(res.data))
                .catch(err => console.error(err))
                .finally(() => setLoadingData(false));
        } else if (activeTab === 'Document') {
            setLoadingData(true);
            window.axios.get(route('documents.index', { documentable_type: 'Profile', documentable_id: profile.id }))
                .then(res => setDocuments(res.data))
                .catch(err => console.error(err))
                .finally(() => setLoadingData(false));
        }
    }, [activeTab, profile.id]);

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setSelectedFiles(files);
        
        // Generate preview URLs (up to 3)
        const newPreviewUrls = files.slice(0, 3).map(file => URL.createObjectURL(file));
        setPreviewUrls(newPreviewUrls);
    };

    const confirmUpload = () => {
        if (!selectedFiles.length) return;
        setUploadingDoc(true);
        
        let typeToUse = uploadType;
        if (uploadType === 'CIN (Recto & Verso)') {
            typeToUse = 'CIN';
        }

        const uploadPromises = selectedFiles.map((file, index) => {
            const formData = new FormData();
            formData.append('documentable_type', 'Profile');
            formData.append('documentable_id', profile.id);
            
            let specificType = typeToUse;
            if (uploadType === 'CIN (Recto & Verso)') {
                specificType = index === 0 ? 'CIN - Recto' : 'CIN - Verso';
            }
            
            formData.append('type', specificType);
            formData.append('file', file);

            return window.axios.post(route('documents.store'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        });

        Promise.all(uploadPromises)
            .then(responses => {
                const newDocs = responses.map(res => res.data.document).reverse();
                setDocuments([...newDocs, ...documents]);
                setSelectedFiles([]);
                setPreviewUrls([]);
            })
            .catch(err => {
                console.error(err);
                alert("Erreur lors de l'upload des documents.");
            })
            .finally(() => {
                setUploadingDoc(false);
            });
    };

    const handleDeleteDoc = (docId) => {
        if (!window.confirm("Voulez-vous supprimer ce document ?")) return;
        window.axios.delete(route('documents.destroy', docId))
            .then(() => {
                setDocuments(documents.filter(d => d.id !== docId));
            })
            .catch(err => console.error(err));
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDelete = () => {
        const profileName = profile?.nom || profile?.full_name || 'ce profil';
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le profil candidat "${profileName}" ? Cette action est irréversible.`)) {
            router.delete(route('profiles.destroy', profile.id));
        }
    };

    const navigateStep = (newStep) => {
        setPage([newStep, newStep > currentStep ? 1 : -1]);
        setCurrentStep(newStep);
    };

    const isLallaGhalia = selectedProject && (selectedProject.name === 'LALLA GHALIA' || selectedProject.name === 'LALLA LGHALIA');
    const isNounou = ['NOUBONNE', 'NOUNOU', 'NOUNOU OCCASIONNELLE', 'NOUBONNE OCCASIONNELLE'].includes(data.job);
    const showNounouFields = isLallaGhalia && isNounou;

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
                                {profile?.nom || profile?.full_name}
                            </h2>
                            <p className="text-sm text-gray-500">{profile?.education_specialty || 'Profil Polyvalent'} - {profile?.rate || 0} étoiles</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors shadow-sm text-sm">
                            <FiPrinter size={18} />
                            <span className="hidden sm:inline">Imprimer le CV</span>
                        </button>
                        <button 
                            type="button" 
                            onClick={handleDelete} 
                            className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-bold rounded-lg border border-rose-200 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors shadow-sm text-sm"
                        >
                            <FiTrash2 size={18} />
                            <span className="hidden sm:inline">Supprimer Profil</span>
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

                                <div className="flex gap-1 text-amber-400 mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <FiStar key={i} className={i < (profile.rate || 0) ? 'fill-current' : ''} />
                                    ))}
                                </div>

                                <span className="text-gray-600 dark:text-gray-400 font-medium text-sm mb-2">
                                    {profile.status || profile.statut || 'Disponible'}
                                </span>

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
                                <div className="bg-indigo-50 dark:bg-indigo-900/10 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                                    <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Salaire</div>
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
                                                        <span className="font-bold text-indigo-600">Immédiate</span>
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
                                                        <div>
                                                            <span>{profile.children_count || profile.nombre_enfant || 0}</span>
                                                            {(() => {
                                                                let raw = profile.children_details || profile.enfants_details;
                                                                if (!raw) return null;
                                                                let kids = [];
                                                                if (typeof raw === 'string' && raw.trim().startsWith('[')) {
                                                                    try { kids = JSON.parse(raw); } catch (e) { kids = []; }
                                                                } else if (Array.isArray(raw)) {
                                                                    kids = raw;
                                                                }
                                                                if (kids.length > 0) {
                                                                    return (
                                                                        <div className="mt-1 space-y-0.5 text-xs text-gray-600 dark:text-gray-400">
                                                                            {kids.map((k, idx) => (
                                                                                <div key={idx}>
                                                                                    • {k.gender === 'Garçon' ? '👦 Garçon' : (k.gender === 'Fille' ? '👧 Fille' : 'Enfant')}
                                                                                    {k.age ? ` (${k.age})` : ''}
                                                                                    {k.comment ? ` : ${k.comment}` : ''}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    );
                                                                }
                                                                return null;
                                                            })()}
                                                        </div>
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

                                    {/* Form Container */}
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
                                                        key={page} custom={direction} variants={slideVariants}
                                                        initial="enter" animate="center" exit="exit"
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        {/* STEP 1: Profil */}
                                                        {currentStep === 1 && (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                <div className="md:col-span-2 flex items-center gap-3 mb-2">
                                                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400"><FiUser size={20} /></div>
                                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Profil Personnel</h3>
                                                                </div>

                                                                {/* File Uploads */}
                                                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                                                    
                                                                    {/* Photo de profil */}
                                                                    <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-sm relative group transition-all">
                                                                        <InputLabel value="Photo de profil" className="text-center font-bold text-indigo-900 dark:text-indigo-300 mb-3" />
                                                                        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-indigo-200 dark:border-indigo-500/30 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-white dark:hover:bg-gray-900 transition-all overflow-hidden relative">
                                                                            {data.avatar || profile.avatar ? (
                                                                                <div className="absolute inset-0 w-full h-full p-2 bg-white dark:bg-gray-900 flex justify-center items-center">
                                                                                    <img src={data.avatar ? URL.createObjectURL(data.avatar) : `/storage/${profile.avatar}`} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-indigo-100 shadow-md" />
                                                                                </div>
                                                                            ) : (
                                                                                <div className="flex flex-col items-center justify-center">
                                                                                    <FiUploadCloud className="w-6 h-6 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                                                                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Modifier la photo</span>
                                                                                </div>
                                                                            )}
                                                                            <input type="file" onChange={onSelectAvatar} accept="image/*" className="hidden" />
                                                                        </label>
                                                                    </div>

                                                                    {/* CIN / Passeport */}
                                                                    <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-sm relative group transition-all">
                                                                        <InputLabel value="CIN / Passeport (Multiple)" className="text-center font-bold text-indigo-900 dark:text-indigo-300 mb-3" />
                                                                        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-indigo-200 dark:border-indigo-500/30 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-white dark:hover:bg-gray-900 transition-all overflow-hidden relative">
                                                                            {cinPreviews.length > 0 ? (
                                                                                <div className="absolute inset-0 w-full h-full p-2 bg-white dark:bg-gray-900 flex justify-center items-center gap-2 overflow-x-auto">
                                                                                    {cinPreviews.map((url, i) => (
                                                                                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-indigo-100 shadow-sm shrink-0 group/img">
                                                                                            <img src={url} className="w-full h-full object-cover" />
                                                                                            <button type="button" onClick={(e) => removeCinFile(i, e)} className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity">
                                                                                                <FiX size={12} />
                                                                                            </button>
                                                                                        </div>
                                                                                    ))}
                                                                                    <div className="w-16 h-16 rounded-lg border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center shrink-0 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors">
                                                                                        <FiUploadCloud className="text-indigo-400" size={16} />
                                                                                        <span className="text-[10px] text-gray-500 mt-1 font-medium">Ajouter</span>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="flex flex-col items-center justify-center">
                                                                                    <FiFile className="w-6 h-6 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                                                                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Nouveaux fichiers...</span>
                                                                                </div>
                                                                            )}
                                                                            <input type="file" multiple onChange={handleCinChange} className="hidden" />
                                                                        </label>
                                                                    </div>

                                                                    {/* CV */}
                                                                    <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-sm relative group transition-all">
                                                                        <InputLabel value="CV (Document)" className="text-center font-bold text-indigo-900 dark:text-indigo-300 mb-3" />
                                                                        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-indigo-200 dark:border-indigo-500/30 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-white dark:hover:bg-gray-900 transition-all overflow-hidden relative">
                                                                            {cvPreview ? (
                                                                                <div className="absolute inset-0 w-full h-full p-3 bg-white dark:bg-gray-900 flex flex-col justify-center items-center text-center">
                                                                                    <FiFileText size={24} className="text-indigo-500 mb-2" />
                                                                                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 truncate w-full px-2" title={cvPreview}>{cvPreview}</span>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="flex flex-col items-center justify-center">
                                                                                    <FiFileText className="w-6 h-6 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                                                                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Nouveau CV...</span>
                                                                                </div>
                                                                            )}
                                                                            <input type="file" onChange={handleCvChange} className="hidden" />
                                                                        </label>
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
                                                                        <CinCheckInput value={data.cin} onChange={e => setData('cin', e.target.value)} type="all" excludeId={profile?.id} className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl" />
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

                                                                <ChildrenDetailsEditor
                                                                    count={data.children_count}
                                                                    onCountChange={(val) => {
                                                                        setData(prev => ({ ...prev, children_count: val, nombre_enfant: val }));
                                                                    }}
                                                                    details={data.children_details}
                                                                    onDetailsChange={(val) => {
                                                                        setData(prev => ({ ...prev, children_details: val, enfants_details: val }));
                                                                    }}
                                                                    colorScheme="indigo"
                                                                    label="Enfants"
                                                                />
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

                                                                {showNounouFields && (
                                                                    <div className="grid grid-cols-2 gap-4 md:col-span-2 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-800/30">
                                                                        <div className="space-y-2">
                                                                            <InputLabel value="Tranche d'âge possible de garder" className="text-gray-600 dark:text-gray-400" />
                                                                            <select value={data.tranche_age} onChange={e => setData('tranche_age', e.target.value)} className="w-full bg-white dark:bg-gray-800 rounded-xl border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300">
                                                                                <option value="">-- Sélectionnez --</option>
                                                                                <option value="0 - 1 an">0 - 1 an</option>
                                                                                <option value="1 - 3 ans">1 - 3 ans</option>
                                                                                <option value="3 - 6 ans">3 - 6 ans</option>
                                                                                <option value="6 - 10 ans">6 - 10 ans</option>
                                                                                <option value="+ 10 ans">+ 10 ans</option>
                                                                            </select>
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <InputLabel value="Combien d'enfants pouvez-vous garder ?" className="text-gray-600 dark:text-gray-400" />
                                                                            <select value={data.enfants_gardes} onChange={e => setData('enfants_gardes', e.target.value)} className="w-full bg-white dark:bg-gray-800 rounded-xl border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300">
                                                                                <option value="">-- Sélectionnez --</option>
                                                                                <option value="1">1 enfant</option>
                                                                                <option value="2">2 enfants</option>
                                                                                <option value="3">3 enfants</option>
                                                                                <option value="4+">4 et plus</option>
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-2">
                                                                        <InputLabel value="Niveau d'étude" className="text-gray-600 dark:text-gray-400" />
                                                                        <DynamicSelect 
                                                                            value={data.education_level} 
                                                                            onChange={val => setData('education_level', val)} 
                                                                            options={EDUCATION_LEVELS}
                                                                            className="w-full h-[42px]"
                                                                        />
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
                                                                        <GroupedMissionsManager
                                                                            groupedMissions={selectedProject.grouped_missions || {}}
                                                                            selectedMissions={data.missions}
                                                                            onChange={(newMissions) => setData('missions', newMissions)}
                                                                        />
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

                                                                <div className="space-y-2">
                                                                    <InputLabel value="Tabagiste (Fumeur)" className="text-gray-600 dark:text-gray-400" />
                                                                    <div className="flex gap-4">
                                                                        {['Oui', 'Non'].map(opt => (
                                                                            <div key={opt} onClick={() => setData('smoker', opt)} className={cn("flex-1 text-center py-2.5 rounded-xl border-2 cursor-pointer transition-all font-semibold", data.smoker === opt ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400" : "border-gray-200 dark:border-gray-700 text-gray-500")}>
                                                                                {opt}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <InputLabel value="Buveur (Alcool)" className="text-gray-600 dark:text-gray-400" />
                                                                    <div className="flex gap-4">
                                                                        {['Oui', 'Non'].map(opt => (
                                                                            <div key={opt} onClick={() => setData('drinker', opt)} className={cn("flex-1 text-center py-2.5 rounded-xl border-2 cursor-pointer transition-all font-semibold", data.drinker === opt ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400" : "border-gray-200 dark:border-gray-700 text-gray-500")}>
                                                                                {opt}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <DiseaseSelector
                                                                    isDiseased={data.has_diseases}
                                                                    onIsDiseasedChange={val => setData('has_diseases', val)}
                                                                    details={data.disease_details}
                                                                    onDetailsChange={val => setData('disease_details', val)}
                                                                />

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
                                                                    {data.status === 'Black liste' && (
                                                                        <div className="space-y-2 md:col-span-2">
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
                                                                        <InputLabel value="Source de recrutement" className="text-gray-600 dark:text-gray-400" />
                                                                        <DynamicSelect 
                                                                            value={data.source} 
                                                                            onChange={val => setData('source', val)} 
                                                                            options={RECRUITMENT_SOURCES}
                                                                            className="w-full h-[42px]"
                                                                        />
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
                                                        className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-amber-500/30 transition-all hover:scale-105 disabled:opacity-75 disabled:hover:scale-100"
                                                    >
                                                        <FiSave size={20} /> Enregistrer la modification
                                                    </button>
                                                )}
                                            </div>
                                        </form>
                                    </div>
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
                                                                    sugg.status === 'accepted' ? "bg-indigo-100 text-indigo-700" :
                                                                        sugg.status === 'rejected' ? "bg-red-100 text-red-700" :
                                                                            "bg-amber-100 text-amber-700"
                                                                )}>
                                                                    {sugg.status === 'accepted' ? 'Accepté' : sugg.status === 'rejected' ? 'Refusé' : 'En cours'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right space-x-2">
                                                                {sugg.status === 'pending' && (
                                                                    <>
                                                                        <button type="button" onClick={() => router.patch(route('suggestions.status', sugg.id), { status: 'accepted' }, { preserveScroll: true })} className="px-3 py-1 bg-indigo-500 text-white rounded text-xs font-bold hover:bg-indigo-600">Accepter</button>
                                                                        <button type="button" onClick={() => router.patch(route('suggestions.status', sugg.id), { status: 'rejected' }, { preserveScroll: true })} className="px-3 py-1 bg-red-500 text-white rounded text-xs font-bold hover:bg-red-600">Refuser</button>
                                                                    </>
                                                                )}
                                                                {(sugg.status === 'accepted' || sugg.status === 'pending') && (
                                                                    hasActiveContract ? (
                                                                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded text-xs font-semibold cursor-not-allowed inline-block">
                                                                            Déjà sous contrat
                                                                        </span>
                                                                    ) : (
                                                                        <Link href={route('assignments.create', { client_id: sugg.client_id, profile_id: profile.id })} className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700 inline-block shadow-sm">
                                                                            Créer Contrat
                                                                        </Link>
                                                                    )
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
                            )}

                            {activeTab === 'Affectation' && (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800/80">
                                    <div className="p-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Affectations du Profil</h3>
                                            {hasActiveContract && (
                                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Ce candidat a un contrat actif en cours.</p>
                                            )}
                                        </div>
                                        {!hasActiveContract && (
                                            <Link href={route('assignments.create', { profile_id: profile.id })} className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 px-4 py-2 rounded-xl font-medium transition-colors">
                                                <FiPlus size={16} /> Nouvelle Affectation
                                            </Link>
                                        )}
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
                                                                <span className="font-semibold text-gray-900 dark:text-white">{assignment.client?.nom || assignment.client?.c_nom || 'N/A'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 text-sm">
                                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                                                                assignment.status === 'Changement' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300' :
                                                                assignment.status === 'Nouvelle' || assignment.status === 'Nouvel' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300' :
                                                                assignment.status === 'completed' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400' :
                                                                assignment.status === 'cancelled' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :
                                                                'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400'
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
                                                            Aucune affectation trouvée pour ce profil.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Historique' && (
                                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800/50 rounded-2xl shadow-sm p-6 print:hidden">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Historique des modifications</h3>
                                    {loadingData ? (
                                        <div className="text-center py-8 text-gray-500">Chargement de l'historique...</div>
                                    ) : audits.length > 0 ? (
                                        <div className="space-y-6">
                                            {audits.map(audit => (
                                                <div key={audit.id} className="flex gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                            <FiUser size={14} />
                                                        </div>
                                                        <div className="w-px h-full bg-gray-200 dark:bg-gray-800 mt-2"></div>
                                                    </div>
                                                    <div className="pb-6 w-full">
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                            {audit.user?.name || 'Système'} <span className="text-gray-500 font-normal">a effectué une modification</span>
                                                        </p>
                                                        <p className="text-xs text-gray-500 mb-3">{new Date(audit.created_at).toLocaleString('fr-FR')}</p>
                                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
                                                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Champs modifiés :</p>
                                                            <ul className="space-y-2">
                                                                {Object.keys(audit.new_values || {}).map(key => (
                                                                    <li key={key} className="text-xs flex flex-wrap gap-2 items-center">
                                                                        <span className="font-medium text-gray-600 dark:text-gray-400">{key}:</span>
                                                                        {(audit.old_values || {})[key] && (
                                                                            <span className="line-through text-red-500 bg-red-50 dark:bg-red-900/20 px-1 rounded">{String((audit.old_values || {})[key])}</span>
                                                                        )}
                                                                        <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1 rounded">{String((audit.new_values || {})[key])}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">Aucun historique disponible pour ce profil.</div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'Document' && (
                                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800/50 rounded-2xl shadow-sm print:hidden p-6 space-y-6">
                                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Documents & Fichiers</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Gérez le CV, CIN, passeport et autres documents liés à ce profil.</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {loadingData ? (
                                            <div className="col-span-2 text-center text-gray-500 py-4">Chargement des documents...</div>
                                        ) : documents.length > 0 ? (
                                            documents.map(doc => (
                                                <div key={doc.id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl flex items-start justify-between group hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors bg-gray-50 dark:bg-gray-800/50">
                                                    <div className="flex items-center gap-4 truncate">
                                                        <div className="w-10 h-10 shrink-0 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                                            <FiFileText size={20} />
                                                        </div>
                                                        <div className="truncate">
                                                            <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{doc.type}</p>
                                                            <p className="text-xs text-gray-500 truncate" title={doc.file_name}>{doc.file_name} • {(doc.size / 1024 / 1024).toFixed(2)} MB</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <a href={route('documents.show', doc.id)} target="_blank" rel="noreferrer" className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700" title="Voir"><FiEye size={14} /></a>
                                                        <a href={route('documents.download', doc.id)} className="p-2 text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700" title="Télécharger"><FiDownload size={14} /></a>
                                                        <button onClick={() => handleDeleteDoc(doc.id)} className="p-2 text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700" title="Supprimer"><FiTrash2 size={14} /></button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-2 text-center text-gray-500 py-4">Aucun document uploadé.</div>
                                        )}
                                    </div>
                                    
                                    {/* Upload Area */}
                                    <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center bg-gray-50/50 dark:bg-gray-800/20">
                                        {!selectedFiles.length ? (
                                            <>
                                                <div className="max-w-xs mx-auto mb-4">
                                                    <InputLabel value="Type de document" />
                                                    <select 
                                                        value={uploadType} 
                                                        onChange={(e) => setUploadType(e.target.value)}
                                                        className="w-full mt-1 border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                                    >
                                                        <option>CIN (Recto & Verso)</option>
                                                        <option>CIN - Recto</option>
                                                        <option>CIN - Verso</option>
                                                        <option>CV</option>
                                                        <option>Passeport</option>
                                                        <option>Autre</option>
                                                    </select>
                                                </div>

                                                <div className="relative group cursor-pointer w-full inline-block mt-2">
                                                    <input type="file" multiple onChange={handleFileUpload} disabled={uploadingDoc} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" title={uploadType === 'CIN (Recto & Verso)' ? 'Sélectionnez le recto et le verso (2 fichiers)' : 'Uploader un fichier'} />
                                                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform rounded-xl flex items-center justify-center mx-auto mb-4">
                                                        {uploadingDoc ? <span className="animate-spin text-xl">⏳</span> : <FiUploadCloud size={24} />}
                                                    </div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                                                        {uploadingDoc ? 'Upload en cours...' : 'Cliquez ou glissez-déposez des fichiers ici'}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">PDF, JPG, PNG (Max 10MB)</p>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="space-y-6">
                                                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Aperçu ({selectedFiles.length} fichier{selectedFiles.length > 1 && 's'}) pour {uploadType}</h4>
                                                
                                                <div className="flex flex-wrap justify-center gap-4">
                                                    {previewUrls.map((url, i) => (
                                                        <div key={i} className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                            {selectedFiles[i]?.type?.startsWith('image/') ? (
                                                                <img src={url} alt="preview" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="flex flex-col items-center justify-center h-full text-indigo-500">
                                                                    <FiFile size={32} />
                                                                    <span className="text-[10px] truncate max-w-full px-2 mt-1">{selectedFiles[i]?.name}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {selectedFiles.length > 3 && (
                                                        <div className="w-32 h-32 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                                                            <span className="text-xl font-bold text-gray-400">+{selectedFiles.length - 3}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="flex justify-center gap-3">
                                                    <button type="button" onClick={() => { setSelectedFiles([]); setPreviewUrls([]); }} disabled={uploadingDoc} className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-colors disabled:opacity-50">Annuler</button>
                                                    <button type="button" onClick={confirmUpload} disabled={uploadingDoc} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold transition-colors disabled:opacity-50">
                                                        {uploadingDoc ? <span className="animate-spin text-sm">⏳</span> : <FiUploadCloud />} 
                                                        Confirmer et Uploader
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {cropperOpen && cropperImageSrc && (
                <ImageCropper 
                    imageSrc={cropperImageSrc} 
                    onCropComplete={(blob) => {
                        const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
                        setData('avatar', file);
                        setCropperOpen(false);
                    }} 
                    onCancel={() => setCropperOpen(false)} 
                />
            )}
        </AuthenticatedLayout>
    );
}
