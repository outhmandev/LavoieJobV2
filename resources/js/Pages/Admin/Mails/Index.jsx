import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FiPlus, FiEdit, FiTrash2, FiMail, FiServer, FiSettings } from 'react-icons/fi';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';

export default function Index({ emails, domain }) {
    const { flash } = usePage().props;
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const [editingEmail, setEditingEmail] = useState(null);
    const [deletingEmail, setDeletingEmail] = useState(null);

    // Form for Create
    const { data: createData, setData: setCreateData, post: store, processing: creating, errors: createErrors, reset: resetCreate } = useForm({
        email: '',
        password: '',
        quota: 0
    });

    // Form for Edit
    const { data: editData, setData: setEditData, put: update, processing: editing, errors: editErrors, reset: resetEdit } = useForm({
        password: '',
        quota: ''
    });

    // Form for Delete
    const { delete: destroy, processing: deleting } = useForm();

    const openCreateModal = () => {
        resetCreate();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (emailObj) => {
        resetEdit();
        setEditingEmail(emailObj);
        
        // cPanel quota is often a string like 'unlimited' or a number of Megabytes.
        // If it's unlimited we'll set it to 0 for our UI logic, or keep the value.
        let q = emailObj.diskquota;
        if (q === 'unlimited' || q === '0' || q === 0) {
            q = 0;
        } else {
            // Strip any non-numeric just in case it's '250 (MB)'
            q = parseInt(q) || 0;
        }

        setEditData({
            password: '',
            quota: q
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (emailObj) => {
        setDeletingEmail(emailObj);
        setIsDeleteModalOpen(true);
    };

    const closeModals = () => {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setTimeout(() => { 
            resetCreate(); 
            resetEdit(); 
            setEditingEmail(null); 
            setDeletingEmail(null); 
        }, 300);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        store(route('admin.mail-accounts.store'), { onSuccess: () => closeModals() });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        update(route('admin.mail-accounts.update', editingEmail.email.split('@')[0]), { onSuccess: () => closeModals() });
    };

    const confirmDelete = (e) => {
        e.preventDefault();
        // Assuming we pass only the prefix, so we split by @
        const emailPrefix = deletingEmail.email.split('@')[0];
        destroy(route('admin.mail-accounts.destroy', emailPrefix), { onSuccess: () => closeModals() });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-bold text-2xl text-gray-800 dark:text-gray-200 leading-tight">Gestion des E-mails</h2>}
        >
            <Head title="Comptes E-mail" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8">
                {/* Flash Messages */}
                {flash && flash.success && (
                    <div className="mb-4 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-md text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-600 dark:text-emerald-400">
                        {flash.success}
                    </div>
                )}
                {flash && flash.error && (
                    <div className="mb-4 bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-md text-rose-800 dark:bg-rose-900/30 dark:border-rose-600 dark:text-rose-400">
                        {flash.error}
                    </div>
                )}

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <FiServer /> Comptes E-mail Serveur
                        </h3>
                        <p className="text-sm text-gray-500">Gérez les boîtes mail pour {domain}</p>
                    </div>
                    <PrimaryButton onClick={openCreateModal} className="flex items-center gap-2">
                        <FiPlus /> Nouvelle Boîte
                    </PrimaryButton>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-4">Adresse E-mail</th>
                                <th scope="col" className="px-6 py-4">Utilisation (Mo)</th>
                                <th scope="col" className="px-6 py-4">Quota (Mo)</th>
                                <th scope="col" className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {emails && emails.length > 0 ? (
                                emails.map((mail, idx) => (
                                    <tr key={idx} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                                    <FiMail />
                                                </div>
                                                {mail.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {mail.diskused ? parseFloat(mail.diskused).toFixed(2) : '0.00'} Mo
                                        </td>
                                        <td className="px-6 py-4">
                                            {mail.diskquota === '0' || mail.diskquota === 'unlimited' ? 'Illimité' : `${mail.diskquota} Mo`}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => openEditModal(mail)} className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 p-2" title="Modifier le mot de passe/quota">
                                                <FiSettings size={18} />
                                            </button>
                                            <button onClick={() => openDeleteModal(mail)} className="text-rose-600 hover:text-rose-900 dark:text-rose-400 dark:hover:text-rose-300 p-2 ml-2" title="Supprimer">
                                                <FiTrash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        Aucun compte e-mail trouvé ou impossible de se connecter au serveur cPanel.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Création */}
            <Modal show={isCreateModalOpen} onClose={closeModals} maxWidth="md">
                <form onSubmit={submitCreate} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                        <FiMail className="text-indigo-600" /> Créer un Compte E-mail
                    </h2>

                    <div className="mb-4">
                        <InputLabel htmlFor="create-email" value={`Préfixe E-mail (avant @${domain})`} />
                        <div className="flex items-center mt-1">
                            <TextInput
                                id="create-email"
                                type="text"
                                className="block w-full rounded-r-none"
                                value={createData.email}
                                onChange={(e) => setCreateData('email', e.target.value)}
                                required
                                placeholder="contact"
                            />
                            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm h-[42px] dark:border-gray-700 dark:bg-gray-800">
                                @{domain}
                            </span>
                        </div>
                        <InputError message={createErrors.email} className="mt-2" />
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="create-password" value="Mot de passe" />
                        <TextInput
                            id="create-password"
                            type="password"
                            className="mt-1 block w-full"
                            value={createData.password}
                            onChange={(e) => setCreateData('password', e.target.value)}
                            required
                        />
                        <InputError message={createErrors.password} className="mt-2" />
                    </div>

                    <div className="mb-6">
                        <InputLabel htmlFor="create-quota" value="Quota (Mo) - 0 pour illimité" />
                        <TextInput
                            id="create-quota"
                            type="number"
                            min="0"
                            className="mt-1 block w-full"
                            value={createData.quota}
                            onChange={(e) => setCreateData('quota', e.target.value)}
                        />
                        <InputError message={createErrors.quota} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModals}>Annuler</SecondaryButton>
                        <PrimaryButton disabled={creating}>Créer</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal de Modification */}
            <Modal show={isEditModalOpen} onClose={closeModals} maxWidth="md">
                <form onSubmit={submitEdit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                        <FiSettings className="text-emerald-600" /> Modifier {editingEmail?.email}
                    </h2>

                    <div className="mb-4">
                        <InputLabel htmlFor="edit-password" value="Nouveau mot de passe (laisser vide pour ne pas modifier)" />
                        <TextInput
                            id="edit-password"
                            type="password"
                            className="mt-1 block w-full"
                            value={editData.password}
                            onChange={(e) => setEditData('password', e.target.value)}
                        />
                        <InputError message={editErrors.password} className="mt-2" />
                    </div>

                    <div className="mb-6">
                        <InputLabel htmlFor="edit-quota" value="Nouveau Quota (Mo) - 0 pour illimité" />
                        <TextInput
                            id="edit-quota"
                            type="number"
                            min="0"
                            className="mt-1 block w-full"
                            value={editData.quota}
                            onChange={(e) => setEditData('quota', e.target.value)}
                        />
                        <InputError message={editErrors.quota} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModals}>Annuler</SecondaryButton>
                        <PrimaryButton disabled={editing}>Mettre à jour</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal de Suppression */}
            <Modal show={isDeleteModalOpen} onClose={closeModals} maxWidth="md">
                <form onSubmit={confirmDelete} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <FiTrash2 className="text-rose-600" /> Supprimer la boîte mail
                    </h2>
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                        Êtes-vous sûr de vouloir supprimer définitivement la boîte mail <span className="font-bold">{deletingEmail?.email}</span> ? 
                        Cette action effacera tous les e-mails contenus et est irréversible.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModals}>Annuler</SecondaryButton>
                        <DangerButton disabled={deleting}>Supprimer</DangerButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
