import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import {
    FiArrowLeft, FiUserPlus, FiBriefcase,
    FiMail, FiUser, FiCheck, FiInfo, FiSend, FiShield
} from 'react-icons/fi';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Create({ projects = [], availablePrimaryRoles = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        role: 'Membre',
        projects: [],
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.users.store'));
    };

    const handleProjectToggle = (projectId) => {
        if (data.projects.includes(projectId)) {
            setData('projects', data.projects.filter(p => p !== projectId));
        } else {
            setData('projects', [...data.projects, projectId]);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('admin.users.index')}
                            className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <FiArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight flex items-center gap-2.5">
                                <FiUserPlus className="text-indigo-600 dark:text-indigo-400" />
                                Inviter un Nouveau Membre
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Envoyez une invitation sécurisée à un collaborateur avec affectation immédiate à ses projets.
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Inviter un Nouveau Membre" />

            <div className="py-6 max-w-4xl mx-auto sm:px-6 lg:px-8">
                <form onSubmit={submit} className="space-y-6">
                    
                    {/* Information du Membre */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200/70 dark:border-gray-700/70 p-6 md:p-8">
                        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100 dark:border-gray-700">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                                <FiUser size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Coordonnées du Collaborateur</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Renseignez l'identité et l'adresse e-mail professionnelle.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="name" value="Nom Complet *" className="text-gray-700 dark:text-gray-300 font-semibold" />
                                <div className="relative mt-2">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <FiUser size={16} />
                                    </div>
                                    <TextInput
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        className="pl-10 w-full"
                                        placeholder="Ex: Sarah Martin"
                                        isFocused={true}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                </div>
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="Adresse E-mail Professionnelle *" className="text-gray-700 dark:text-gray-300 font-semibold" />
                                <div className="relative mt-2">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <FiMail size={16} />
                                    </div>
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="pl-10 w-full"
                                        placeholder="sarah.martin@entreprise.com"
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-2" />
                            </div>
                        </div>
                    </div>

                    {/* Affectation de Projets */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200/70 dark:border-gray-700/70 p-6 md:p-8">
                        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100 dark:border-gray-700">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                                <FiBriefcase size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Projet(s) Assigné(s) *</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Sélectionnez les projets auxquels ce collaborateur aura accès.</p>
                            </div>
                        </div>

                        {projects.length === 0 ? (
                            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-sm text-amber-800 dark:text-amber-300">
                                Aucun projet n'a encore été configuré. Veuillez d'abord créer des projets dans la section Projets.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {projects.map((project) => {
                                    const isSelected = data.projects.includes(project.id);
                                    return (
                                        <div
                                            key={project.id}
                                            onClick={() => handleProjectToggle(project.id)}
                                            className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 flex items-start justify-between gap-3 ${
                                                isSelected
                                                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm'
                                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-semibold text-sm truncate ${isSelected ? 'text-indigo-950 dark:text-indigo-200' : 'text-gray-800 dark:text-gray-200'}`}>
                                                    {project.name}
                                                </p>
                                                {project.description && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                                        {project.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                                isSelected
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                            }`}>
                                                {isSelected && <FiCheck size={14} />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <InputError message={errors.projects} className="mt-3" />
                    </div>

                    {/* Note de Sécurité & Workflow Automatisé */}
                    <div className="bg-gradient-to-r from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-800/40 rounded-2xl p-5 flex items-start gap-4">
                        <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shrink-0">
                            <FiShield size={20} />
                        </div>
                        <div className="text-sm">
                            <h4 className="font-bold text-gray-900 dark:text-gray-100">Workflow d'Invitation Automatisé & Sécurisé</h4>
                            <p className="text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                                Dès l'envoi de ce formulaire, le système créera automatiquement un compte membre en attente et transmettra un <strong>lien d'activation chiffré à usage unique</strong> à l'adresse e-mail indiquée. Le collaborateur créera son mot de passe en toute confidentialité et sera automatiquement connecté.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 pt-2">
                        <Link
                            href={route('admin.users.index')}
                            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold text-sm transition-colors"
                        >
                            Annuler
                        </Link>
                        <PrimaryButton
                            disabled={processing || data.projects.length === 0}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold shadow-lg shadow-indigo-500/20"
                        >
                            <FiSend size={15} />
                            {processing ? 'Envoi de l\'invitation...' : 'Envoyer l\'Invitation'}
                        </PrimaryButton>
                    </div>

                </form>
            </div>
        </AuthenticatedLayout>
    );
}
