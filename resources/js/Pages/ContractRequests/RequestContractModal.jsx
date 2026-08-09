import { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { FiFileText, FiX, FiCheckCircle, FiUser, FiBriefcase, FiAlertCircle, FiZap } from 'react-icons/fi';

export default function RequestContractModal({ isOpen, onClose, assignment }) {
    if (!isOpen || !assignment) return null;

    const { auth } = usePage().props;
    const isSuperAdmin = Boolean(
        auth?.isSuperAdmin || 
        ['super admin', 'system administrator', 'superadmin'].includes(auth?.user?.role?.toLowerCase())
    );

    const { data, setData, post, processing, errors, reset } = useForm({
        assignment_id: assignment.id,
        notes: '',
        direct_generate: isSuperAdmin,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('contract-requests.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const clientName = assignment.client?.nom || assignment.client?.c_nom || 'Client non spécifié';
    const profileName = assignment.profile?.full_name || assignment.profile?.nom || 'Candidat non spécifié';

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 dark:border-gray-700 transform transition-all">
                {/* Header */}
                <div className={`px-6 py-5 text-white flex items-center justify-between ${
                    isSuperAdmin 
                        ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700' 
                        : 'bg-gradient-to-r from-indigo-600 to-indigo-700'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/10 rounded-xl">
                            {isSuperAdmin ? <FiZap size={22} className="text-amber-300" /> : <FiFileText size={22} className="text-white" />}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">
                                {isSuperAdmin ? 'Générer le Contrat Directement' : 'Demander la Génération du Contrat'}
                            </h3>
                            <p className="text-xs text-white/90">
                                {isSuperAdmin 
                                    ? 'Génération immédiate sans demande préalable (Super Admin)' 
                                    : "Soumettre une demande d'approbation au Super Admin"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Assignment Summary Card */}
                    <div className="bg-slate-50 dark:bg-gray-700/50 rounded-xl p-4 border border-slate-200/80 dark:border-gray-600 space-y-3">
                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            <span>Affectation #{assignment.id}</span>
                            <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-2.5 py-0.5 rounded-full font-bold">
                                {assignment.status || 'Active'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm pt-1">
                            <div className="flex items-start gap-2">
                                <FiBriefcase className="text-indigo-500 mt-0.5 shrink-0" size={16} />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Client</p>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{clientName}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <FiUser className="text-emerald-500 mt-0.5 shrink-0" size={16} />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Candidat</p>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{profileName}</p>
                                </div>
                            </div>
                        </div>

                        {(assignment.start_date || assignment.agreed_price) && (
                            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 pt-2 border-t border-slate-200 dark:border-gray-600">
                                {assignment.start_date && (
                                    <span>Date début : <strong>{assignment.start_date}</strong></span>
                                )}
                                {assignment.agreed_price && (
                                    <span>Tarif : <strong>{assignment.agreed_price} DH</strong></span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Notice */}
                    {isSuperAdmin ? (
                        <div className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/50 text-xs">
                            <FiZap size={18} className="shrink-0 mt-0.5 text-amber-500" />
                            <div>
                                <p className="font-semibold">⚡ Action Directe Administrateur</p>
                                <p className="text-emerald-700 dark:text-emerald-400 mt-0.5">
                                    En tant que Super Admin / Administrateur Système, le document PDF officiel sera généré immédiatement et prêt au téléchargement.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/50 text-xs">
                            <FiAlertCircle size={18} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                            <div>
                                <p className="font-semibold">Approbation Requise</p>
                                <p className="text-amber-700 dark:text-amber-400 mt-0.5">
                                    Dès validation par un Super Admin, le contrat PDF sera généré en arrière-plan et vous recevrez une notification instantanée avec le lien de téléchargement.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Notes Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Notes / Commentaires additionnels <span className="text-gray-400 text-xs">(Optionnel)</span>
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={3}
                            placeholder="Précisez toute information utile concernant ce contrat..."
                            className="w-full text-sm rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        {errors.notes && <p className="text-xs text-rose-600 mt-1">{errors.notes}</p>}
                        {errors.assignment_id && <p className="text-xs text-rose-600 mt-1">{errors.assignment_id}</p>}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        >
                            Annuler
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 ${
                                isSuperAdmin
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                                    : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
                            }`}
                        >
                            {isSuperAdmin ? (
                                <>
                                    <FiZap size={16} className="text-amber-300" />
                                    {processing ? 'Génération en cours...' : '⚡ Générer Immédiatement'}
                                </>
                            ) : (
                                <>
                                    <FiCheckCircle size={16} />
                                    {processing ? 'Envoi en cours...' : 'Soumettre la Demande'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

