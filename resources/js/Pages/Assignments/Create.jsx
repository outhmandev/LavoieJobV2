import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { FiArrowLeft, FiSave, FiUser, FiBriefcase, FiAlertCircle, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { useMemo, useEffect } from 'react';

export default function Create({
    clients = [],
    profiles = [],
    selectedClient = null,
    selectedProfile = null,
    suggestions = [],
    defaultStatus = 'Nouvelle',
    clientHasPreviousContracts = false,
}) {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const initialClientId = selectedClient?.id ? String(selectedClient.id) : (params.get('client_id') || '');
    const initialProfileId = selectedProfile?.id ? String(selectedProfile.id) : (params.get('profile_id') || '');

    const { data, setData, post, processing, errors } = useForm({
        client_id: initialClientId,
        profile_id: initialProfileId,
        status: defaultStatus || 'Nouvelle',
        agreed_price: '',
        payment_schedule: '',
        rest_days: '',
        employment_type: '',
        start_date: '',
        end_date: '',
        notes: '',
    });

    // Determine currently available profiles based on selected client
    const availableProfiles = useMemo(() => {
        if (!data.client_id) {
            return profiles;
        }
        const clientSuggestions = suggestions.filter(s => String(s.client_id) === String(data.client_id));
        if (clientSuggestions.length > 0) {
            return clientSuggestions
                .map(s => ({
                    ...(s.profile || {}),
                    suggestion_status: s.status,
                    suggestion_id: s.id,
                }))
                .filter(p => p.id);
        }
        return profiles;
    }, [data.client_id, suggestions, profiles]);

    // Determine currently available clients based on selected profile
    const availableClients = useMemo(() => {
        if (!data.profile_id) {
            return clients;
        }
        const profileSuggestions = suggestions.filter(s => String(s.profile_id) === String(data.profile_id));
        if (profileSuggestions.length > 0) {
            return profileSuggestions
                .map(s => ({
                    ...(s.client || {}),
                    suggestion_status: s.status,
                    suggestion_id: s.id,
                }))
                .filter(c => c.id);
        }
        return clients;
    }, [data.profile_id, suggestions, clients]);

    const activeClient = useMemo(() => {
        if (!data.client_id) return null;
        if (selectedClient && String(selectedClient.id) === String(data.client_id)) return selectedClient;
        return clients.find(c => String(c.id) === String(data.client_id)) ||
            suggestions.find(s => String(s.client_id) === String(data.client_id))?.client;
    }, [data.client_id, selectedClient, clients, suggestions]);

    const activeProfile = useMemo(() => {
        if (!data.profile_id) return null;
        if (selectedProfile && String(selectedProfile.id) === String(data.profile_id)) return selectedProfile;
        return profiles.find(p => String(p.id) === String(data.profile_id)) ||
            suggestions.find(s => String(s.profile_id) === String(data.profile_id))?.profile;
    }, [data.profile_id, selectedProfile, profiles, suggestions]);

    const submit = (e) => {
        e.preventDefault();
        post(route('assignments.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('assignments.index')} className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-700 transition-colors">
                            <FiArrowLeft size={20} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Créer un Nouveau Contrat</h2>
                                {data.status === 'Changement' ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                        Changement de Profil
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                                        Nouvelle Affectation
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Affectation d'un candidat suggéré / accepté à un client et édition du contrat.</p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Créer un Contrat" />

            <div className="max-w-4xl mx-auto pb-12 space-y-6">

                {/* Fiches Récapitulatives des Parties Concernées */}
                {(activeClient || activeProfile) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {activeClient && (
                            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-900/40 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
                                        <FiBriefcase size={20} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Client Concerné</span>
                                        <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">
                                            {activeClient.nom || activeClient.c_nom}
                                        </h4>
                                        <div className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                                            {activeClient.mat && <div><span className="font-semibold text-gray-700 dark:text-gray-300">Réf :</span> MAT-{activeClient.mat}</div>}
                                            {(activeClient.gsm1 || activeClient.phone || activeClient.c_gsm1) && <div><span className="font-semibold text-gray-700 dark:text-gray-300">Tél :</span> {activeClient.gsm1 || activeClient.phone || activeClient.c_gsm1}</div>}
                                            {(activeClient.ville_a || activeClient.c_ville_a) && <div><span className="font-semibold text-gray-700 dark:text-gray-300">Ville :</span> {activeClient.ville_a || activeClient.c_ville_a}</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeProfile && (
                            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-purple-100 dark:border-purple-900/40 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full pointer-events-none" />
                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
                                        <FiUser size={20} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Candidat Concerné</span>
                                        <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">
                                            {activeProfile.full_name || activeProfile.nom}
                                        </h4>
                                        <div className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                                            {(activeProfile.job || activeProfile.fonction) && <div><span className="font-semibold text-gray-700 dark:text-gray-300">Poste :</span> {activeProfile.job || activeProfile.fonction}</div>}
                                            {activeProfile.matricule && <div><span className="font-semibold text-gray-700 dark:text-gray-300">Matricule :</span> {activeProfile.matricule}</div>}
                                            {activeProfile.cin && <div><span className="font-semibold text-gray-700 dark:text-gray-300">CIN :</span> {activeProfile.cin}</div>}
                                            {(activeProfile.phone_1 || activeProfile.phone || activeProfile.tel1) && <div><span className="font-semibold text-gray-700 dark:text-gray-300">Tél :</span> {activeProfile.phone_1 || activeProfile.phone || activeProfile.tel1}</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Avertissement si aucun profil n'est suggéré */}
                {data.client_id && availableProfiles.length === 0 && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl flex items-center gap-3 text-amber-800 dark:text-amber-300 text-sm">
                        <FiAlertCircle className="shrink-0 text-amber-600" size={20} />
                        <div>
                            Aucun candidat disponible (non affecté) n'a encore été suggéré pour ce client. Vous pouvez faire une nouvelle suggestion depuis la fiche client.
                        </div>
                    </div>
                )}

                <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800/80 overflow-hidden">
                    <div className="p-8 space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 mb-6">Conditions & Détails du Contrat</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="client_id" value="Client *" className="text-gray-700 font-semibold" />
                                        <select
                                            id="client_id"
                                            name="client_id"
                                            value={data.client_id}
                                            className="mt-2 block w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm text-gray-900 dark:text-gray-100 transition-colors"
                                            onChange={(e) => {
                                                setData('client_id', e.target.value);
                                            }}
                                            required
                                        >
                                            <option value="">-- choisissez le client --</option>
                                            {availableClients.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.c_nom || c.nom} {c.mat ? `(MAT-${c.mat})` : ''} {c.suggestion_status ? `[${c.suggestion_status === 'accepted' ? 'Accepté' : 'Suggéré'}]` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.client_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="profile_id" value="Candidat / Profil Suggéré (Disponible) *" className="text-gray-700 font-semibold" />
                                        <select
                                            id="profile_id"
                                            name="profile_id"
                                            value={data.profile_id}
                                            className="mt-2 block w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm text-gray-900 dark:text-gray-100 transition-colors"
                                            onChange={(e) => setData('profile_id', e.target.value)}
                                            required
                                        >
                                            <option value="">-- choisissez le candidat disponible --</option>
                                            {availableProfiles.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.full_name || p.nom} {p.fonction || p.job ? `(${p.fonction || p.job})` : ''} {p.suggestion_status ? `[${p.suggestion_status === 'accepted' ? 'Accepté' : 'Suggéré'}]` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.profile_id} className="mt-2" />
                                    </div>
                                </div>

                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="agreed_price" value="Budget final (DHS) *" className="text-gray-700 font-semibold" />
                                        <TextInput
                                            id="agreed_price"
                                            type="number"
                                            name="agreed_price"
                                            min="0"
                                            value={data.agreed_price}
                                            placeholder="Ex: 3500"
                                            className="mt-2 block w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl text-gray-900 dark:text-gray-100"
                                            onChange={(e) => setData('agreed_price', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.agreed_price} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="status" value="Statut du Contrat *" className="text-gray-700 font-semibold" />
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
                                        </select>
                                        <InputError message={errors.status} className="mt-2" />
                                    </div>
                                </div>

                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="payment_schedule" value="Echéance *" className="text-gray-700 font-semibold" />
                                        <select
                                            id="payment_schedule"
                                            name="payment_schedule"
                                            value={data.payment_schedule || ''}
                                            className="mt-2 block w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm text-gray-900 dark:text-gray-100 transition-colors"
                                            onChange={(e) => setData('payment_schedule', e.target.value)}
                                            required
                                        >
                                            <option value="">-- choisissez --</option>
                                            <option value="Hebdomadaire">Hebdomadaire</option>
                                            <option value="Quinzaine">Quinzaine</option>
                                            <option value="Mensuel">Mensuel</option>
                                        </select>
                                        <InputError message={errors.payment_schedule} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="rest_days" value="Repos *" className="text-gray-700 font-semibold" />
                                        <select
                                            id="rest_days"
                                            name="rest_days"
                                            value={data.rest_days || ''}
                                            className="mt-2 block w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm text-gray-900 dark:text-gray-100 transition-colors"
                                            onChange={(e) => setData('rest_days', e.target.value)}
                                            required
                                        >
                                            <option value="">-- choisissez --</option>
                                            <option value="Hebdomadaire">Hebdomadaire</option>
                                            <option value="Quinzaine">Quinzaine</option>
                                            <option value="Mensuel">Mensuel</option>
                                        </select>
                                        <InputError message={errors.rest_days} className="mt-2" />
                                    </div>
                                </div>

                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="employment_type" value="Mode d'emploi *" className="text-gray-700 font-semibold" />
                                        <select
                                            id="employment_type"
                                            name="employment_type"
                                            value={data.employment_type || ''}
                                            className="mt-2 block w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm text-gray-900 dark:text-gray-100 transition-colors"
                                            onChange={(e) => setData('employment_type', e.target.value)}
                                            required
                                        >
                                            <option value="">-- choisissez --</option>
                                            <option value="Couchante">Couchante</option>
                                            <option value="Non Couchante">Non Couchante</option>
                                            <option value="Stage">Stage</option>
                                            <option value="Plein temps">Plein temps</option>
                                            <option value="Temps partiel">Temps partiel</option>
                                            <option value="Freelance">Freelance</option>
                                            <option value="CDD">CDD</option>
                                            <option value="CDI">CDI</option>
                                            <option value="Job Etudiant">Job Etudiant</option>
                                            <option value="Contrat pro">Contrat de professionnalisation</option>
                                            <option value="Télétravail">Télétravail</option>
                                            <option value="Mission intérim">Mission intérim</option>
                                            <option value="Saisonnier">Saisonnier</option>
                                            <option value="Bénévolat">Bénévolat</option>
                                            <option value="Consultant">Consultant</option>
                                            <option value="Volontariat">Volontariat</option>
                                        </select>
                                        <InputError message={errors.employment_type} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="start_date" value="Date début *" className="text-gray-700 font-semibold" />
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
                                </div>

                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="end_date" value="Date de fin" className="text-gray-700 font-semibold" />
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
                                    <div>
                                        {/* Helper message */}
                                        <div className="h-full flex items-center pt-6 text-xs text-gray-500 dark:text-gray-400">
                                            {data.status === 'Changement' && (
                                                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                                    <FiRefreshCw size={14} /> Ce contrat est marqué comme <strong>Changement</strong> (Remplacement de profil pour ce client).
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="notes" value="Note" className="text-gray-700 font-semibold" />
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        value={data.notes || ''}
                                        rows="4"
                                        className="mt-2 block w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm text-gray-900 dark:text-gray-100"
                                        onChange={(e) => setData('notes', e.target.value)}
                                    ></textarea>
                                    <InputError message={errors.notes} className="mt-2" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 px-8 py-5 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-4">
                        <Link href={route('assignments.index')} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            Annuler
                        </Link>
                        <button
                            disabled={processing}
                            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 hover:shadow-md transition-all duration-200 disabled:opacity-75"
                        >
                            <FiSave size={18} />
                            Enregistrer le Contrat
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
