import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    FiUsers, FiUserPlus, FiEdit2, FiTrash2, FiShield,
    FiBriefcase, FiSearch, FiCheckCircle, FiUserCheck, FiFilter,
    FiMail, FiClock, FiSend
} from 'react-icons/fi';

export default function Index({ users = [], filters = {}, roles = [], projects = [] }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || 'all');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.users.index'), {
            search,
            role: selectedRole,
        }, { preserveState: true, replace: true });
    };

    const handleRoleFilter = (role) => {
        setSelectedRole(role);
        router.get(route('admin.users.index'), {
            search,
            role,
        }, { preserveState: true, replace: true });
    };

    const handleDelete = (user) => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.name}" (${user.email}) ? Cette action est irréversible.`)) {
            router.delete(route('admin.users.destroy', user.id));
        }
    };

    const handleResendInvitation = (user) => {
        if (confirm(`Renvoyer une invitation sécurisée à ${user.name} (${user.email}) ?`)) {
            router.post(route('admin.users.resend-invitation', user.id));
        }
    };

    const getRoleBadge = (roleName) => {
        const r = (roleName || '').toLowerCase();
        if (r.includes('super admin') || r.includes('system administrator')) {
            return (
                <span key={roleName} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    <FiShield size={12} />
                    {roleName}
                </span>
            );
        }
        if (r.includes('admin')) {
            return (
                <span key={roleName} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    <FiShield size={12} />
                    {roleName}
                </span>
            );
        }
        if (r.includes('membre') || r.includes('member')) {
            return (
                <span key={roleName} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <FiUserCheck size={12} />
                    Membre
                </span>
            );
        }
        if (r.includes('client')) {
            return (
                <span key={roleName} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Client
                </span>
            );
        }
        return (
            <span key={roleName} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {roleName || 'N/A'}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-4">
                    <div>
                        <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight flex items-center gap-2.5">
                            <FiUsers className="text-indigo-600 dark:text-indigo-400" />
                            Gestion des Membres & Utilisateurs
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Gérez les accès, les affectations aux projets et le statut d'invitation des membres de l'équipe.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.users.create')}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition-all text-sm"
                        >
                            <FiUserPlus size={18} />
                            Inviter un Membre
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Gestion des Membres" />

            <div className="py-6 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                {/* Filters & Search Bar */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200/70 dark:border-gray-700/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                        {['all', 'Membre', 'Admin', 'Super Admin', 'System Administrator'].map((role) => (
                            <button
                                key={role}
                                onClick={() => handleRoleFilter(role)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                                    selectedRole === role
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                {role === 'all' ? 'Tous les membres' : role}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-80">
                        <div className="relative w-full">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Rechercher par nom, e-mail..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 dark:text-gray-200 placeholder-gray-400"
                            />
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        </div>
                        <button
                            type="submit"
                            className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold transition-colors"
                        >
                            Filtrer
                        </button>
                    </form>
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200/70 dark:border-gray-700/70 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700/50">
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Collaborateur</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rôles</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Projets Assignés</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut Compte</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                {users.map(user => {
                                    const isPending = user.status === 'pending';
                                    return (
                                        <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-750 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                                                        {(user.name || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                                                            {user.name}
                                                            {user.two_factor_enabled && (
                                                                <span className="p-0.5 text-emerald-600 dark:text-emerald-400" title="2FA Activé">
                                                                    <FiShield size={13} />
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-wrap gap-1.5 max-w-xs">
                                                    {user.roles && user.roles.length > 0 
                                                        ? user.roles.map(r => getRoleBadge(r.name))
                                                        : getRoleBadge(user.role)
                                                    }
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-wrap gap-1.5 max-w-xs">
                                                    {user.projects?.map(p => (
                                                        <span key={p.id} className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                                                            {p.name}
                                                        </span>
                                                    ))}
                                                    {(!user.projects || user.projects.length === 0) && (
                                                        <span className="text-xs text-gray-400 italic">Tous / Non restreint</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm">
                                                {isPending ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                                        <FiClock size={12} />
                                                        Invitation en attente
                                                    </span>
                                                ) : user.is_online ? (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                        En ligne
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                                                        <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                                        Actif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {isPending && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleResendInvitation(user)}
                                                            className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg transition-colors"
                                                            title="Renvoyer l'invitation"
                                                        >
                                                            <FiSend size={15} />
                                                        </button>
                                                    )}
                                                    <Link
                                                        href={route('admin.users.edit', user.id)}
                                                        className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-colors"
                                                        title="Modifier le membre"
                                                    >
                                                        <FiEdit2 size={16} />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(user)}
                                                        className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                                                        title="Supprimer le membre"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-500">
                                                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-2xl flex items-center justify-center mb-4">
                                                    <FiUsers size={28} className="text-gray-400" />
                                                </div>
                                                <p className="text-lg font-medium text-gray-900 dark:text-white">Aucun utilisateur trouvé</p>
                                                <p className="text-sm mt-1 mb-4 text-gray-500">Aucun membre ne correspond à vos critères de recherche.</p>
                                                <Link
                                                    href={route('admin.users.create')}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                                                >
                                                    <FiUserPlus size={14} /> Inviter un membre
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
