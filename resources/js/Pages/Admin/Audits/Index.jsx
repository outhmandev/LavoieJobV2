import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { FiActivity, FiClock, FiUser, FiDatabase } from 'react-icons/fi';

export default function Index({ audits }) {
    const formatValue = (value) => {
        if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
        }
        return value;
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-bold text-2xl text-gray-800 dark:text-gray-200 leading-tight">Logs d'Audit</h2>}
        >
            <Head title="Audit Logs" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <FiActivity /> Historique des Activités
                        </h3>
                        <p className="text-sm text-gray-500">Traçabilité complète des modifications sur la plateforme.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-4">Événement</th>
                                <th scope="col" className="px-6 py-4">Utilisateur</th>
                                <th scope="col" className="px-6 py-4">Modèle</th>
                                <th scope="col" className="px-6 py-4">Changements</th>
                                <th scope="col" className="px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {audits.map(audit => (
                                <tr key={audit.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 font-medium">
                                        <span className={`px-2 py-1 rounded text-xs uppercase font-bold
                                            ${audit.event === 'created' ? 'bg-emerald-100 text-emerald-700' : 
                                              audit.event === 'updated' ? 'bg-amber-100 text-amber-700' : 
                                              'bg-rose-100 text-rose-700'}`}>
                                            {audit.event}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                                            <FiUser className="text-gray-400" />
                                            {audit.user ? audit.user.name : 'Système'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <FiDatabase className="text-gray-400" />
                                            {audit.auditable_type.split('\\').pop()} (ID: {audit.auditable_id})
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        {Object.keys(audit.new_values || {}).length > 0 && (
                                            <div className="mb-2">
                                                <strong className="text-emerald-600 block mb-1">Nouveau :</strong>
                                                <pre className="bg-gray-50 dark:bg-gray-900 p-2 rounded text-gray-700 dark:text-gray-300 max-w-xs overflow-x-auto">
                                                    {JSON.stringify(audit.new_values, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                        {Object.keys(audit.old_values || {}).length > 0 && (
                                            <div>
                                                <strong className="text-amber-600 block mb-1">Ancien :</strong>
                                                <pre className="bg-gray-50 dark:bg-gray-900 p-2 rounded text-gray-700 dark:text-gray-300 max-w-xs overflow-x-auto">
                                                    {JSON.stringify(audit.old_values, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <FiClock />
                                            {new Date(audit.created_at).toLocaleString('fr-FR')}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {audits.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 italic">
                                        Aucune activité enregistrée pour le moment.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
