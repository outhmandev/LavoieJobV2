import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import TwoFactorAuthenticationForm from './Partials/TwoFactorAuthenticationForm';
import { FiUser, FiLock, FiShield, FiAlertTriangle } from 'react-icons/fi';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export default function Edit({ mustVerifyEmail, status }) {
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', name: 'Mon Profil', icon: <FiUser /> },
        { id: 'security', name: 'Mot de passe', icon: <FiLock /> },
        { id: '2fa', name: 'Sécurité & 2FA', icon: <FiShield /> },
        { id: 'danger', name: 'Zone Dangereuse', icon: <FiAlertTriangle /> },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-slate-900 dark:text-white">
                            Paramètres du Compte
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Gérez vos informations personnelles, votre sécurité et vos préférences.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Paramètres du Profil" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col md:flex-row gap-8">
                        
                        {/* Sidebar Navigation */}
                        <div className="w-full md:w-64 shrink-0">
                            <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto pb-4 md:pb-0">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-200",
                                            activeTab === tab.id
                                                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
                                        )}
                                    >
                                        <span className={cn(
                                            "text-lg",
                                            activeTab === tab.id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"
                                        )}>
                                            {tab.icon}
                                        </span>
                                        {tab.name}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 max-w-3xl">
                            <div className="space-y-8">
                                
                                {activeTab === 'general' && (
                                    <div className="bg-white p-6 sm:p-8 shadow-sm border border-slate-200/60 rounded-2xl dark:bg-slate-900 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <UpdateProfileInformationForm
                                            mustVerifyEmail={mustVerifyEmail}
                                            status={status}
                                            className="max-w-xl"
                                        />
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="bg-white p-6 sm:p-8 shadow-sm border border-slate-200/60 rounded-2xl dark:bg-slate-900 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <UpdatePasswordForm className="max-w-xl" />
                                    </div>
                                )}

                                {activeTab === '2fa' && (
                                    <div className="bg-white p-6 sm:p-8 shadow-sm border border-slate-200/60 rounded-2xl dark:bg-slate-900 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <TwoFactorAuthenticationForm className="max-w-2xl" />
                                    </div>
                                )}

                                {activeTab === 'danger' && (
                                    <div className="bg-red-50/50 dark:bg-red-950/10 p-6 sm:p-8 border border-red-100 dark:border-red-900/30 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <DeleteUserForm className="max-w-xl" />
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
