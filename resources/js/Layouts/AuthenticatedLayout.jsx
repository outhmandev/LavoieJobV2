import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { FiHome, FiUsers, FiUserCheck, FiBriefcase, FiMenu, FiX, FiBell, FiSearch, FiSettings, FiShield, FiActivity, FiMail, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { useState } from 'react';
import TimeTrackerWidget from '@/Components/TimeTrackerWidget';
import ChatWidget from '@/Components/ChatWidget';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [categoriesOpen, setCategoriesOpen] = useState({
        overview: true,
        management: true,
        admin: true,
    });

    const toggleCategory = (cat) => {
        setCategoriesOpen(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    const NavItem = ({ href, active, icon, children }) => (
        <Link
            href={href}
            className={`flex items-center px-4 py-3 my-1 rounded-xl transition-all duration-200 ${
                active 
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 font-semibold shadow-sm border border-indigo-100 dark:border-indigo-500/20' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 font-medium border border-transparent'
            }`}
        >
            <span className={`mr-3 text-lg ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {icon}
            </span>
            {children}
        </Link>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-900 flex font-sans">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:border-r dark:border-gray-800 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:block`}>
                <div className="flex items-center justify-between h-20 px-8 border-b border-gray-100 dark:border-gray-800/80">
                    <Link href="/" className="flex items-center">
                        <ApplicationLogo />
                    </Link>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="px-5 py-8 space-y-1 overflow-y-auto h-[calc(100vh-5rem)]">
                    <div 
                        className="mb-2 mt-2 px-4 text-xs font-bold tracking-wider text-gray-400 uppercase cursor-pointer flex justify-between items-center hover:text-gray-600 transition-colors"
                        onClick={() => toggleCategory('overview')}
                    >
                        <span>Vue d'ensemble</span>
                        {categoriesOpen.overview ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                    </div>
                    {categoriesOpen.overview && (
                        <NavItem href={route('dashboard')} active={route().current('dashboard')} icon={<FiHome />}>
                            Tableau de bord
                        </NavItem>
                    )}
                    
                    <div 
                        className="mt-8 mb-2 px-4 text-xs font-bold tracking-wider text-gray-400 uppercase cursor-pointer flex justify-between items-center hover:text-gray-600 transition-colors"
                        onClick={() => toggleCategory('management')}
                    >
                        <span>Gestion</span>
                        {categoriesOpen.management ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
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
                                Affectations / Contrats
                            </NavItem>
                        </>
                    )}

                    {/* Admin Links (visible for specific roles) */}
                    {['System Administrator', 'super Admin'].includes(user.role) && (
                        <>
                            <div 
                                className="pt-8 pb-2 px-4 text-xs font-bold tracking-wider text-gray-400 uppercase cursor-pointer flex justify-between items-center hover:text-gray-600 transition-colors"
                                onClick={() => toggleCategory('admin')}
                            >
                                <span>Administration</span>
                                {categoriesOpen.admin ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                            </div>
                            {categoriesOpen.admin && (
                                <>
                                    <NavItem href={route('admin.projects.index')} active={route().current('admin.projects.*')} icon={<FiSettings />}>
                                        Projets Config
                                    </NavItem>
                                    <NavItem href={route('admin.users.index')} active={route().current('admin.users.*')} icon={<FiUsers />}>
                                        Utilisateurs
                                    </NavItem>
                                    <NavItem href={route('admin.roles.index')} active={route().current('admin.roles.*')} icon={<FiShield />}>
                                        Rôles & Permissions
                                    </NavItem>
                                    <NavItem href={route('admin.audits.index')} active={route().current('admin.audits.*')} icon={<FiActivity />}>
                                        Logs d'Audit
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

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800 sticky top-0 z-40 h-20 flex items-center justify-between px-4 sm:px-6 lg:px-10 shrink-0">
                    <div className="flex items-center gap-4 w-full max-w-2xl">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 bg-gray-50 rounded-lg">
                            <FiMenu size={22} />
                        </button>
                        
                        {/* Global Search */}
                        <div className="hidden md:flex items-center bg-gray-100/70 dark:bg-gray-800/50 rounded-xl px-4 py-2.5 w-full border border-gray-200/50 dark:border-gray-700/50 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 dark:focus-within:bg-gray-800 transition-all duration-200">
                            <FiSearch className="text-gray-400" size={18} />
                            <input type="text" placeholder="Search anywhere..." className="bg-transparent border-none focus:ring-0 text-sm w-full text-gray-700 dark:text-gray-300 placeholder-gray-400 ml-2" />
                            <div className="hidden lg:flex items-center gap-1">
                                <kbd className="text-[10px] font-semibold text-gray-400 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600">Ctrl</kbd>
                                <kbd className="text-[10px] font-semibold text-gray-400 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600">K</kbd>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-5 ml-auto">
                        <div className="hidden md:block">
                            <TimeTrackerWidget />
                        </div>

                        <button className="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                            <FiBell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                        </button>

                        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>

                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition-colors group">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-md group-hover:shadow-lg transition-all duration-200">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="hidden sm:block text-left">
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{user.name}</p>
                                        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">{user.role}</p>
                                    </div>
                                </button>
                            </Dropdown.Trigger>

                            <Dropdown.Content align="right" width="48">
                                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                                <Dropdown.Link href={route('profile.edit')}>Account Settings</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">Sign Out</Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10">
                    {header && (
                        <div className="mb-8">
                            {header}
                        </div>
                    )}
                    {children}
                </main>
            </div>

            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            
            <ChatWidget />
        </div>
    );
}
