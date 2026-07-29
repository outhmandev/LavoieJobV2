import React from 'react';
import PortalLayout from '@/Layouts/PortalLayout';
import { Head, useForm } from '@inertiajs/react';

// SVGs
const SaveIcon = () => <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>;

export default function CriteriaEdit({ auth, client, projects, isOnboarding, flash }) {
    const { data, setData, put, processing, errors } = useForm({
        project_id: client.project_id || '',
        c_fonction: client.c_fonction || '',
        c_prix_max: client.c_prix_max || '',
        c_ville_a: client.c_ville_a || '',
        c_presence_animaux: client.c_presence_animaux || 'Non',
        c_p_nationalite: client.c_p_nationalite || '',
        c_p_religion: client.c_p_religion || '',
        c_mode: client.c_mode || '',
        c_logement: client.c_logement || '',
        c_observation: client.c_observation || '',
    });

    const handleProjectChange = (e) => {
        const pId = e.target.value;
        const proj = projects.find(p => p.id == pId);
        setData(prev => ({
            ...prev,
            project_id: pId,
            c_fonction: proj ? proj.name : ''
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('portal.criteria.update', isOnboarding ? { onboarding: 1 } : {}), {
            preserveScroll: true,
        });
    };

    return (
        <PortalLayout
            user={auth.user}
            header={<h2 className="text-2xl font-bold text-gray-900">Mes Critères de Recherche</h2>}
        >
            <Head title="Mes Critères - Portail Client" />

            <div className="max-w-4xl mx-auto">
                {isOnboarding ? (
                    <div className="mb-6 p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md">
                        <h2 className="text-2xl font-bold mb-2">Bienvenue sur LavoieJob ! 🎉</h2>
                        <p className="text-blue-100">
                            Pour pouvoir vous proposer les candidats parfaits, nous avons besoin de connaître vos critères de recherche.
                            Veuillez remplir ce court formulaire pour commencer.
                        </p>
                    </div>
                ) : flash?.success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        {flash.success}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 sm:p-8 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {isOnboarding ? 'Configuration de votre profil' : 'Mettez à jour vos préférences'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Ces critères nous permettent de calculer le pourcentage de compatibilité avec les candidats que nous vous suggérons.
                        </p>
                    </div>

                    <form onSubmit={submit} className="p-6 sm:p-8 space-y-8">
                        {/* Section 1: Fonction & Budget */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Le Rôle</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Besoin Principal (Service) <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                        value={data.project_id}
                                        onChange={handleProjectChange}
                                        required
                                    >
                                        <option value="">Sélectionnez un service...</option>
                                        {projects?.map(project => (
                                            <option key={project.id} value={project.id}>
                                                {project.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.project_id && <div className="mt-1 text-sm text-red-600">{errors.project_id}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Budget Maximum (MAD)
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                        value={data.c_prix_max}
                                        onChange={e => setData('c_prix_max', e.target.value)}
                                        placeholder="Ex: 4000"
                                    />
                                    {errors.c_prix_max && <div className="mt-1 text-sm text-red-600">{errors.c_prix_max}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type de Contrat
                                    </label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                        value={data.c_mode}
                                        onChange={e => setData('c_mode', e.target.value)}
                                    >
                                        <option value="">Non spécifié</option>
                                        <option value="Temps plein">Temps plein</option>
                                        <option value="Temps partiel">Temps partiel</option>
                                        <option value="Occasionnel">Occasionnel</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Logement & Préférences */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Localisation & Maison</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ville <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                        value={data.c_ville_a}
                                        onChange={e => setData('c_ville_a', e.target.value)}
                                        placeholder="Ex: Casablanca"
                                        required
                                    />
                                    {errors.c_ville_a && <div className="mt-1 text-sm text-red-600">{errors.c_ville_a}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Présence d'animaux
                                    </label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                        value={data.c_presence_animaux}
                                        onChange={e => setData('c_presence_animaux', e.target.value)}
                                    >
                                        <option value="Non">Non</option>
                                        <option value="Oui">Oui</option>
                                    </select>
                                    {errors.c_presence_animaux && <div className="mt-1 text-sm text-red-600">{errors.c_presence_animaux}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Hébergement fourni
                                    </label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                        value={data.c_logement}
                                        onChange={e => setData('c_logement', e.target.value)}
                                    >
                                        <option value="">Non spécifié</option>
                                        <option value="Logé">Logé (Oui)</option>
                                        <option value="Non Logé">Non Logé</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Préférences Spécifiques */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Préférences (Optionnel)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Préférence de Nationalité
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                        value={data.c_p_nationalite}
                                        onChange={e => setData('c_p_nationalite', e.target.value)}
                                        placeholder="Ex: Marocaine"
                                    />
                                    {errors.c_p_nationalite && <div className="mt-1 text-sm text-red-600">{errors.c_p_nationalite}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Préférence de Religion
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                        value={data.c_p_religion}
                                        onChange={e => setData('c_p_religion', e.target.value)}
                                        placeholder="Ex: Islam"
                                    />
                                    {errors.c_p_religion && <div className="mt-1 text-sm text-red-600">{errors.c_p_religion}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Remarques */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date de début souhaitée & autres remarques
                            </label>
                            <textarea
                                rows={3}
                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                value={data.c_observation}
                                onChange={e => setData('c_observation', e.target.value)}
                                placeholder="Précisez votre date de début souhaitée ou d'autres détails importants..."
                            />
                            {errors.c_observation && <div className="mt-1 text-sm text-red-600">{errors.c_observation}</div>}
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className={`inline-flex items-center px-6 py-3 bg-blue-600 border border-transparent rounded-xl font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm ${processing ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {processing ? 'Enregistrement...' : (
                                    <>
                                        <SaveIcon />
                                        Enregistrer mes critères
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </PortalLayout>
    );
}
