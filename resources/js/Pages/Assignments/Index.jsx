import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    FiPlus, FiEdit2, FiTrash2, FiMoreVertical, FiBriefcase,
    FiFileText, FiDownload, FiClock, FiCheckCircle, FiRefreshCw,
    FiAlertTriangle, FiXCircle, FiZap, FiEye
} from 'react-icons/fi';
import Dropdown from '@/Components/Dropdown';
import RequestContractModal from '@/Pages/ContractRequests/RequestContractModal';

export default function Index({ assignments }) {
    const { auth } = usePage().props;
    const isSuperAdmin = Boolean(
        auth?.isSuperAdmin || 
        ['super admin', 'system administrator', 'superadmin'].includes(auth?.user?.role?.toLowerCase())
    );

    const [selectedAssignmentForRequest, setSelectedAssignmentForRequest] = useState(null);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [generatingId, setGeneratingId] = useState(null);

    const openRequestModal = (assignment) => {
        setSelectedAssignmentForRequest(assignment);
        setIsRequestModalOpen(true);
    };

    const handleDirectGenerate = (assignmentId) => {
        if (confirm('Voulez-vous générer immédiatement le document contractuel pour cette affectation sans soumettre de demande préalable ?')) {
            setGeneratingId(assignmentId);
            router.post(route('assignments.direct-contract', assignmentId), {}, {
                preserveScroll: true,
                onFinish: () => setGeneratingId(null),
            });
        }
    };

    const renderContractStatus = (assignment) => {
        const latestRequest = assignment.latest_contract_request;
        const isCurrentGenerating = generatingId === assignment.id;

        if (isCurrentGenerating) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-xs font-bold border border-purple-300 shadow-sm animate-pulse">
                    <FiRefreshCw size={12} className="animate-spin" />
                    Génération...
                </span>
            );
        }

        if (!latestRequest) {
            if (isSuperAdmin) {
                return (
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => handleDirectGenerate(assignment.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full text-xs font-bold shadow-sm transition-all hover:scale-105 cursor-pointer"
                            title="Générer directement le contrat sans demande préalable (Super Admin)"
                        >
                            <FiZap size={12} className="text-amber-300" />
                            Générer Contrat
                        </button>
                        <button
                            type="button"
                            onClick={() => openRequestModal(assignment)}
                            className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-full text-xs transition-colors"
                            title="Ouvrir le formulaire de configuration"
                        >
                            <FiFileText size={13} />
                        </button>
                    </div>
                );
            }

            return (
                <button
                    type="button"
                    onClick={() => openRequestModal(assignment)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full text-xs font-semibold border border-indigo-200 dark:border-indigo-800 transition-colors"
                >
                    <FiFileText size={13} />
                    Demander contrat
                </button>
            );
        }

        switch (latestRequest.status) {
            case 'pending':
                if (isSuperAdmin) {
                    return (
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => handleDirectGenerate(assignment.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-full text-xs font-bold shadow-sm transition-all"
                                title="Valider et générer immédiatement le contrat"
                            >
                                <FiCheckCircle size={12} />
                                Valider & Générer
                            </button>
                            <Link
                                href={route('contract-requests.index', { search: latestRequest.id })}
                                className="p-1 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-950/40 rounded-full"
                                title="Voir détails de la demande"
                            >
                                <FiEye size={13} />
                            </Link>
                        </div>
                    );
                }
                return (
                    <Link
                        href={route('contract-requests.index', { search: latestRequest.id })}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-full text-xs font-semibold border border-amber-300 hover:bg-amber-100 transition-colors"
                        title="Demande en attente de validation Super Admin"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                        En attente
                    </Link>
                );
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-semibold border border-blue-300">
                        <FiCheckCircle size={12} />
                        Approuvé
                    </span>
                );
            case 'generating':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-xs font-semibold border border-purple-300">
                        <FiRefreshCw size={12} className="animate-spin" />
                        Génération...
                    </span>
                );
            case 'completed':
                return (
                    <a
                        href={route('contract-requests.download', latestRequest.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full text-xs font-semibold border border-emerald-300 transition-colors shadow-sm"
                        title="Télécharger le contrat généré"
                    >
                        <FiDownload size={13} />
                        Télécharger PDF
                    </a>
                );
            case 'rejected':
                if (isSuperAdmin) {
                    return (
                        <button
                            type="button"
                            onClick={() => handleDirectGenerate(assignment.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 rounded-full text-xs font-bold border border-rose-300 transition-colors"
                            title="Régénérer directement le contrat"
                        >
                            <FiZap size={12} className="text-amber-500" />
                            Régénérer
                        </button>
                    );
                }
                return (
                    <button
                        type="button"
                        onClick={() => openRequestModal(assignment)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 rounded-full text-xs font-semibold border border-rose-300 transition-colors"
                        title="Demande refusée. Cliquez pour refaire une demande."
                    >
                        <FiXCircle size={13} />
                        Refusée (Redemander)
                    </button>
                );
            case 'failed':
                if (isSuperAdmin) {
                    return (
                        <button
                            type="button"
                            onClick={() => handleDirectGenerate(assignment.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold shadow-sm transition-all"
                            title="Relancer la génération immédiate"
                        >
                            <FiRefreshCw size={12} />
                            Relancer Génération
                        </button>
                    );
                }
                return (
                    <Link
                        href={route('contract-requests.index', { search: latestRequest.id })}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 hover:bg-red-100 text-red-800 rounded-full text-xs font-semibold border border-red-300"
                        title="Échec de génération"
                    >
                        <FiAlertTriangle size={13} />
                        Échec
                    </Link>
                );
            default:
                return (
                    <button
                        type="button"
                        onClick={() => openRequestModal(assignment)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full text-xs font-medium border border-indigo-200 dark:border-indigo-800"
                    >
                        <FiFileText size={13} />
                        Demander contrat
                    </button>
                );
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Affectations & Contrats</h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gérez les placements des candidats et soumettez les demandes de contrats avec approbation Super Admin.</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center gap-3">
                        <Link
                            href={route('contract-requests.index')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-50 font-medium rounded-xl shadow-sm transition-all text-sm"
                        >
                            <FiFileText size={16} />
                            Voir Toutes les Demandes
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Affectations & Contrats" />

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800/80">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700/50">
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client Entreprise</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Candidat Assigné</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut Affectation</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Workflow Contrat</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Créé par</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {assignments.data.map(assignment => {
                                const latestReq = assignment.latest_contract_request;
                                return (
                                <tr key={assignment.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                                    <td className="py-4 px-6">
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {assignment.client?.nom || assignment.client?.c_nom || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                                                {(assignment.profile?.full_name || assignment.profile?.nom || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-indigo-600 dark:text-indigo-400">
                                                {assignment.profile?.full_name || assignment.profile?.nom || 'N/A'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm">
                                        {assignment.status === 'Changement' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                                Changement
                                            </span>
                                        ) : assignment.status === 'Nouvelle' || assignment.status === 'Nouvel' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                                Nouvelle
                                            </span>
                                        ) : assignment.status === 'active' || assignment.status === 'Actif' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                Actif
                                            </span>
                                        ) : assignment.status === 'completed' || assignment.status === 'Terminé' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                                Terminé
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                                {assignment.status || 'N/A'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-sm">
                                        {renderContractStatus(assignment)}
                                    </td>
                                    <td className="py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                                        {assignment.user?.name || 'Système'}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <Dropdown>
                                            <Dropdown.Trigger>
                                                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                                    <FiMoreVertical size={18} />
                                                </button>
                                            </Dropdown.Trigger>
                                            <Dropdown.Content align="right" width="48">
                                                <Dropdown.Link href={route('assignments.edit', assignment.id)} className="flex items-center gap-2">
                                                    <FiEdit2 className="text-gray-400" /> Modifier / Détails
                                                </Dropdown.Link>
                                                {isSuperAdmin && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDirectGenerate(assignment.id)}
                                                        className="block w-full px-4 py-2 text-start text-sm leading-5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center gap-2 transition duration-150 ease-in-out font-medium"
                                                    >
                                                        <FiZap className="text-emerald-500" /> {latestReq?.status === 'completed' ? 'Régénérer le Contrat' : 'Générer Contrat Directement'}
                                                    </button>
                                                )}
                                                {latestReq?.status === 'completed' && (
                                                    <a
                                                        href={route('contract-requests.download', latestReq.id)}
                                                        className="block w-full px-4 py-2 text-start text-sm leading-5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center gap-2 transition duration-150 ease-in-out font-medium"
                                                    >
                                                        <FiDownload className="text-emerald-500" /> Télécharger Contrat (PDF)
                                                    </a>
                                                )}
                                                {latestReq ? (
                                                    <Dropdown.Link href={route('contract-requests.index', { search: latestReq.id })} className="flex items-center gap-2">
                                                        <FiFileText className="text-indigo-400" /> Voir la demande (#{latestReq.id})
                                                    </Dropdown.Link>
                                                ) : !isSuperAdmin && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openRequestModal(assignment)}
                                                        className="block w-full px-4 py-2 text-start text-sm leading-5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 flex items-center gap-2 transition duration-150 ease-in-out font-medium"
                                                    >
                                                        <FiFileText className="text-indigo-500" /> Demander le contrat
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (confirm('Êtes-vous sûr de vouloir supprimer cette affectation ?')) {
                                                            router.delete(route('assignments.destroy', assignment.id));
                                                        }
                                                    }}
                                                    className="block w-full px-4 py-2 text-start text-sm leading-5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 transition duration-150 ease-in-out"
                                                >
                                                    <FiTrash2 className="text-rose-500" /> Supprimer
                                                </button>
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </td>
                                </tr>
                                );
                            })}

                            {assignments.data.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                                                <FiBriefcase size={28} className="text-gray-400" />
                                            </div>
                                            <p className="text-lg font-medium text-gray-900 dark:text-white">Aucune affectation trouvée</p>
                                            <p className="text-sm mt-1 mb-4">Aucun contrat ou affectation n'est disponible.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Request Contract Modal */}
            <RequestContractModal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                assignment={selectedAssignmentForRequest}
            />
        </AuthenticatedLayout>
    );
}
