import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FiPlus, FiEdit2, FiTrash2, FiMoreVertical, FiBriefcase } from 'react-icons/fi';
import Dropdown from '@/Components/Dropdown';

export default function Index({ assignments }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Active Contrats</h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track and manage candidate placements for your clients.</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                    </div>
                </div>
            }
        >
            <Head title="Assignments" />

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800/80">
                <div className="w-full">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700/50">
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client Company</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assigned Profile</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created By</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {assignments.data.map(assignment => (
                                <tr key={assignment.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                                    <td className="py-4 px-6">
                                        <span className="font-semibold text-gray-900 dark:text-white">{assignment.client?.c_nom || 'N/A'}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                {assignment.profile?.full_name?.charAt(0) || '?'}
                                            </div>
                                            <span className="font-medium text-indigo-600 dark:text-indigo-400">{assignment.profile?.nom || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm">
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                                            {assignment.status || 'active'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                                        {assignment.user?.name || 'System'}
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
                                                    <FiEdit2 className="text-gray-400" /> Modifier / Voir
                                                </Dropdown.Link>
                                                <a
                                                    href={route('assignments.contract', assignment.id)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block w-full px-4 py-2 text-start text-sm leading-5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 flex items-center gap-2 transition duration-150 ease-in-out"
                                                >
                                                    <FiBriefcase className="text-indigo-500" /> Imprimer le contrat
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (confirm('Êtes-vous sûr de vouloir supprimer cette affectation / contrat ?')) {
                                                            router.delete(route('assignments.destroy', assignment.id));
                                                        }
                                                    }}
                                                    className="block w-full px-4 py-2 text-start text-sm leading-5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 transition duration-150 ease-in-out"
                                                >
                                                    <FiTrash2 className="text-rose-500" /> Supprimer
                                                </button>
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                            {assignments.data.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                                                <FiBriefcase size={28} className="text-gray-400" />
                                            </div>
                                            <p className="text-lg font-medium text-gray-900 dark:text-white">No assignments found</p>
                                            <p className="text-sm mt-1 mb-4">No contracts are available yet.</p>
                                        </div>
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
