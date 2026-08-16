import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FiPlus, FiEdit, FiTrash2, FiKey } from 'react-icons/fi';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';

export default function Index({ permissions }) {
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingPermission, setEditingPermission] = useState(null);
    const [deletingPermission, setDeletingPermission] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: ''
    });

    const openCreateModal = () => {
        reset();
        setEditingPermission(null);
        setIsPermissionModalOpen(true);
    };

    const openEditModal = (permission) => {
        reset();
        setEditingPermission(permission);
        setData({
            name: permission.name,
        });
        setIsPermissionModalOpen(true);
    };

    const openDeleteModal = (permission) => {
        setDeletingPermission(permission);
        setIsDeleteModalOpen(true);
    };

    const closeModals = () => {
        setIsPermissionModalOpen(false);
        setIsDeleteModalOpen(false);
        setTimeout(() => { reset(); setEditingPermission(null); setDeletingPermission(null); }, 300);
    };

    const submitPermission = (e) => {
        e.preventDefault();
        if (editingPermission) {
            put(route('admin.permissions.update', editingPermission.id), { onSuccess: () => closeModals() });
        } else {
            post(route('admin.permissions.store'), { onSuccess: () => closeModals() });
        }
    };

    const confirmDelete = (e) => {
        e.preventDefault();
        destroy(route('admin.permissions.destroy', deletingPermission.id), { onSuccess: () => closeModals() });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-bold text-2xl text-gray-800 dark:text-gray-200 leading-tight">Gestion des Permissions</h2>}
        >
            <Head title="Permissions" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <FiKey /> Liste des Permissions
                        </h3>
                        <p className="text-sm text-gray-500">Gérez les permissions individuelles disponibles dans le système.</p>
                    </div>
                    <PrimaryButton onClick={openCreateModal} className="flex items-center gap-2">
                        <FiPlus /> Nouvelle Permission
                    </PrimaryButton>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-4">Nom de la Permission</th>
                                <th scope="col" className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {permissions.map(permission => (
                                <tr key={permission.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                                                <FiKey size={14} />
                                            </div>
                                            {permission.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => openEditModal(permission)} className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 p-2">
                                            <FiEdit size={18} />
                                        </button>
                                        <button onClick={() => openDeleteModal(permission)} className="text-rose-600 hover:text-rose-900 dark:text-rose-400 dark:hover:text-rose-300 p-2 ml-2">
                                            <FiTrash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {permissions.length === 0 && (
                                <tr>
                                    <td colSpan="2" className="px-6 py-8 text-center text-gray-500">
                                        Aucune permission n'a été créée.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Création/Modification */}
            <Modal show={isPermissionModalOpen} onClose={closeModals} maxWidth="md">
                <form onSubmit={submitPermission} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                        {editingPermission ? 'Modifier la permission' : 'Créer une nouvelle permission'}
                    </h2>

                    <div className="mb-6">
                        <InputLabel htmlFor="name" value="Nom de la permission (ex: edit articles)" />
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

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModals}>Annuler</SecondaryButton>
                        <PrimaryButton disabled={processing}>{editingPermission ? 'Mettre à jour' : 'Créer'}</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal de Suppression */}
            <Modal show={isDeleteModalOpen} onClose={closeModals} maxWidth="md">
                <form onSubmit={confirmDelete} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Supprimer la permission
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Êtes-vous sûr de vouloir supprimer la permission "{deletingPermission?.name}" ?
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
