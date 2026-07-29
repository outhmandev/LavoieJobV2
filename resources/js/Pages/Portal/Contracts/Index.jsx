import React from 'react';
import PortalLayout from '@/Layouts/PortalLayout';
import { Head } from '@inertiajs/react';

// SVGs
const FileTextIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const DownloadIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const UserIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;

export default function ContractsIndex({ auth, contracts }) {
    return (
        <PortalLayout
            user={auth.user}
            header={<h2 className="text-2xl font-bold text-gray-900">Mes Contrats</h2>}
        >
            <Head title="Mes Contrats - Portail Client" />

            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {contracts.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                            <FileTextIcon className="w-12 h-12 text-gray-300 mb-3" />
                            Vous n'avez aucun contrat actif pour le moment.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {contracts.map((contract) => (
                                <div key={contract.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        
                                        {/* Contract Info */}
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                                                <FileTextIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                                    Contrat #{contract.id}
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                        contract.status === 'active'
                                                            ? 'bg-green-50 text-green-700 border-green-200'
                                                            : contract.status === 'completed'
                                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                            : 'bg-gray-100 text-gray-700 border-gray-200'
                                                    }`}>
                                                        {contract.status}
                                                    </span>
                                                </h3>
                                                
                                                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1.5 font-medium">
                                                        <UserIcon className="w-4 h-4 text-gray-400" />
                                                        {contract.candidate_profile?.cp_nom || 'Candidat inconnu'}
                                                    </span>
                                                    <span className="hidden sm:inline text-gray-300">•</span>
                                                    <span>
                                                        Du {new Date(contract.start_date).toLocaleDateString('fr-FR')} 
                                                        {contract.end_date ? ` au ${new Date(contract.end_date).toLocaleDateString('fr-FR')}` : ' (Indéterminé)'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3 self-start md:self-auto">
                                            <a
                                                href={route('portal.contracts.download', contract.id)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-medium text-sm rounded-lg hover:bg-indigo-100 transition-colors"
                                            >
                                                <DownloadIcon />
                                                Télécharger PDF
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PortalLayout>
    );
}
