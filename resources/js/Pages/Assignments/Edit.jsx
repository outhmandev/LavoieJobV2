import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router, usePage } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { FiArrowLeft, FiSave, FiFileText, FiUser, FiBriefcase, FiPhone, FiMapPin, FiCheckCircle, FiLock, FiRefreshCw, FiAlertTriangle, FiDownload, FiClock, FiXCircle, FiZap } from 'react-icons/fi';
import { useMemo, useState } from 'react';
import RequestContractModal from '@/Pages/ContractRequests/RequestContractModal';

export default function Edit({ assignment, client, profile, availableProfiles = [] }) {
    const { auth } = usePage().props;
    const isSuperAdmin = Boolean(
        auth?.isSuperAdmin || 
        ['super admin', 'system administrator', 'superadmin'].includes(auth?.user?.role?.toLowerCase())
    );

    const currentClient = client || assignment.client;
    const initialProfile = profile || assignment.profile;
    const latestRequest = assignment.latest_contract_request || (assignment.contract_requests && assignment.contract_requests[0]);

    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isGeneratingDirect, setIsGeneratingDirect] = useState(false);

    const handleDirectGenerate = () => {
        if (confirm('Voulez-vous générer immédiatement le document contractuel pour cette affectation sans soumettre de demande préalable ?')) {
            setIsGeneratingDirect(true);
            router.post(route('assignments.direct-contract', assignment.id), {}, {
                preserveScroll: true,
                onFinish: () => setIsGeneratingDirect(false),
            });
        }
    };

    const { data, setData, put, processing, errors } = useForm({
        client_id: assignment.client_id || (currentClient ? currentClient.id : ''),
        profile_id: assignment.profile_id || (initialProfile ? initialProfile.id : ''),
        status: assignment.status || 'Nouvelle',
        agreed_price: assignment.agreed_price || '',
        payment_schedule: assignment.payment_schedule || '',
        rest_days: assignment.rest_days || '',
        employment_type: assignment.employment_type || '',
        start_date: assignment.start_date ? String(assignment.start_date).split('T')[0] : '',
        end_date: assignment.end_date ? String(assignment.end_date).split('T')[0] : '',
        notes: assignment.notes || '',
    });

    const isProfileChanged = useMemo(() => {
        return String(data.profile_id) !== String(assignment.profile_id);
    }, [data.profile_id, assignment.profile_id]);

    const activeProfile = useMemo(() => {
        if (!data.profile_id) return initialProfile;
        if (String(data.profile_id) === String(initialProfile?.id)) return initialProfile;
        return availableProfiles.find(p => String(p.id) === String(data.profile_id)) || initialProfile;
    }, [data.profile_id, initialProfile, availableProfiles]);

    const handleProfileChange = (newProfileId) => {
        setData(prevData => ({
            ...prevData,
            profile_id: newProfileId,
            status: String(newProfileId) !== String(assignment.profile_id) ? 'Changement' : assignment.status
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('assignments.update', assignment.id));
    };

    return (
        <AuthenticatedLayout 
            header={
                <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-4">
                    <div className="flex items-center gap-4">
                        <Link href={route('assignments.index')} className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                            <FiArrowLeft size={20} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    Contrat / Affectation #{assignment.id}
                                </h2>
                                {data.status === 'Changement' ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                        Changement
                                    </span>
                                ) : data.status === 'Nouvelle' ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                                        Nouvelle
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                                        {data.status}
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Workflow contractuel & conditions d'emploi.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {latestRequest?.status === 'completed' ? (
                            <div className="flex items-center gap-2">
                                {isSuperAdmin && (
                                    <button
                                        type="button"
                                        onClick={handleDirectGenerate}
                                        disabled={isGeneratingDirect}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm shadow-sm transition-all disabled:opacity-50"
                                        title="Régénérer le contrat PDF avec les dernières données"
                                    >
                                        <FiRefreshCw size={16} className={isGeneratingDirect ? 'animate-spin' : ''} />
                                        {isGeneratingDirect ? 'Régénération...' : 'Régénérer'}
                                    </button>
                                )}
                                <a
                                    href={route('contract-requests.download', latestRequest.id)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-all"
                                >
                                    <FiDownload size={18} /> Télécharger Contrat (PDF)
                                </a>
                            </div>
                        ) : isSuperAdmin ? (
                            <button
                                type="button"
                                onClick={handleDirectGenerate}
                                disabled={isGeneratingDirect}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-all hover:scale-105 disabled:opacity-50"
                            >
                                <FiZap size={18} className="text-amber-300" />
                                {isGeneratingDirect ? 'Génération en cours...' : '⚡ Générer le Contrat (Super Admin)'}
                            </button>
                        ) : latestRequest?.status === 'pending' ? (
                            <Link
                                href={route('contract-requests.index', { search: latestRequest.id })}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm shadow-sm transition-all"
                            >
                                <FiClock size={18} /> En attente Super Admin (#{latestRequest.id})
                            </Link>
                        ) : latestRequest?.status === 'generating' ? (
                            <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm shadow-sm">
                                <FiRefreshCw size={18} className="animate-spin" /> Génération en cours...
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsRequestModalOpen(true)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-all"
                            >
                                <FiFileText size={18} /> Demander l'approbation du contrat
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`Contrat #${assignment.id}`} />


            <div className="max-w-4xl mx-auto pb-12 space-y-6">

                {/* Changement de Profil Alert */}
                {isProfileChanged && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl flex items-center gap-3 text-amber-800 dark:text-amber-300 text-sm">
                        <FiAlertTriangle className="shrink-0 text-amber-600 text-lg" />
                        <div>
                            <strong>Changement de profil détecté :</strong> Le candidat assigné à ce contrat a été modifié. Le statut passera automatiquement à <strong>Changement</strong> lors de l'enregistrement.
                        </div>
                    </div>
                )}

                {/* Parties Concernées par le Contrat */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Client Card */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 relative overflow-hidden">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                                    <FiBriefcase size={22} />
                                </div>
                                <div>
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md mb-1">
                                        Client Concerné
                                    </span>
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {currentClient?.nom || currentClient?.c_nom || 'Client non spécifié'}
                                    </h4>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                <FiLock size={12} /> Fixé
                            </span>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/60 grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <span className="text-gray-500 dark:text-gray-400 block">Matricule / Réf:</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                    {currentClient?.mat ? `MAT-${currentClient.mat}` : `#${currentClient?.id || 'N/A'}`}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400 block">Téléphone:</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                    {currentClient?.phone || currentClient?.c_gsm1 || currentClient?.c_tel1 || 'Non renseigné'}
                                </span>
                            </div>
                            {currentClient?.cin && (
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400 block">CIN Client:</span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{currentClient.cin}</span>
                                </div>
                            )}
                            {(currentClient?.city || currentClient?.c_ville || currentClient?.c_ville_a) && (
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400 block">Ville:</span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                                        {currentClient?.city || currentClient?.c_ville || currentClient?.c_ville_a}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Candidat Card */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 relative overflow-hidden">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                {activeProfile?.avatar ? (
                                    <img 
                                        src={activeProfile.avatar} 
                                        alt={activeProfile.full_name} 
                                        className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-gray-700" 
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
                                        <FiUser size={22} />
                                    </div>
                                )}
                                <div>
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-md mb-1">
                                        Candidat Concerné {isProfileChanged && '(Modifié)'}
                                    </span>
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {activeProfile?.full_name || activeProfile?.nom || 'Candidat non spécifié'}
                                    </h4>
                                </div>
                            </div>
                            {isProfileChanged ? (
                                <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                                    <FiRefreshCw size={12} /> Changement
                                </span>
                            ) : (
                                <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                    <FiCheckCircle size={12} /> Actuel
                                </span>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/60 grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <span className="text-gray-500 dark:text-gray-400 block">Poste Proposé:</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                    {activeProfile?.job || activeProfile?.fonction || 'Non défini'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400 block">Matricule:</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                    {activeProfile?.matricule ? `MAT-${activeProfile.matricule}` : `#${activeProfile?.id || 'N/A'}`}
                                </span>
                            </div>
                            {activeProfile?.cin && (
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400 block">CIN Candidat:</span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{activeProfile.cin}</span>
                                </div>
                            )}
                            {activeProfile?.phone_1 && (
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400 block">Téléphone:</span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{activeProfile.phone_1}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Formulaire des Termes du Contrat */}
                <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800/80 overflow-hidden">
                    <div className="p-8 space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 mb-6 flex items-center justify-between">
                                <span>Conditions & Profil du Contrat</span>
                                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                                    Modifiez les détails convenus ou changez de candidat
                                </span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Profil / Candidat Selector */}
                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="profile_id" value="Candidat Assigné (Changer de profil)" className="text-gray-700 dark:text-gray-300 font-semibold" />
                                    <select
                                        id="profile_id"
                                        name="profile_id"
                                        value={data.profile_id}
                                        className="mt-2 block w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm text-gray-900 dark:text-gray-100 transition-colors font-medium"
                                        onChange={(e) => handleProfileChange(e.target.value)}
                                        required
                                    >
                                        {availableProfiles.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.full_name || p.nom} {p.matricule ? `(MAT-${p.matricule})` : ''} {p.job || p.fonction ? `[${p.job || p.fonction}]` : ''} {String(p.id) === String(assignment.profile_id) ? '— Candidat Actuel' : '— Nouveau Candidat Suggéré'}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.profile_id} className="mt-2" />
                                </div>

                                {/* Budget final */}
                                <div>
                                    <InputLabel htmlFor="agreed_price" value="Budget final convenu (DHS) *" className="text-gray-700 dark:text-gray-300 font-semibold" />
                                    <TextInput
                                        id="agreed_price"
                                        type="number"
                                        name="agreed_price"
                                        min="0"
                                        step="0.01"
                                        value={data.agreed_price}
                                        placeholder="Ex: 3500"
                                        className="mt-2 block w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl text-gray-900 dark:text-gray-100"
                                        onChange={(e) => setData('agreed_price', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.agreed_price} className="mt-2" />
                                </div>

                                {/* Statut */}
                                <div>
                                    <InputLabel htmlFor="status" value="Statut du Contrat *" className="text-gray-700 dark:text-gray-300 font-semibold" />
                                    <select
                                        id="status"
                                        name="status"
                                        value={data.status}
                                        className="mt-2 block w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm text-gray-900 dark:text-gray-100 transition-colors"
                                        onChange={(e) => setData('status', e.target.value)}
                                        required
                                    >
                                        <option value="Nouvelle">Nouvelle (Nouvelle Affectation)</option>
                                        <option value="Changement">Changement (Changement de profil / Remplacement)</option>
                                        <option value="active">Actif (En cours)</option>
                                        <option value="completed">Terminé / Clôturé</option>
                                        <option value="cancelled">Annulé</option>
                                    </select>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>

                                {/* Echeance */}
                                <div>
                                    <InputLabel htmlFor="payment_schedule" value="Échéance de paiement *" className="text-gray-700 dark:text-gray-300 font-semibold" />
                                    <select
                                        id="payment_schedule"
                                        name="payment_schedule"
                                        value={data.payment_schedule || ''}
                                        className="mt-2 block w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm text-gray-900 dark:text-gray-100 transition-colors"
                                        onChange={(e) => setData('payment_schedule', e.target.value)}
                                    >
                                        <option value="">-- Sélectionnez l'échéance --</option>
                                        <option value="Hebdomadaire">Hebdomadaire</option>
                                        <option value="Quinzaine">Quinzaine</option>
                                        <option value="Mensuel">Mensuel</option>
                                        <option value="Par prestation">Par prestation</option>
                                    </select>
                                    <InputError message={errors.payment_schedule} className="mt-2" />
                                </div>

                                {/* Repos */}
                                <div>
                                    <InputLabel htmlFor="rest_days" value="Repos *" className="text-gray-700 dark:text-gray-300 font-semibold" />
                                    <select
                                        id="rest_days"
                                        name="rest_days"
                                        value={data.rest_days || ''}
                                        className="mt-2 block w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm text-gray-900 dark:text-gray-100 transition-colors"
                                        onChange={(e) => setData('rest_days', e.target.value)}
                                    >
                                        <option value="">-- Sélectionnez le repos --</option>
                                        <option value="Hebdomadaire">Hebdomadaire (1 jour/semaine)</option>
                                        <option value="Quinzaine">Quinzaine (2 jours/quinzaine)</option>
                                        <option value="Mensuel">Mensuel (4 jours/mois)</option>
                                        <option value="Samedi et Dimanche">Samedi et Dimanche</option>
                                        <option value="Dimanche">Dimanche</option>
                                        <option value="Non applicable">Non applicable</option>
                                    </select>
                                    <InputError message={errors.rest_days} className="mt-2" />
                                </div>

                                {/* Mode d'emploi */}
                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="employment_type" value="Mode d'emploi / Type d'affectation *" className="text-gray-700 dark:text-gray-300 font-semibold" />
                                    <select
                                        id="employment_type"
                                        name="employment_type"
                                        value={data.employment_type || ''}
                                        className="mt-2 block w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm text-gray-900 dark:text-gray-100 transition-colors"
                                        onChange={(e) => setData('employment_type', e.target.value)}
                                    >
                                        <option value="">-- Sélectionnez le mode d'emploi --</option>
                                        <option value="Couchante">Couchante (Logée)</option>
                                        <option value="Non Couchante">Non Couchante</option>
                                        <option value="Plein temps">Plein temps</option>
                                        <option value="Temps partiel">Temps partiel</option>
                                        <option value="Stage">Stage</option>
                                        <option value="CDI">CDI</option>
                                        <option value="CDD">CDD</option>
                                        <option value="Freelance">Freelance</option>
                                        <option value="Mission intérim">Mission intérim</option>
                                        <option value="Saisonnier">Saisonnier</option>
                                    </select>
                                    <InputError message={errors.employment_type} className="mt-2" />
                                </div>

                                {/* Dates */}
                                <div>
                                    <InputLabel htmlFor="start_date" value="Date début du contrat *" className="text-gray-700 dark:text-gray-300 font-semibold" />
                                    <TextInput
                                        id="start_date"
                                        type="date"
                                        name="start_date"
                                        value={data.start_date || ''}
                                        className="mt-2 block w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl text-gray-900 dark:text-gray-100"
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.start_date} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="end_date" value="Date de fin (Optionnel)" className="text-gray-700 dark:text-gray-300 font-semibold" />
                                    <TextInput
                                        id="end_date"
                                        type="date"
                                        name="end_date"
                                        value={data.end_date || ''}
                                        className="mt-2 block w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl text-gray-900 dark:text-gray-100"
                                        onChange={(e) => setData('end_date', e.target.value)}
                                    />
                                    <InputError message={errors.end_date} className="mt-2" />
                                </div>

                                {/* Notes */}
                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="notes" value="Observations / Notes particulières" className="text-gray-700 dark:text-gray-300 font-semibold" />
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        value={data.notes || ''}
                                        rows="3"
                                        placeholder="Conditions particulières, clauses spécifiques..."
                                        className="mt-2 block w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm text-gray-900 dark:text-gray-100"
                                        onChange={(e) => setData('notes', e.target.value)}
                                    ></textarea>
                                    <InputError message={errors.notes} className="mt-2" />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800/50 px-8 py-5 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4">
                        <Link href={route('assignments.index')} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            Retour à la liste
                        </Link>
                        <div className="flex items-center gap-3">
                            <button 
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 hover:shadow-md transition-all duration-200 disabled:opacity-75"
                            >
                                <FiSave size={18} />
                                {processing ? 'Enregistrement...' : 'Enregistrer les modifications'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Contract Request Modal */}
            <RequestContractModal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                assignment={assignment}
            />
        </AuthenticatedLayout>
    );
}


