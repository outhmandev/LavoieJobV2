import React, { useState } from 'react';
import NotificationDropdown from '@/Components/NotificationDropdown';
import ThemeToggle from '@/Components/ThemeToggle';
import { Link, usePage } from '@inertiajs/react';
import {
    FiHome, FiBriefcase, FiFileText, FiSliders,
    FiLogOut, FiMenu, FiX, FiUser
} from 'react-icons/fi';

export default function PortalLayout({ user, header, children }) {
    const { url } = usePage();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        { name: 'Tableau de bord', href: route('portal.dashboard'), icon: FiHome },
        { name: 'Suggestions de Profils', href: route('portal.suggestions.index'), icon: FiBriefcase },
        { name: 'Contrats & Missions', href: route('portal.contracts.index'), icon: FiFileText },
        { name: 'Mes Critères de Recrutement', href: route('portal.criteria.edit'), icon: FiSliders },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 w-72 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="h-full flex flex-col">
                    <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
                            Portail Client
                        </span>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                        {navItems.map((item) => {
                            const active = url.startsWith(new URL(item.href, window.location.origin).pathname);
                            const IconComponent = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                        active
                                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 shadow-sm border border-indigo-100 dark:border-indigo-800/60'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                                    }`}
                                >
                                    <IconComponent className={`w-5 h-5 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                            <FiLogOut size={16} />
                            Déconnexion
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800 rounded-xl"
                    >
                        <FiMenu size={20} />
                    </button>

                    <div className="flex-1 flex justify-end items-center gap-4">
                        <ThemeToggle />
                        <NotificationDropdown />
                        
                        <div className="h-7 w-px bg-slate-200 dark:bg-slate-700"></div>

                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                {(user?.name || 'C').charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">{user?.name}</p>
                                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Espace Entreprise</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {header && (
                        <div className="mb-6">
                            {header}
                        </div>
                    )}
                    {children}
                </main>
            </div>

            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
