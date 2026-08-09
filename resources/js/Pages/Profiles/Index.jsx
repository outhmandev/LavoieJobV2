import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FiPlus, FiEdit2, FiTrash2, FiMoreVertical, FiUserCheck, FiStar, FiSearch, FiFilter, FiX } from 'react-icons/fi';
import Dropdown from '@/Components/Dropdown';
import { getProfileStatusBadgeClass } from '@/constants';

export default function Index({ profiles, filters, options }) {
    const [filterValues, setFilterValues] = useState({
        project_id: filters?.project_id || '',
        cin: filters?.cin || '',
        matricule: filters?.matricule || filters?.reference || '',
        nom: filters?.nom || '',
        ville: filters?.ville || '',
        statut: filters?.statut || ''
    });

    const handleFilterChange = (e) => {
        setFilterValues({ ...filterValues, [e.target.name]: e.target.value });
    };

    const applyFilters = (e) => {
        e.preventDefault();
        router.get(route('profiles.index'), filterValues, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const clearFilters = () => {
        const emptyFilters = { project_id: '', cin: '', matricule: '', nom: '', ville: '', statut: '' };
        setFilterValues(emptyFilters);
        router.get(route('profiles.index'), {}, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleDeleteProfile = (profile) => {
        const profileName = profile.nom || profile.full_name || 'ce profil';
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le profil candidat "${profileName}" ? Cette action est irréversible.`)) {
            router.delete(route('profiles.destroy', profile.id), {
                preserveScroll: true
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Profils des Candidats</h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gérez le vivier de candidats et professionnels disponibles.</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <Link
                            href={route('profiles.create')}
                            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 hover:shadow-md transition-all duration-200"
                        >
                            <FiPlus size={18} />
                            Ajouter un profil
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Profils" />

            <div className="mb-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800/80 p-5">
                <div className="flex items-center gap-2 mb-4">
                    <FiFilter className="text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filtres avancés</h3>
                </div>

                <form onSubmit={applyFilters}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        {/* Project Filter */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Projet</label>
                            <select
                                name="project_id"
                                value={filterValues.project_id}
                                onChange={handleFilterChange}
                                className="w-full text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm"
                            >
                                <option value="">Tous les projets</option>
                                {options.projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* CIN Filter */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Cin :</label>
                            <input
                                type="text"
                                name="cin"
                                value={filterValues.cin}
                                onChange={handleFilterChange}
                                placeholder="Rechercher CIN..."
                                className="w-full text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm"
                            />
                        </div>

                        {/* Mat de profil Filter */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Mat de profil :</label>
                            <input
                                type="text"
                                name="matricule"
                                value={filterValues.matricule}
                                onChange={handleFilterChange}
                                placeholder="Rechercher matricule..."
                                className="w-full text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm"
                            />
                        </div>

                        {/* Nom Filter */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nom Profile</label>
                            <input
                                type="text"
                                name="nom"
                                value={filterValues.nom}
                                onChange={handleFilterChange}
                                placeholder="Rechercher nom..."
                                className="w-full text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm"
                            />
                        </div>

                        {/* Ville Filter */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Ville</label>
                            <input
                                type="text"
                                name="ville"
                                value={filterValues.ville}
                                onChange={handleFilterChange}
                                placeholder="Rechercher ville..."
                                className="w-full text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm"
                            />
                        </div>

                        {/* Statut Filter */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Statut Profile</label>
                            <select
                                name="statut"
                                value={filterValues.statut}
                                onChange={handleFilterChange}
                                className="w-full text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm"
                            >
                                <option value="">Tous les statuts</option>
                                {options.statuses.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3 justify-end">
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
                        >
                            <FiX /> Réinitialiser les filtres
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            <FiSearch /> Rechercher des profils
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800/80">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                            <tr className="bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700/50">
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Matricule</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nom du candidat</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">CIN / Réf</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Projet</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fonction / Poste</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Évaluation</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {profiles.data.map(profile => (
                                <tr key={profile.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                                    <td className="py-4 px-6 text-sm font-mono font-medium text-indigo-600 dark:text-indigo-400">
                                        {profile.matricule || profile.mat || profile.reference || <span className="text-gray-300">-</span>}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                                                {(profile.nom || profile.full_name)?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">{profile.nom || profile.full_name || 'N/A'}</p>
                                                <p className="text-xs text-gray-400">{profile.current_city || profile.ville_a || profile.origin_city}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm font-mono text-gray-600 dark:text-gray-300">
                                        {profile.cin || <span className="text-gray-300">-</span>}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">{profile.project?.name || <span className="text-gray-300">-</span>}</td>
                                    <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">{profile.fonction || profile.job || <span className="text-gray-300">-</span>}</td>
                                    <td className="py-4 px-6 text-sm">
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                                            {profile.status || profile.statut || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-sm">
                                        <div className="flex items-center text-amber-500">
                                            <FiStar className={profile.rate ? "fill-amber-500" : "text-gray-300"} />
                                            <span className="ml-1.5 font-medium text-gray-700 dark:text-gray-300">{profile.rate || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <Dropdown>
                                            <Dropdown.Trigger>
                                                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                                    <FiMoreVertical size={18} />
                                                </button>
                                            </Dropdown.Trigger>
                                            <Dropdown.Content align="right" width="48">
                                                <Dropdown.Link href={route('profiles.edit', profile.id)} className="flex items-center gap-2">
                                                    <FiEdit2 className="text-gray-400" /> Modifier Profil
                                                </Dropdown.Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteProfile(profile)}
                                                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                                                >
                                                    <FiTrash2 className="text-rose-500" /> Supprimer Profil
                                                </button>
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                            {profiles.data.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                                                <FiUserCheck size={28} className="text-gray-400" />
                                            </div>
                                            <p className="text-lg font-medium text-gray-900 dark:text-white">Aucun profil trouvé</p>
                                            <p className="text-sm mt-1 mb-4">Essayez d'ajuster vos filtres ou d'ajouter un nouveau profil.</p>
                                            <button onClick={clearFilters} className="text-indigo-600 hover:text-indigo-700 font-medium">
                                                Réinitialiser tous les filtres
                                            </button>
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
