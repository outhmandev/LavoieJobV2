import React from 'react';
import PortalLayout from '@/Layouts/PortalLayout';
import { Head, useForm } from '@inertiajs/react';

// SVGs
const CheckIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const XIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const UserIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const BriefcaseIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;

export default function SuggestionsIndex({ auth, suggestions }) {
    const { patch, processing } = useForm();

    const handleStatusUpdate = (id, status) => {
        if (confirm(`Êtes-vous sûr de vouloir ${status === 'accepted' ? 'accepter' : 'refuser'} cette proposition ?`)) {
            patch(route('portal.suggestions.status', id), {
                data: { status },
                preserveScroll: true,
            });
        }
    };

    return (
        <PortalLayout
            user={auth.user}
            header={<h2 className="text-2xl font-bold text-gray-900">Profils Suggérés</h2>}
        >
            <Head title="Profils Suggérés - Portail Client" />

            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {suggestions.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            Aucun profil ne vous a été suggéré pour le moment.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {suggestions.map((suggestion) => (
                                <div key={suggestion.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        
                                        {/* Profile Info */}
                                        <div className="flex items-start gap-4">
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-inner">
                                                {suggestion.profile?.avatar ? (
                                                    <img src={`/storage/${suggestion.profile.avatar}`} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
                                                ) : (
                                                    <UserIcon className="w-8 h-8 sm:w-10 sm:h-10" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-900 flex flex-wrap items-center gap-2">
                                                            {suggestion.profile?.full_name || 'Candidat inconnu'}
                                                            {suggestion.match_score > 0 && (
                                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                                    suggestion.match_score >= 80 ? 'bg-green-100 text-green-800' : 
                                                                    suggestion.match_score >= 50 ? 'bg-orange-100 text-orange-800' : 
                                                                    'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                    🎯 {suggestion.match_score}% Match
                                                                </span>
                                                            )}
                                                            {suggestion.profile?.rate && (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                    ★ {suggestion.profile.rate}
                                                                </span>
                                                            )}
                                                        </h3>
                                                        <p className="text-sm font-medium text-blue-600 mt-1 flex items-center gap-1.5">
                                                            <BriefcaseIcon />
                                                            {suggestion.profile?.job || 'Fonction non spécifiée'}
                                                        </p>
                                                    </div>
                                                    
                                                    {/* Date and Status Info */}
                                                    <div className="flex flex-col items-start sm:items-end gap-2 text-xs text-gray-500">
                                                        <span>Suggéré le {new Date(suggestion.created_at).toLocaleDateString('fr-FR')}</span>
                                                    </div>
                                                </div>

                                                {/* Detailed Profile Grid */}
                                                <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                                        <span className="block text-gray-500 text-xs mb-1 uppercase tracking-wider font-semibold">Expérience</span>
                                                        <span className="font-medium text-gray-900">{suggestion.profile?.experience_years ? `${suggestion.profile.experience_years} ans` : 'Non spécifié'}</span>
                                                    </div>
                                                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                                        <span className="block text-gray-500 text-xs mb-1 uppercase tracking-wider font-semibold">Ville</span>
                                                        <span className="font-medium text-gray-900">{suggestion.profile?.current_city || 'Non spécifié'}</span>
                                                    </div>
                                                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                                        <span className="block text-gray-500 text-xs mb-1 uppercase tracking-wider font-semibold">Formation</span>
                                                        <span className="font-medium text-gray-900">{suggestion.profile?.education_level || 'Non spécifié'}</span>
                                                    </div>
                                                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                                        <span className="block text-gray-500 text-xs mb-1 uppercase tracking-wider font-semibold">Nationalité</span>
                                                        <span className="font-medium text-gray-900">{suggestion.profile?.nationality || 'Non spécifié'}</span>
                                                    </div>
                                                </div>
                                                
                                                {/* Secondary Info Rows */}
                                                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                                                    {suggestion.profile?.marital_status && (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-medium text-gray-500">Statut:</span>
                                                            <span>{suggestion.profile.marital_status} ({suggestion.profile.children_count || 0} enfant(s))</span>
                                                        </div>
                                                    )}
                                                    {suggestion.profile?.mobility === 'Oui' && (
                                                        <div className="flex items-center gap-1.5 text-green-600 font-medium">
                                                            <CheckIcon /> Mobile
                                                        </div>
                                                    )}
                                                    {(suggestion.profile?.min_price || suggestion.profile?.max_price) && (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-medium text-gray-500">Tarif estimé:</span>
                                                            <span className="font-medium text-gray-900">
                                                                {suggestion.profile?.min_price} MAD {suggestion.profile?.max_price ? `- ${suggestion.profile.max_price} MAD` : ''}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3 self-start md:self-auto">
                                            {suggestion.status === 'pending' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(suggestion.id, 'accepted')}
                                                        disabled={processing}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 font-medium text-sm rounded-lg hover:bg-green-100 transition-colors"
                                                    >
                                                        <CheckIcon />
                                                        Accepter
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(suggestion.id, 'rejected')}
                                                        disabled={processing}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 font-medium text-sm rounded-lg hover:bg-red-100 transition-colors"
                                                    >
                                                        <XIcon />
                                                        Refuser
                                                    </button>
                                                </>
                                            ) : (
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                                                    suggestion.status === 'accepted'
                                                        ? 'bg-green-50 text-green-700 border-green-200'
                                                        : 'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                    {suggestion.status === 'accepted' ? 'Accepté' : 'Refusé'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Observation */}
                                    {suggestion.observation && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-700">
                                            <span className="font-semibold block mb-1">Message de l'agence :</span>
                                            {suggestion.observation}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PortalLayout>
    );
}
