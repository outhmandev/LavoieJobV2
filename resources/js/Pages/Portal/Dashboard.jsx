import React from 'react';
import PortalLayout from '@/Layouts/PortalLayout';
import { Head, Link } from '@inertiajs/react';

// SVGs
const BriefcaseIcon = () => <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const FileTextIcon = () => <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

export default function Dashboard({ auth, client, stats }) {
    return (
        <PortalLayout
            user={auth.user}
            header={<h2 className="text-2xl font-bold text-gray-900">Bienvenue, {client.c_nom}</h2>}
        >
            <Head title="Tableau de Bord - Portail Client" />

            <div className="max-w-7xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Suggestions Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                            <BriefcaseIcon />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Profils Suggérés</h3>
                        <p className="text-4xl font-bold text-blue-600 mb-4">{stats.pendingSuggestions}</p>
                        <p className="text-sm text-gray-500 mb-6 flex-1">
                            Vous avez {stats.pendingSuggestions} proposition(s) de profil en attente de votre réponse.
                        </p>
                        <Link
                            href={route('portal.suggestions.index')}
                            className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                        >
                            Voir les suggestions
                        </Link>
                    </div>

                    {/* Contracts Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                            <FileTextIcon />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Contrats Actifs</h3>
                        <p className="text-4xl font-bold text-indigo-600 mb-4">{stats.activeContracts}</p>
                        <p className="text-sm text-gray-500 mb-6 flex-1">
                            Vous avez {stats.activeContracts} contrat(s) en cours de validité avec nous.
                        </p>
                        <Link
                            href={route('portal.contracts.index')}
                            className="inline-flex items-center justify-center px-6 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition-colors w-full sm:w-auto"
                        >
                            Gérer mes contrats
                        </Link>
                    </div>
                </div>
            </div>
        </PortalLayout>
    );
}
