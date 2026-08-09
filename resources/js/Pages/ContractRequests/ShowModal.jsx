import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import {
    FiX, FiCheckCircle, FiXCircle, FiClock, FiDownload,
    FiRefreshCw, FiUser, FiBriefcase, FiCalendar, FiFileText,
    FiAlertTriangle, FiActivity, FiShield
} from 'react-icons/fi';

export default function ShowModal({ isOpen, onClose, contractRequest, onApprove, onReject, onRetry, isSuperAdmin }) {
    if (!isOpen || !contractRequest) return null;

    const user = usePage().props.auth.user;
    const isOwner = user && (int(user.id) === int(contractRequest.requested_by));

    function int(val) {
        return parseInt(val, 10);
    }

    const clientName = contractRequest.client?.nom || contractRequest.client?.c_nom || 'Client N/A';
    const profileName = contractRequest.profile?.full_name || contractRequest.profile?.nom || 'Candidat N/A';
    const requesterName = contractRequest.requester?.name || 'Utilisateur';
    const approverName = contractRequest.approver?.name || 'Non attribué';

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                        En attente d'approbation
                    </span>
                );
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-300 dark:border-blue-700/50">
                        <FiCheckCircle size={13} />
                        Approuvée
                    </span>
                );
            case 'generating':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-300 dark:border-purple-700/50">
                        <FiRefreshCw size={13} className="animate-spin" />
                        Génération en cours...
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50">
                        <FiCheckCircle size={13} />
                        Contrat Prêt
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-300 dark:border-rose-700/50">
                        <FiXCircle size={13} />
                        Refusée
                    </span>
                );
            case 'failed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-300 dark:border-red-700/50">
                        <FiAlertTriangle size={13} />
                        Échec de génération
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        Annulée
                    </span>
                );
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    const steps = [
        { label: 'Demande soumise', active: true, completed: true, date: contractRequest.created_at },
        {
            label: 'Approbation Super Admin',
            active: ['approved', 'generating', 'completed'].includes(contractRequest.status),
            completed: ['approved', 'generating', 'completed'].includes(contractRequest.status),
            rejected: contractRequest.status === 'rejected',
            date: contractRequest.approved_at,
        },
        {
            label: 'Génération PDF Asynchrone',
            active: ['generating', 'completed'].includes(contractRequest.status),
            completed: contractRequest.status === 'completed',
            failed: contractRequest.status === 'failed',
            inProgress: contractRequest.status === 'generating',
        },
        {
            label: 'Contrat Prêt au Téléchargement',
            active: contractRequest.status === 'completed',
            completed: contractRequest.status === 'completed',
            date: contractRequest.completed_at,
        },
    ];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-gray-100 dark:border-gray-700 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-900 via-indigo-950 to-indigo-900 px-6 py-5 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/10 rounded-xl">
                            <FiFileText size={22} className="text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold">Demande de Contrat #{contractRequest.id}</h3>
                                {getStatusBadge(contractRequest.status)}
                            </div>
                            <p className="text-xs text-gray-300 mt-0.5">Affectation associée #{contractRequest.assignment_id}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    {/* Stepper Progression */}
                    <div className="bg-slate-50 dark:bg-gray-700/40 p-5 rounded-2xl border border-slate-200/80 dark:border-gray-600/60">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                            Cycle de vie de la demande
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative">
                            {steps.map((step, idx) => {
                                let badgeColor = 'bg-gray-200 dark:bg-gray-600 text-gray-500';
                                if (step.completed) badgeColor = 'bg-emerald-500 text-white';
                                else if (step.inProgress) badgeColor = 'bg-purple-600 text-white animate-pulse';
                                else if (step.rejected || step.failed) badgeColor = 'bg-rose-500 text-white';

                                return (
                                    <div key={idx} className="flex flex-col items-center text-center p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-slate-100 dark:border-gray-700">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 ${badgeColor}`}>
                                            {step.completed ? <FiCheckCircle size={15} /> : (step.inProgress ? <FiRefreshCw size={14} className="animate-spin" /> : idx + 1)}
                                        </div>
                                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{step.label}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Client Info */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
                            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                                <FiBriefcase size={14} />
                                <span>Informations Client</span>
                            </div>
                            <p className="text-base font-bold text-gray-900 dark:text-white">{clientName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Téléphone: {contractRequest.client?.phone || contractRequest.client?.c_gsm1 || 'N/A'}</p>
                            {contractRequest.client?.cin && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">CIN: {contractRequest.client?.cin}</p>
                            )}
                        </div>

                        {/* Candidat Info */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                <FiUser size={14} />
                                <span>Candidat / Profil</span>
                            </div>
                            <p className="text-base font-bold text-gray-900 dark:text-white">{profileName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Matricule: {contractRequest.profile?.matricule || contractRequest.profile?.mat || 'N/A'}</p>
                            {contractRequest.profile?.cin && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">CIN: {contractRequest.profile?.cin}</p>
                            )}
                        </div>
                    </div>

                    {/* Metadata & Rejection / Error Notices */}
                    <div className="bg-slate-50 dark:bg-gray-700/30 rounded-xl p-4 border border-slate-200 dark:border-gray-700 space-y-3 text-sm">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div>
                                <span className="text-gray-500 block">Demandé par</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">{requesterName}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Date de la demande</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">{new Date(contractRequest.created_at).toLocaleString('fr-FR')}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Approuvé par</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">{approverName}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">ID Contrat</span>
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono">{contractRequest.generated_contract_id || 'En attente'}</span>
                            </div>
                        </div>

                        {contractRequest.notes && (
                            <div className="pt-2 border-t border-slate-200 dark:border-gray-600 text-xs">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">Notes du demandeur : </span>
                                <span className="text-gray-600 dark:text-gray-400 italic">{contractRequest.notes}</span>
                            </div>
                        )}

                        {contractRequest.rejection_reason && (
                            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-800 dark:text-rose-300">
                                <span className="font-bold">Motif de refus : </span>
                                <span>{contractRequest.rejection_reason}</span>
                            </div>
                        )}

                        {contractRequest.error_message && (
                            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-800 dark:text-red-300">
                                <span className="font-bold">Erreur de génération : </span>
                                <span className="font-mono">{contractRequest.error_message}</span>
                            </div>
                        )}
                    </div>

                    {/* Audit Trail */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <FiActivity className="text-indigo-600 dark:text-indigo-400" size={16} />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                Journal d'Audit & Traçabilité
                            </h4>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                                <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-500 font-semibold text-left">
                                    <tr>
                                        <th className="px-3 py-2">Action</th>
                                        <th className="px-3 py-2">Utilisateur</th>
                                        <th className="px-3 py-2">Rôle</th>
                                        <th className="px-3 py-2">Détails</th>
                                        <th className="px-3 py-2">Date & Heure</th>
                                        <th className="px-3 py-2">IP</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-800">
                                    {contractRequest.audits && contractRequest.audits.length > 0 ? (
                                        contractRequest.audits.map((audit) => (
                                            <tr key={audit.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                                                <td className="px-3 py-2 font-semibold capitalize text-indigo-700 dark:text-indigo-400">
                                                    {audit.action.replace('_', ' ')}
                                                </td>
                                                <td className="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">
                                                    {audit.user_name || 'Système'}
                                                </td>
                                                <td className="px-3 py-2 text-gray-500">
                                                    {audit.user_role || '-'}
                                                </td>
                                                <td className="px-3 py-2 text-gray-600 dark:text-gray-300 max-w-xs truncate" title={audit.details}>
                                                    {audit.details || '-'}
                                                </td>
                                                <td className="px-3 py-2 text-gray-500 whitespace-nowrap">
                                                    {new Date(audit.created_at).toLocaleString('fr-FR')}
                                                </td>
                                                <td className="px-3 py-2 text-gray-400 font-mono text-[10px]">
                                                    {audit.ip_address || '-'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-3 text-center text-gray-400">
                                                Aucun événement d'audit enregistré
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 dark:bg-gray-800/80 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-700 rounded-xl transition-colors"
                    >
                        Fermer
                    </button>

                    <div className="flex items-center gap-3">
                        {/* Download button if completed */}
                        {contractRequest.status === 'completed' && (
                            <a
                                href={route('contract-requests.download', contractRequest.id)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-md transition-all"
                            >
                                <FiDownload size={16} />
                                Télécharger le Contrat PDF
                            </a>
                        )}

                        {/* Super Admin Retry if failed */}
                        {isSuperAdmin && contractRequest.status === 'failed' && (
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onRetry(contractRequest);
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition-all"
                            >
                                <FiRefreshCw size={15} />
                                Relancer la Génération
                            </button>
                        )}

                        {/* Super Admin Actions if pending */}
                        {isSuperAdmin && contractRequest.status === 'pending' && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        onReject(contractRequest);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
                                >
                                    <FiXCircle size={16} />
                                    Refuser
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        onApprove(contractRequest);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all"
                                >
                                    <FiCheckCircle size={16} />
                                    Approuver & Générer
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
