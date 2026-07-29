import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FiPlus, FiEdit, FiTrash2, FiShield } from 'react-icons/fi';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';

export default function Index({ roles, permissions }) {
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [deletingRole, setDeletingRole] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        permissions: []
    });

    const openCreateModal = () => {
        reset();
        setEditingRole(null);
        setIsRoleModalOpen(true);
    };

    const openEditModal = (role) => {
        reset();
        setEditingRole(role);
        setData({
            name: role.name,
            permissions: role.permissions.map(p => p.name)
        });
        setIsRoleModalOpen(true);
    };

    const openDeleteModal = (role) => {
        setDeletingRole(role);
        setIsDeleteModalOpen(true);
    };

    const closeModals = () => {
        setIsRoleModalOpen(false);
        setIsDeleteModalOpen(false);
        setTimeout(() => { reset(); setEditingRole(null); setDeletingRole(null); }, 300);
    };

    const submitRole = (e) => {
        e.preventDefault();
        if (editingRole) {
            put(route('admin.roles.update', editingRole.id), { onSuccess: () => closeModals() });
        } else {
            post(route('admin.roles.store'), { onSuccess: () => closeModals() });
        }
    };

    const confirmDelete = (e) => {
        e.preventDefault();
        destroy(route('admin.roles.destroy', deletingRole.id), { onSuccess: () => closeModals() });
    };

    const handlePermissionToggle = (permissionName) => {
        if (data.permissions.includes(permissionName)) {
            setData('permissions', data.permissions.filter(p => p !== permissionName));
        } else {
            setData('permissions', [...data.permissions, permissionName]);
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-bold text-2xl text-gray-800 dark:text-gray-200 leading-tight">Gestion des Rôles & Permissions</h2>}
        >
            <Head title="Rôles & Permissions" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <FiShield /> Liste des Rôles
                        </h3>
                        <p className="text-sm text-gray-500">Gérez les rôles et leurs permissions associées.</p>
                    </div>
                    <PrimaryButton onClick={openCreateModal} className="flex items-center gap-2">
                        <FiPlus /> Nouveau Rôle
                    </PrimaryButton>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-4">Nom du Rôle</th>
                                <th scope="col" className="px-6 py-4">Permissions (Nombre)</th>
                                <th scope="col" className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map(role => (
                                <tr key={role.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                                {role.name.charAt(0)}
                                            </div>
                                            {role.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {role.permissions.slice(0, 3).map(p => (
                                                <span key={p.id} className="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 px-2 py-1 rounded text-xs font-medium">
                                                    {p.name}
                                                </span>
                                            ))}
                                            {role.permissions.length > 3 && (
                                                <span className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs font-medium">
                                                    +{role.permissions.length - 3} autres
                                                </span>
                                            )}
                                            {role.permissions.length === 0 && (
                                                <span className="text-gray-400 italic">Aucune permission</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => openEditModal(role)} className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 p-2">
                                            <FiEdit size={18} />
                                        </button>
                                        <button onClick={() => openDeleteModal(role)} className="text-rose-600 hover:text-rose-900 dark:text-rose-400 dark:hover:text-rose-300 p-2 ml-2">
                                            <FiTrash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Création/Modification */}
            <Modal show={isRoleModalOpen} onClose={closeModals} maxWidth="2xl">
                <form onSubmit={submitRole} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                        {editingRole ? 'Modifier le rôle' : 'Créer un nouveau rôle'}
                    </h2>

                    <div className="mb-6">
                        <InputLabel htmlFor="name" value="Nom du rôle" />
                        <TextInput
                            id="name"
                            type="text"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Permissions Accordées</h4>
                        {permissions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {permissions.map(permission => (
                                    <label key={permission.id} className="flex items-center gap-3 cursor-pointer group p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                                            checked={data.permissions.includes(permission.name)}
                                            onChange={() => handlePermissionToggle(permission.name)}
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                                            {permission.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500 italic p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                Aucune permission n'est disponible dans la base de données.
                            </div>
                        )}
                        <InputError message={errors.permissions} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModals}>Annuler</SecondaryButton>
                        <PrimaryButton disabled={processing}>{editingRole ? 'Mettre à jour' : 'Créer'}</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal de Suppression */}
            <Modal show={isDeleteModalOpen} onClose={closeModals} maxWidth="md">
                <form onSubmit={confirmDelete} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Supprimer le rôle
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Êtes-vous sûr de vouloir supprimer le rôle "{deletingRole?.name}" ? Cette action peut impacter les utilisateurs associés.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModals}>Annuler</SecondaryButton>
                        <DangerButton disabled={processing}>Supprimer</DangerButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
