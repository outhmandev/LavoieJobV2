import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FiPlus, FiEdit, FiTrash2, FiTag, FiUsers, FiBriefcase } from 'react-icons/fi';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Index({ clientStatuses = [], profileStatuses = [] }) {
    const [activeTab, setActiveTab] = useState('client');
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingStatus, setEditingStatus] = useState(null);
    const [deletingStatus, setDeletingStatus] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        type: 'client',
        name: ''
    });

    const openCreateModal = () => {
        reset();
        setData('type', activeTab);
        setEditingStatus(null);
        setIsStatusModalOpen(true);
    };

    const openEditModal = (status) => {
        reset();
        setEditingStatus(status);
        setData({
            type: status.type,
            name: status.name,
        });
        setIsStatusModalOpen(true);
    };

    const openDeleteModal = (status) => {
        setDeletingStatus(status);
        setIsDeleteModalOpen(true);
    };

    const closeModals = () => {
        setIsStatusModalOpen(false);
        setIsDeleteModalOpen(false);
        setTimeout(() => { reset(); setEditingStatus(null); setDeletingStatus(null); }, 300);
    };

    const submitStatus = (e) => {
        e.preventDefault();
        if (editingStatus) {
            put(route('admin.statuses.update', editingStatus.id), { onSuccess: () => closeModals() });
        } else {
            post(route('admin.statuses.store'), { onSuccess: () => closeModals() });
        }
    };

    const confirmDelete = (e) => {
        e.preventDefault();
        destroy(route('admin.statuses.destroy', deletingStatus.id), { onSuccess: () => closeModals() });
    };

    const currentStatuses = activeTab === 'client' ? clientStatuses : profileStatuses;

    return (
        <AuthenticatedLayout
            header={<h2 className="font-bold text-2xl text-gray-800 dark:text-gray-200 leading-tight">Gestion des Statuts</h2>}
        >
            <Head title="Statuts" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8">
                
                {/* Tabs */}
                <div className="flex space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-8 w-fit">
                    <button
                        onClick={() => setActiveTab('client')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all",
                            activeTab === 'client' 
                                ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        )}
                    >
                        <FiBriefcase size={16} /> Statuts Clients
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all",
                            activeTab === 'profile' 
                                ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm"
                                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        )}
                    >
                        <FiUsers size={16} /> Statuts Profils Candidats
                    </button>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <FiTag /> Liste des statuts ({activeTab === 'client' ? 'Clients' : 'Profils'})
                        </h3>
                        <p className="text-sm text-gray-500">Gérez les options de statut disponibles dans le système.</p>
                    </div>
                    <PrimaryButton onClick={openCreateModal} className="flex items-center gap-2">
                        <FiPlus /> Nouveau Statut
                    </PrimaryButton>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-4">Nom du Statut</th>
                                <th scope="col" className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentStatuses.map(status => (
                                <tr key={status.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center font-bold",
                                                activeTab === 'client' ? "bg-indigo-100 text-indigo-600" : "bg-purple-100 text-purple-600"
                                            )}>
                                                <FiTag size={14} />
                                            </div>
                                            {status.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => openEditModal(status)} className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 p-2">
                                            <FiEdit size={18} />
                                        </button>
                                        <button onClick={() => openDeleteModal(status)} className="text-rose-600 hover:text-rose-900 dark:text-rose-400 dark:hover:text-rose-300 p-2 ml-2">
                                            <FiTrash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {currentStatuses.length === 0 && (
                                <tr>
                                    <td colSpan="2" className="px-6 py-8 text-center text-gray-500">
                                        Aucun statut défini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Création/Modification */}
            <Modal show={isStatusModalOpen} onClose={closeModals} maxWidth="md">
                <form onSubmit={submitStatus} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
                        {editingStatus ? 'Modifier le statut' : 'Créer un nouveau statut'}
                    </h2>

                    <div className="mb-6">
                        <InputLabel htmlFor="name" value="Nom du Statut" />
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
                        <PrimaryButton disabled={processing}>{editingStatus ? 'Mettre à jour' : 'Créer'}</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal de Suppression */}
            <Modal show={isDeleteModalOpen} onClose={closeModals} maxWidth="sm">
                <form onSubmit={confirmDelete} className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
                        <FiTrash2 size={24} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Supprimer ce statut ?
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Êtes-vous sûr de vouloir supprimer ce statut ? Cette action ne supprimera pas le statut des enregistrements existants, mais empêchera son utilisation future.
                    </p>

                    <div className="flex justify-center gap-3">
                        <SecondaryButton onClick={closeModals}>Annuler</SecondaryButton>
                        <DangerButton disabled={processing} type="submit">Oui, Supprimer</DangerButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
