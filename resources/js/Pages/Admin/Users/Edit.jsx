import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import {
    FiArrowLeft, FiSave, FiUser, FiMail, FiLock,
    FiShield, FiBriefcase, FiTrash2, FiCheck
} from 'react-icons/fi';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function Edit({ user, roles = [], projects = [], availablePrimaryRoles = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        role: user.role || 'Membre',
        roles: user.roles?.map(r => r.name) || [user.role || 'Membre'],
        projects: user.projects?.map(p => p.id) || [],
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.users.update', user.id));
    };

    const handlePrimaryRoleChange = (roleValue) => {
        setData(prev => {
            const newRoles = prev.roles.includes(roleValue) ? prev.roles : [...prev.roles, roleValue];
            return {
                ...prev,
                role: roleValue,
                roles: newRoles,
            };
        });
    };

    const handleProjectToggle = (projectId) => {
        if (data.projects.includes(projectId)) {
            setData('projects', data.projects.filter(p => p !== projectId));
        } else {
            setData('projects', [...data.projects, projectId]);
        }
    };

    const handleDelete = () => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.name}" (${user.email}) ? Cette action est irréversible.`)) {
            router.delete(route('admin.users.destroy', user.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('admin.users.index')}
                            className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <FiArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight">
                                Modifier l'Utilisateur: {user.name}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Mettez à jour les informations de profil, le rôle système et les projets assignés.
                            </p>
                        </div>
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-semibold rounded-xl border border-rose-200 dark:border-rose-800 transition-all text-sm"
                        >
                            <FiTrash2 size={16} />
                            Supprimer le compte
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Modifier ${user.name}`} />

            <div className="py-8 max-w-5xl mx-auto sm:px-6 lg:px-8">
                <form onSubmit={submit} className="space-y-6">
                    
                    {/* Information de Compte */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200/70 dark:border-gray-700/70 p-6 md:p-8">
                        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100 dark:border-gray-700">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                                <FiUser size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Informations Générales</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Coordonnées du compte utilisateur.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="name" value="Nom Complet *" className="text-gray-700 dark:text-gray-300 font-semibold" />
                                <div className="relative mt-2">
                                    <TextInput
                                        id="name"
                                        type="text"
                                        className="block w-full pl-10 bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:border-indigo-500 rounded-xl"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        required
                                    />
                                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                </div>
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="Adresse E-mail *" className="text-gray-700 dark:text-gray-300 font-semibold" />
                                <div className="relative mt-2">
                                    <TextInput
                                        id="email"
                                        type="email"
                                        className="block w-full pl-10 bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:border-indigo-500 rounded-xl"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        required
                                    />
                                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                </div>
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password" value="Nouveau mot de passe (laisser vide si inchangé)" className="text-gray-700 dark:text-gray-300 font-semibold" />
                                <div className="relative mt-2">
                                    <TextInput
                                        id="password"
                                        type="password"
                                        className="block w-full pl-10 bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:border-indigo-500 rounded-xl"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                    />
                                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                </div>
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password_confirmation" value="Confirmer le nouveau mot de passe" className="text-gray-700 dark:text-gray-300 font-semibold" />
                                <div className="relative mt-2">
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        className="block w-full pl-10 bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:border-indigo-500 rounded-xl"
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        placeholder="••••••••"
                                    />
                                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                </div>
                                <InputError message={errors.password_confirmation} className="mt-2" />
                            </div>
                        </div>
                    </div>

                    {/* Rôle Principal */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200/70 dark:border-gray-700/70 p-6 md:p-8">
                        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100 dark:border-gray-700">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                                <FiShield size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Rôle Principal *</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Modifiez le niveau d'autorisation du compte.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['Membre', 'Admin', 'Super Admin', 'System Administrator', 'Client'].map(roleName => {
                                const isSelected = data.role === roleName;
                                return (
                                    <div
                                        key={roleName}
                                        onClick={() => handlePrimaryRoleChange(roleName)}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                            isSelected
                                                ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 dark:border-indigo-500 shadow-sm'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                                                    isSelected
                                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                                }`}>
                                                    {isSelected && <FiCheck size={12} />}
                                                </div>
                                                <span className="font-bold text-sm text-gray-900 dark:text-white">
                                                    {roleName}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <InputError message={errors.role} className="mt-2" />
                    </div>

                    {/* Projets Assignés */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200/70 dark:border-gray-700/70 p-6 md:p-8">
                        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100 dark:border-gray-700">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                                <FiBriefcase size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Projets Assignés</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Pour un Membre, les données visibles seront restreintes à ces projets.</p>
                            </div>
                        </div>

                        {projects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {projects.map(project => {
                                    const isChecked = data.projects.includes(project.id);
                                    return (
                                        <label
                                            key={project.id}
                                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                                isChecked
                                                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200'
                                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                checked={isChecked}
                                                onChange={() => handleProjectToggle(project.id)}
                                            />
                                            <span className="text-sm font-medium">
                                                {project.name}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-xl text-sm text-gray-500 text-center">
                                Aucun projet disponible.
                            </div>
                        )}
                        <InputError message={errors.projects} className="mt-2" />
                    </div>

                    {/* Submit Bar */}
                    <div className="bg-gray-50 dark:bg-gray-800/80 rounded-2xl p-4 md:p-6 border border-gray-200/70 dark:border-gray-700/70 flex items-center justify-between gap-4">
                        <Link
                            href={route('admin.users.index')}
                            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            Annuler
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-indigo-500/20 disabled:opacity-50"
                        >
                            <FiSave size={18} />
                            {processing ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
