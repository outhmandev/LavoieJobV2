import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { FiUsers, FiEdit, FiShield } from 'react-icons/fi';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Index({ users }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="font-bold text-2xl text-gray-800 dark:text-gray-200 leading-tight">Gestion des Utilisateurs</h2>}
        >
            <Head title="Utilisateurs" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <FiUsers /> Liste des Utilisateurs
                        </h3>
                        <p className="text-sm text-gray-500">Gérez les utilisateurs, leurs rôles et leurs projets associés.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-4">Utilisateur</th>
                                <th scope="col" className="px-6 py-4">Rôles (Spatie)</th>
                                <th scope="col" className="px-6 py-4">Ancien Rôle</th>
                                <th scope="col" className="px-6 py-4">Projets Assignés</th>
                                <th scope="col" className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                                        <div className="text-xs text-gray-500">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {user.roles.map(r => (
                                                <span key={r.id} className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                                                    <FiShield size={10} /> {r.name}
                                                </span>
                                            ))}
                                            {user.roles.length === 0 && <span className="text-gray-400 italic">Aucun rôle</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-gray-500 border px-2 py-1 rounded">{user.role}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {user.projects?.map(p => (
                                                <span key={p.id} className="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 px-2 py-1 rounded text-xs font-medium">
                                                    {p.name}
                                                </span>
                                            ))}
                                            {!user.projects?.length && <span className="text-gray-400 italic">Aucun projet</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={route('admin.users.edit', user.id)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-2 inline-block">
                                            <FiEdit size={18} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
