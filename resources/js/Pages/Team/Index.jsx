import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    FiUsers, FiShield, FiSearch, FiCheckCircle, FiUserCheck, FiClock
} from 'react-icons/fi';

export default function Index({ users = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('team.index'), { search }, { preserveState: true, replace: true });
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
        if (r.includes('marketing')) {
            return (
                <span key={roleName} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
                    Marketing
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
                            Mon Équipe
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Découvrez tous les collaborateurs et leurs rôles au sein de l'entreprise.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Mon Équipe" />

            <div className="py-6 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                {/* Search Bar */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200/70 dark:border-gray-700/70 flex justify-end">
                    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-80">
                        <div className="relative w-full">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Rechercher un membre..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 dark:text-gray-200 placeholder-gray-400"
                            />
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        </div>
                        <button
                            type="submit"
                            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                        >
                            Filtrer
                        </button>
                    </form>
                </div>

                {/* Team Members Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map(user => {
                        const isPending = user.status === 'pending';
                        return (
                            <div key={user.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200/70 dark:border-gray-700/70 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg border border-indigo-100 dark:border-indigo-800">
                                                {(user.name || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                                                    {user.name}
                                                    {user.two_factor_enabled && (
                                                        <span className="p-0.5 text-emerald-600 dark:text-emerald-400" title="2FA Activé">
                                                            <FiShield size={14} />
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                                    <a href={`mailto:${user.email}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                        {user.email}
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700/60">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium uppercase tracking-wider">Rôles</div>
                                        <div className="flex flex-wrap gap-2">
                                            {user.roles && user.roles.length > 0 
                                                ? user.roles.map(r => getRoleBadge(r.name))
                                                : getRoleBadge(user.role)
                                            }
                                        </div>
                                    </div>

                                    <div className="mt-5 flex items-center justify-between">
                                        {isPending ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                                <FiClock size={12} />
                                                En attente
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
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {users.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/70 dark:border-gray-700/70">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-2xl flex items-center justify-center mb-4">
                                    <FiUsers size={28} className="text-gray-400" />
                                </div>
                                <p className="text-lg font-medium text-gray-900 dark:text-white">Aucun collaborateur trouvé</p>
                                <p className="text-sm mt-1 mb-4 text-gray-500">Aucun membre ne correspond à vos critères de recherche.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
