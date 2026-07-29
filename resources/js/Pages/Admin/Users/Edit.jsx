import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function Edit({ user, roles, projects }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        roles: user.roles?.map(r => r.name) || [],
        projects: user.projects?.map(p => p.id) || []
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.users.update', user.id));
    };

    const handleRoleToggle = (roleName) => {
        if (data.roles.includes(roleName)) {
            setData('roles', data.roles.filter(r => r !== roleName));
        } else {
            setData('roles', [...data.roles, roleName]);
        }
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
                <div className="flex items-center gap-4">
                    <Link href={route('admin.users.index')} className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <FiArrowLeft size={20} />
                    </Link>
                    <h2 className="font-bold text-2xl text-gray-800 dark:text-gray-200 leading-tight">
                        Modifier Utilisateur: {user.name}
                    </h2>
                </div>
            }
        >
            <Head title={`Modifier ${user.name}`} />

            <div className="py-12 max-w-3xl mx-auto sm:px-6 lg:px-8">
                <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden p-8">
                    
                    <div className="grid grid-cols-1 gap-6 mb-8">
                        <div>
                            <InputLabel htmlFor="name" value="Nom Complet" />
                            <TextInput
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>
                    </div>

                    <div className="mb-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-4">Assignation de Rôles (Spatie)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {roles.map(role => (
                                <label key={role.id} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={data.roles.includes(role.name)}
                                        onChange={() => handleRoleToggle(role.name)}
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {role.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="mb-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Projets Assignés</h4>
                        <p className="text-sm text-gray-500 mb-4">Sélectionnez les projets dont cet utilisateur sera responsable. Si c'est un Membre, il ne verra que les données liées à ces projets.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {projects.map(project => (
                                <label key={project.id} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                        checked={data.projects.includes(project.id)}
                                        onChange={() => handleProjectToggle(project.id)}
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {project.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-700">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm"
                        >
                            <FiSave size={20} /> Mettre à jour l'utilisateur
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
