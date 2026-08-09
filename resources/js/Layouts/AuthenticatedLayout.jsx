import React, { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import ThemeToggle from '@/Components/ThemeToggle';
import NotificationDropdown from '@/Components/NotificationDropdown';
import ChatWidget from '@/Components/ChatWidget';
import { Link, usePage } from '@inertiajs/react';
import {
    FiHome, FiUsers, FiUserCheck, FiBriefcase, FiFileText,
    FiMenu, FiX, FiSettings, FiShield, FiActivity, FiMail,
    FiChevronDown, FiChevronRight, FiBarChart2, FiLogOut, FiUser
} from 'react-icons/fi';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [categoriesOpen, setCategoriesOpen] = useState({
        overview: true,
        management: true,
        analytics: true,
        admin: true,
    });

    const toggleCategory = (cat) => {
        setCategoriesOpen(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    const isSystemAdmin = ['System Administrator', 'super Admin', 'Super Admin'].includes(user.role) ||
        ['system administrator', 'super admin'].includes((user.role || '').toLowerCase());

    const NavItem = ({ href, active, icon, children }) => (
        <Link
            href={href}
            className={`flex items-center px-4 py-2.5 my-1 rounded-xl text-sm transition-all duration-200 ${
                active
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400 font-bold shadow-sm border border-indigo-100 dark:border-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 font-medium border border-transparent'
            }`}
        >
            <span className={`mr-3 text-lg ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
                {icon}
            </span>
            <span className="truncate">{children}</span>
        </Link>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transform transition-transform duration-300 ease-in-out ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0 lg:static lg:block`}
            >
                <div className="flex items-center justify-between h-20 px-6 border-b border-slate-100 dark:border-slate-800">
                    <Link href="/" className="flex items-center">
                        <ApplicationLogo />
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                    >
                        <FiX size={22} />
                    </button>
                </div>

                <div className="px-4 py-6 space-y-1 overflow-y-auto h-[calc(100vh-5rem)]">
                    {/* Vue d'ensemble */}
                    <div
                        className="mb-1.5 mt-2 px-3 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase cursor-pointer flex justify-between items-center hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        onClick={() => toggleCategory('overview')}
                    >
                        <span>Vue d'ensemble</span>
                        {categoriesOpen.overview ? <FiChevronDown size={13} /> : <FiChevronRight size={13} />}
                    </div>
                    {categoriesOpen.overview && (
                        <NavItem href={route('dashboard')} active={route().current('dashboard')} icon={<FiHome />}>
                            Tableau de bord
                        </NavItem>
                    )}

                    {/* Gestion */}
                    <div
                        className="mt-6 mb-1.5 px-3 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase cursor-pointer flex justify-between items-center hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        onClick={() => toggleCategory('management')}
                    >
                        <span>Gestion Opérationnelle</span>
                        {categoriesOpen.management ? <FiChevronDown size={13} /> : <FiChevronRight size={13} />}
                    </div>
                    {categoriesOpen.management && (
                        <>
                            <NavItem href={route('clients.index')} active={route().current('clients.*')} icon={<FiUsers />}>
                                Clients
                            </NavItem>
                            <NavItem href={route('profiles.index')} active={route().current('profiles.*')} icon={<FiUserCheck />}>
                                Candidats
                            </NavItem>
                            <NavItem href={route('assignments.index')} active={route().current('assignments.*')} icon={<FiBriefcase />}>
                                Affectations
                            </NavItem>
                            <NavItem href={route('contract-requests.index')} active={route().current('contract-requests.*')} icon={<FiFileText />}>
                                Demandes de Contrat
                            </NavItem>
                        </>
                    )}

                    {/* Statistiques (Super Admin & System Admin) */}
                    {isSystemAdmin && (
                        <>
                            <div
                                className="mt-6 mb-1.5 px-3 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase cursor-pointer flex justify-between items-center hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                onClick={() => toggleCategory('analytics')}
                            >
                                <span>Statistiques & Décision</span>
                                {categoriesOpen.analytics ? <FiChevronDown size={13} /> : <FiChevronRight size={13} />}
                            </div>
                            {categoriesOpen.analytics && (
                                <NavItem href={route('admin.analytics.index')} active={route().current('admin.analytics.*')} icon={<FiBarChart2 />}>
                                    Statistiques & Analytics
                                </NavItem>
                            )}
                        </>
                    )}

                    {/* Administration (Super Admin & System Admin) */}
                    {isSystemAdmin && (
                        <>
                            <div
                                className="mt-6 mb-1.5 px-3 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase cursor-pointer flex justify-between items-center hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                onClick={() => toggleCategory('admin')}
                            >
                                <span>Administration Système</span>
                                {categoriesOpen.admin ? <FiChevronDown size={13} /> : <FiChevronRight size={13} />}
                            </div>
                            {categoriesOpen.admin && (
                                <>
                                    <NavItem href={route('admin.projects.index')} active={route().current('admin.projects.*')} icon={<FiSettings />}>
                                        Projets & Métiers
                                    </NavItem>
                                    <NavItem href={route('admin.users.index')} active={route().current('admin.users.*')} icon={<FiUsers />}>
                                        Membres & Accès
                                    </NavItem>
                                    <NavItem href={route('admin.roles.index')} active={route().current('admin.roles.*')} icon={<FiShield />}>
                                        Rôles & Permissions
                                    </NavItem>
                                    <NavItem href={route('admin.audits.index')} active={route().current('admin.audits.*')} icon={<FiActivity />}>
                                        Journal d'Audit
                                    </NavItem>
                                    <NavItem href={route('admin.mail-accounts.index')} active={route().current('admin.mail-accounts.*')} icon={<FiMail />}>
                                        Comptes E-mail
                                    </NavItem>
                                </>
                            )}
                        </>
                    )}
                </div>
            </aside>

            {/* Main Layout Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Enterprise Top Header */}
                <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-40 h-20 flex items-center justify-between px-4 sm:px-6 lg:px-10 shrink-0 transition-colors duration-200">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800 rounded-xl"
                            aria-label="Ouvrir le menu"
                        >
                            <FiMenu size={20} />
                        </button>
                        
                        <div className="hidden sm:block">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Espace de travail
                            </span>
                            <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">
                                LavoieJob Plateforme
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 ml-auto">
                        {/* Theme Switcher Toggle */}
                        <ThemeToggle />

                        {/* Notifications */}
                        <NotificationDropdown />

                        <div className="h-7 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

                        {/* Profile Menu */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group p-1 rounded-xl">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-md group-hover:shadow-indigo-500/25 transition-all duration-200">
                                        {(user.name || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-tight">{user.name}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{user.role || 'Membre'}</span>
                                            {user.two_factor_enabled && (
                                                <span className="inline-flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 font-bold" title="2FA Activé">
                                                    • 2FA
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <FiChevronDown className="hidden md:block text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" size={14} />
                                </button>
                            </Dropdown.Trigger>

                            <Dropdown.Content align="right" width="56">
                                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80">
                                            {user.role || 'Membre'}
                                        </span>
                                        {user.two_factor_enabled ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                                                <FiShield size={10} /> 2FA Protégé
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80">
                                                2FA Inactif
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <Dropdown.Link href={route('profile.edit')} className="flex items-center gap-2 text-xs">
                                    <FiUser size={14} className="text-slate-400" />
                                    Paramètres du Compte & 2FA
                                </Dropdown.Link>
                                
                                <Dropdown.Link href={route('logout')} method="post" as="button" className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
                                    <FiLogOut size={14} />
                                    Se Déconnecter
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10">
                    {header && (
                        <div className="mb-6">
                            {header}
                        </div>
                    )}
                    {children}
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Support Chat Channel (without timer) */}
            <ChatWidget />
        </div>
    );
}
