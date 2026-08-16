import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router, usePage } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Dropdown from '@/Components/Dropdown';
import ChildrenDetailsEditor from '@/Components/ChildrenDetailsEditor';
import LanguageSelector from '@/Components/LanguageSelector';
import DomesticAnimalsSelector from '@/Components/DomesticAnimalsSelector';
import DynamicSelect from '@/Components/DynamicSelect';
import DiseaseSelector from '@/Components/DiseaseSelector';
import GroupedMissionsManager from '@/Components/GroupedMissionsManager';
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

export default function Edit({ client, projects = [], profiles = [], statuses = [] }) {
    const { auth } = usePage().props;
    
    const availableStatuses = Array.from(new Set([...(statuses || []), client.status, client.statut, client.c_statut].filter(Boolean)));

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
        domicare_data: {
            lien_patient: client?.domicare_data?.lien_patient || '',
            patient_nom: client?.domicare_data?.patient_nom || '',
            patient_cin: client?.domicare_data?.patient_cin || '',
            patient_assurance: client?.domicare_data?.patient_assurance || '',
            patient_age: client?.domicare_data?.patient_age || '',
            patient_nationalite: client?.domicare_data?.patient_nationalite || 'Marocaine',
            patient_adresse: client?.domicare_data?.patient_adresse || '',
            patient_ville: client?.domicare_data?.patient_ville || '',
            patient_gsm1: client?.domicare_data?.patient_gsm1 || '',
            patient_gsm2: client?.domicare_data?.patient_gsm2 || '',
            patient_situation_mat: client?.domicare_data?.patient_situation_mat || '',
            patient_situation_vie: client?.domicare_data?.patient_situation_vie || '',
            patient_profil: client?.domicare_data?.patient_profil || '',
            patient_autonomie: client?.domicare_data?.patient_autonomie || '',
            conscience: client?.domicare_data?.conscience || '',
            respiration: client?.domicare_data?.respiration || '',
            fatigue: client?.domicare_data?.fatigue || 'Non',
            douleur: client?.domicare_data?.douleur || 'Non',
            etat_psy: client?.domicare_data?.etat_psy || '',
            memoire: client?.domicare_data?.memoire || '',
            etat_cutane: client?.domicare_data?.etat_cutane || '',
            continence: client?.domicare_data?.continence || '',
            nutrition: client?.domicare_data?.nutrition || '',
            motif_appel: client?.domicare_data?.motif_appel || '',
            ambulance: client?.domicare_data?.ambulance || 'Non',
            autres_besoins: client?.domicare_data?.autres_besoins || '',
            profil_recherche: client?.domicare_data?.profil_recherche || '',
            urgence: client?.domicare_data?.urgence || '',
        }, 
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
        blacklist_motif: client?.blacklist_motif || '',
    });

    const [currentStep, setCurrentStep] = useState(1);
    
    const isDomicare = selectedProject?.name === "DOMICARE";
    const steps = isDomicare ? domicareSteps : standardSteps;
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

    // Dynamic data fetching for Historique and Documents
    const [audits, setAudits] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [reclamations, setReclamations] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [uploadType, setUploadType] = useState('CIN - Recto');

    // Reclamation form state
    const [isReclamationFormOpen, setIsReclamationFormOpen] = useState(false);
    const [reclamationForm, setReclamationForm] = useState({
        profil_litigieux: '',
        description: '',
        resolu: false,
        date_reclamation: new Date().toISOString().slice(0, 16) // datetime-local format YYYY-MM-DDThh:mm
    });
    const [submittingReclamation, setSubmittingReclamation] = useState(false);

    React.useEffect(() => {
        if (activeTab === 'Historique') {
            setLoadingData(true);
            window.axios.get(route('admin.audits.model', { model: 'Client', id: client.id }))
                .then(res => setAudits(res.data))
                .catch(err => console.error(err))
                .finally(() => setLoadingData(false));
        } else if (activeTab === 'Document') {
            setLoadingData(true);
            window.axios.get(route('documents.index', { documentable_type: 'Client', documentable_id: client.id }))
                .then(res => setDocuments(res.data))
                .catch(err => console.error(err))
                .finally(() => setLoadingData(false));
        } else if (activeTab === 'Réclamation') {
            setLoadingData(true);
            window.axios.get(route('reclamations.index', { client_id: client.id }))
                .then(res => setReclamations(res.data))
                .catch(err => console.error(err))
                .finally(() => setLoadingData(false));
        }
    }, [activeTab, client.id]);

    const handleReclamationSubmit = (e) => {
        e.preventDefault();
        setSubmittingReclamation(true);
        window.axios.post(route('reclamations.store'), {
            client_id: client.id,
            ...reclamationForm
        })
        .then(res => {
            setReclamations([res.data.reclamation, ...reclamations]);
            setIsReclamationFormOpen(false);
            setReclamationForm({ profil_litigieux: '', description: '', resolu: false, date_reclamation: new Date().toISOString().slice(0, 16) });
        })
        .catch(err => {
            console.error(err);
            alert("Erreur lors de la création de la réclamation.");
        })
        .finally(() => setSubmittingReclamation(false));
    };

    const handleUpdateReclamationStatus = (reclamationId, isResolu) => {
        window.axios.put(route('reclamations.update', reclamationId), { resolu: isResolu })
            .then(res => {
                setReclamations(reclamations.map(r => r.id === reclamationId ? { ...r, resolu: isResolu } : r));
            })
            .catch(err => console.error(err));
    };

    const handleDeleteReclamation = (reclamationId) => {
        if (!window.confirm("Voulez-vous supprimer cette réclamation ?")) return;
        window.axios.delete(route('reclamations.destroy', reclamationId))
            .then(() => {
                setReclamations(reclamations.filter(r => r.id !== reclamationId));
            })
            .catch(err => console.error(err));
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setUploadingDoc(true);
        
        let typeToUse = uploadType;
        if (uploadType === 'CIN (Recto & Verso)') {
            typeToUse = 'CIN';
        }

        const uploadPromises = files.map((file, index) => {
            const formData = new FormData();
            formData.append('documentable_type', 'Client');
            formData.append('documentable_id', client.id);
            
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
            })
            .catch(err => {
                console.error(err);
                alert("Erreur lors de l'upload des documents.");
            })
            .finally(() => {
                setUploadingDoc(false);
                e.target.value = null; // reset input
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
                                                <select value={data.status} onChange={e => {setData('status', e.target.value); setData('statut', e.target.value); setData('c_statut', e.target.value);}} className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200/50 dark:border-gray-700/50 rounded-xl text-gray-700 dark:text-gray-300">
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
                                                        <label key={opt} className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-emerald-50 flex-1 justify-center">
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
                                                <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-4 border-b pb-2">L'évaluation de l'état du bénéficiaire</h4>
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
                                                        <label key={opt} className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-amber-50 flex-1 justify-center">
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
                                                        <label key={opt} className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-red-50 flex-1 justify-center">
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
                                                    <select
                                                        value={data.status || data.statut || data.c_statut}
                                                        onChange={e => {
                                                            setData('status', e.target.value);
                                                            setData('statut', e.target.value);
                                                            setData('c_statut', e.target.value);
                                                        }}
                                                        className="w-full bg-gray-50 dark:bg-gray-800 border-gray-200/50 dark:border-gray-700/50 rounded-xl text-gray-700 dark:text-gray-300"
                                                    >
                                                        {availableStatuses.map(st => (
                                                            <option key={st} value={st}>{st}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {(data.status === 'Black liste' || data.statut === 'Black liste' || data.c_statut === 'Black liste') && (
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
                                    {!isDomicare && currentStep === 2 && (
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
                                    {!isDomicare && currentStep === 3 && (
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
                            )}

                            {activeTab === 'Affectation' && (
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
                                        <div className="text-center py-8 text-gray-500">Aucun historique disponible pour ce client.</div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'Réclamation' && (
                                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800/50 rounded-2xl shadow-sm p-6 print:hidden space-y-6">
                                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Gestion des Réclamations</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Suivi et historique des plaintes et requêtes.</p>
                                        </div>
                                        <button 
                                            onClick={() => setIsReclamationFormOpen(!isReclamationFormOpen)}
                                            className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50 font-bold rounded-xl text-sm transition-colors flex items-center gap-2"
                                        >
                                            {isReclamationFormOpen ? 'Annuler' : <><FiPlus /> Nouvelle Réclamation</>}
                                        </button>
                                    </div>

                                    {isReclamationFormOpen && (
                                        <div className="bg-gray-50 dark:bg-gray-800/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 mb-6">
                                            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Ajouter une réclamation</h4>
                                            <form onSubmit={handleReclamationSubmit} className="space-y-4">
                                                <div>
                                                    <InputLabel value="Profil litigieux *" />
                                                    <TextInput 
                                                        type="text" 
                                                        className="w-full mt-1 block" 
                                                        value={reclamationForm.profil_litigieux}
                                                        onChange={e => setReclamationForm({...reclamationForm, profil_litigieux: e.target.value})}
                                                        required 
                                                    />
                                                </div>
                                                <div>
                                                    <InputLabel value="Décrivez en détails le problème survenu et les solutions proposées. *" />
                                                    <textarea 
                                                        className="w-full mt-1 border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                                        rows="4"
                                                        value={reclamationForm.description}
                                                        onChange={e => setReclamationForm({...reclamationForm, description: e.target.value})}
                                                        required
                                                    ></textarea>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <InputLabel value="Date de réclamation *" />
                                                        <TextInput 
                                                            type="datetime-local" 
                                                            className="w-full mt-1 block" 
                                                            value={reclamationForm.date_reclamation}
                                                            onChange={e => setReclamationForm({...reclamationForm, date_reclamation: e.target.value})}
                                                            required 
                                                        />
                                                    </div>
                                                    <div>
                                                        <InputLabel value="Problème résolu? *" />
                                                        <div className="mt-2 flex gap-4">
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input 
                                                                    type="radio" 
                                                                    name="resolu"
                                                                    checked={reclamationForm.resolu === true}
                                                                    onChange={() => setReclamationForm({...reclamationForm, resolu: true})}
                                                                    className="text-indigo-600 focus:ring-indigo-500"
                                                                />
                                                                <span className="text-gray-700 dark:text-gray-300">Oui</span>
                                                            </label>
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input 
                                                                    type="radio" 
                                                                    name="resolu"
                                                                    checked={reclamationForm.resolu === false}
                                                                    onChange={() => setReclamationForm({...reclamationForm, resolu: false})}
                                                                    className="text-indigo-600 focus:ring-indigo-500"
                                                                />
                                                                <span className="text-gray-700 dark:text-gray-300">Non</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end pt-2">
                                                    <button 
                                                        type="submit" 
                                                        disabled={submittingReclamation}
                                                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
                                                    >
                                                        {submittingReclamation ? 'Enregistrement...' : 'Enregistrer la réclamation'}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {loadingData ? (
                                            <div className="text-center text-gray-500 py-4">Chargement des réclamations...</div>
                                        ) : reclamations.length > 0 ? (
                                            reclamations.map(reclamation => (
                                                <div key={reclamation.id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl flex flex-col md:flex-row gap-4 justify-between bg-white dark:bg-gray-800/50 hover:border-rose-200 dark:hover:border-rose-800 transition-colors">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h4 className="font-bold text-gray-900 dark:text-white">{reclamation.profil_litigieux || 'Profil non spécifié'}</h4>
                                                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                                                                reclamation.resolu ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400'
                                                            }`}>
                                                                {reclamation.resolu ? 'Problème Résolu' : 'Non Résolu'}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 whitespace-pre-wrap">{reclamation.description || 'Aucune description fournie.'}</p>
                                                        <p className="text-xs text-gray-500">Créée le {new Date(reclamation.date_reclamation || reclamation.created_at).toLocaleString('fr-FR')}</p>
                                                    </div>
                                                    
                                                    <div className="flex flex-col items-end gap-2 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-3 md:pt-0 md:pl-4 min-w-[140px]">
                                                        <select 
                                                            className={`text-sm font-bold border-0 bg-gray-50 dark:bg-gray-900 rounded-lg pr-8 py-1.5 focus:ring-2 ${
                                                                reclamation.resolu ? 'text-emerald-600 focus:ring-emerald-500' : 'text-rose-600 focus:ring-rose-500'
                                                            }`}
                                                            value={reclamation.resolu ? 'oui' : 'non'}
                                                            onChange={(e) => handleUpdateReclamationStatus(reclamation.id, e.target.value === 'oui')}
                                                        >
                                                            <option value="oui">Résolue</option>
                                                            <option value="non">Non résolue</option>
                                                        </select>

                                                        <button 
                                                            onClick={() => handleDeleteReclamation(reclamation.id)}
                                                            className="text-xs text-gray-400 hover:text-rose-600 flex items-center gap-1 mt-auto transition-colors"
                                                        >
                                                            <FiTrash2 size={12} /> Supprimer
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center text-gray-500 py-8 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                                Aucune réclamation enregistrée.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Document' && (
                                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800/50 rounded-2xl shadow-sm print:hidden p-6 space-y-6">
                                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Documents & Fichiers</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Gérez la CIN, passeport, contrat et autres documents liés à ce client.</p>
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
                                                <option>Passeport</option>
                                                <option>Contrat</option>
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
