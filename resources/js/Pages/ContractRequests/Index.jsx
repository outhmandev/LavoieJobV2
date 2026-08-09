import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import {
    FiFileText, FiClock, FiCheckCircle, FiXCircle, FiRefreshCw,
    FiAlertTriangle, FiSearch, FiFilter, FiDownload, FiEye,
    FiUser, FiBriefcase, FiCalendar, FiArrowRight, FiShield
} from 'react-icons/fi';
import ShowModal from './ShowModal';

export default function Index({ contractRequests, stats, filters, isSuperAdmin }) {
    const user = usePage().props.auth.user;

    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    // Modals state
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Rejection Modal state
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectingRequest, setRejectingRequest] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Approve Confirmation Modal state
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [approvingRequest, setApprovingRequest] = useState(null);

    // Search and filter submission with debouncing
    const applyFilters = useCallback((newStatus = statusFilter) => {
        router.get(
            route('contract-requests.index'),
            {
                search: search || undefined,
                status: newStatus || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }, [search, statusFilter, dateFrom, dateTo]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const handleStatClick = (statusKey) => {
        const nextStatus = statusFilter === statusKey ? '' : statusKey;
        setStatusFilter(nextStatus);
        applyFilters(nextStatus);
    };

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('');
        setDateFrom('');
        setDateTo('');
        router.get(route('contract-requests.index'), {}, { preserveState: true, replace: true });
    };

    // Real-time Echo listener & Polling fallback
    useEffect(() => {
        // Echo setup
        if (window.Echo) {
            let channel;
            if (isSuperAdmin) {
                channel = window.Echo.private('contract-requests.admin');
            } else if (user?.id) {
                channel = window.Echo.private(`App.Models.User.${user.id}`);
            }

            if (channel) {
                channel.listen('.ContractRequestUpdated', (e) => {
                    // Refresh data in background
                    router.reload({ only: ['contractRequests', 'stats'] });
                });
            }

            return () => {
                if (isSuperAdmin) {
                    window.Echo.leave('contract-requests.admin');
                } else if (user?.id) {
                    window.Echo.leave(`App.Models.User.${user.id}`);
                }
            };
        }
    }, [isSuperAdmin, user?.id]);

    // Actions handlers
    const openApproveModal = (req) => {
        setApprovingRequest(req);
        setApproveModalOpen(true);
    };

    const confirmApprove = () => {
        if (!approvingRequest) return;
        setIsSubmitting(true);
        router.post(
            route('contract-requests.approve', approvingRequest.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsSubmitting(false);
                    setApproveModalOpen(false);
                    setApprovingRequest(null);
                },
            }
        );
    };

    const openRejectModal = (req) => {
        setRejectingRequest(req);
        setRejectReason('');
        setRejectModalOpen(true);
    };

    const confirmReject = (e) => {
        e.preventDefault();
        if (!rejectingRequest) return;
        setIsSubmitting(true);
        router.post(
            route('contract-requests.reject', rejectingRequest.id),
            { reason: rejectReason },
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsSubmitting(false);
                    setRejectModalOpen(false);
                    setRejectingRequest(null);
                    setRejectReason('');
                },
            }
        );
    };

    const handleRetry = (req) => {
        if (confirm(`Voulez-vous relancer la génération du contrat pour la demande #${req.id} ?`)) {
            router.post(route('contract-requests.retry', req.id), {}, { preserveScroll: true });
        }
    };

    const handleCancel = (req) => {
        if (confirm(`Êtes-vous sûr de vouloir annuler votre demande de contrat #${req.id} ?`)) {
            router.post(route('contract-requests.cancel', req.id), {}, { preserveScroll: true });
        }
    };

    const openDetails = (req) => {
        setSelectedRequest(req);
        setIsDetailOpen(true);
    };

    const renderStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        En attente
                    </span>
                );
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-300 dark:border-blue-700/50">
                        <FiCheckCircle size={12} />
                        Approuvée
                    </span>
                );
            case 'generating':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-300 dark:border-purple-700/50">
                        <FiRefreshCw size={12} className="animate-spin" />
                        Génération...
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50">
                        <FiCheckCircle size={12} />
                        Prêt
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-300 dark:border-rose-700/50">
                        <FiXCircle size={12} />
                        Refusée
                    </span>
                );
            case 'failed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-300 dark:border-red-700/50">
                        <FiAlertTriangle size={12} />
                        Échec
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        Annulée
                    </span>
                );
            default:
                return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={isSuperAdmin ? "Gestion des Demandes de Contrats" : "Mes Demandes de Contrats"} />

            <div className="space-y-6">
                {/* Header Title & Description */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/30">
                                <FiFileText size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {isSuperAdmin ? "Demandes & Approbations de Contrats" : "Mes Demandes de Contrats"}
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {isSuperAdmin
                                        ? "Validez ou refusez les demandes de génération de contrat soumises par les membres de l'équipe."
                                        : "Suivez l'état d'approbation et téléchargez les contrats générés après validation Super Admin."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('assignments.index')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all text-sm"
                        >
                            <FiBriefcase size={16} />
                            Voir les Affectations
                        </Link>
                    </div>
                </div>

                {/* KPI Statistics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                    {/* Total */}
                    <div
                        onClick={() => handleStatClick('')}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${statusFilter === ''
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700 shadow-md ring-2 ring-indigo-500/20'
                            : 'bg-white dark:bg-gray-800 border-gray-200/80 dark:border-gray-700 hover:border-indigo-200 shadow-sm'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</span>
                            <div className="p-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-xl">
                                <FiFileText size={16} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.total || 0}</p>
                        <span className="text-[11px] text-gray-400 font-medium">Toutes demandes</span>
                    </div>

                    {/* Pending */}
                    <div
                        onClick={() => handleStatClick('pending')}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${statusFilter === 'pending'
                            ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 shadow-md ring-2 ring-amber-500/20'
                            : 'bg-white dark:bg-gray-800 border-gray-200/80 dark:border-gray-700 hover:border-amber-200 shadow-sm'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">En Attente</span>
                            <div className="p-2 bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 rounded-xl">
                                <FiClock size={16} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">{stats.pending || 0}</p>
                        <span className="text-[11px] text-amber-600/80 font-medium">À approuver</span>
                    </div>

                    {/* Generating / Approved */}
                    <div
                        onClick={() => handleStatClick('generating')}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${statusFilter === 'generating'
                            ? 'bg-purple-50/80 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700 shadow-md ring-2 ring-purple-500/20'
                            : 'bg-white dark:bg-gray-800 border-gray-200/80 dark:border-gray-700 hover:border-purple-200 shadow-sm'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider">En Cours</span>
                            <div className="p-2 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 rounded-xl">
                                <FiRefreshCw size={16} className={stats.generating > 0 ? "animate-spin" : ""} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">{stats.generating || 0}</p>
                        <span className="text-[11px] text-purple-600/80 font-medium">Génération PDF</span>
                    </div>

                    {/* Completed */}
                    <div
                        onClick={() => handleStatClick('completed')}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${statusFilter === 'completed'
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 shadow-md ring-2 ring-emerald-500/20'
                            : 'bg-white dark:bg-gray-800 border-gray-200/80 dark:border-gray-700 hover:border-emerald-200 shadow-sm'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Prêts</span>
                            <div className="p-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 rounded-xl">
                                <FiCheckCircle size={16} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{stats.completed || 0}</p>
                        <span className="text-[11px] text-emerald-600/80 font-medium">Téléchargeables</span>
                    </div>

                    {/* Rejected */}
                    <div
                        onClick={() => handleStatClick('rejected')}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${statusFilter === 'rejected'
                            ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700 shadow-md ring-2 ring-rose-500/20'
                            : 'bg-white dark:bg-gray-800 border-gray-200/80 dark:border-gray-700 hover:border-rose-200 shadow-sm'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Refusées</span>
                            <div className="p-2 bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 rounded-xl">
                                <FiXCircle size={16} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">{stats.rejected || 0}</p>
                        <span className="text-[11px] text-rose-600/80 font-medium">Rejetées</span>
                    </div>

                    {/* Failed */}
                    <div
                        onClick={() => handleStatClick('failed')}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${statusFilter === 'failed'
                            ? 'bg-red-50/80 dark:bg-red-950/30 border-red-300 dark:border-red-700 shadow-md ring-2 ring-red-500/20'
                            : 'bg-white dark:bg-gray-800 border-gray-200/80 dark:border-gray-700 hover:border-red-200 shadow-sm'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider">Échecs</span>
                            <div className="p-2 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-xl">
                                <FiAlertTriangle size={16} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">{stats.failed || 0}</p>
                        <span className="text-[11px] text-red-600/80 font-medium">À relancer</span>
                    </div>
                </div>

                {/* Filter Toolbar */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Rechercher par #ID, Client, Candidat, Demandeur..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Status Select */}
                        <div className="w-full md:w-48">
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    applyFilters(e.target.value);
                                }}
                                className="w-full py-2.5 px-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            >
                                <option value="">Tous les statuts</option>
                                <option value="pending">En attente</option>
                                <option value="approved">Approuvée</option>
                                <option value="generating">En génération</option>
                                <option value="completed">Prêt (Complété)</option>
                                <option value="rejected">Refusée</option>
                                <option value="failed">Échec</option>
                                <option value="cancelled">Annulée</option>
                            </select>
                        </div>

                        {/* Date From */}
                        <div className="w-full md:w-40">
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full py-2 px-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                title="Date début"
                            />
                        </div>

                        {/* Date To */}
                        <div className="w-full md:w-40">
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full py-2 px-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                title="Date fin"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                type="submit"
                                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all shrink-0"
                            >
                                Filtrer
                            </button>
                            {(search || statusFilter || dateFrom || dateTo) && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="px-3 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl transition-all shrink-0"
                                >
                                    Réinitialiser
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Main Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50/80 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        ID / Réf
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Client & Candidat
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Demandé par
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Approbateur / Date
                                    </th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800">
                                {contractRequests.data && contractRequests.data.length > 0 ? (
                                    contractRequests.data.map((req) => {
                                        const clientName = req.client?.nom || req.client?.c_nom || 'Client N/A';
                                        const profileName = req.profile?.full_name || req.profile?.nom || 'Candidat N/A';
                                        const isOwner = user && (parseInt(user.id, 10) === parseInt(req.requested_by, 10));

                                        return (
                                            <tr key={req.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/30 transition-colors">
                                                {/* ID / Ref */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-gray-900 dark:text-white text-sm">
                                                            #{req.id}
                                                        </span>
                                                        {req.generated_contract_id && (
                                                            <span className="text-[11px] font-mono font-medium px-2 py-0.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-md border border-indigo-100 dark:border-indigo-800">
                                                                {req.generated_contract_id}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-400 block mt-0.5">
                                                        Aff. #{req.assignment_id}
                                                    </span>
                                                </td>

                                                {/* Client & Profile */}
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <FiBriefcase className="text-indigo-500 shrink-0" size={14} />
                                                            <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                                                {clientName}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                            <FiUser className="text-emerald-500 shrink-0" size={14} />
                                                            <span>{profileName}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Requester */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                                        {req.requester?.name || 'Inconnu'}
                                                    </p>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(req.created_at).toLocaleDateString('fr-FR')}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {renderStatusBadge(req.status)}
                                                    {req.rejection_reason && (
                                                        <p className="text-xs text-rose-600 dark:text-rose-400 truncate max-w-xs mt-1" title={req.rejection_reason}>
                                                            Motif: {req.rejection_reason}
                                                        </p>
                                                    )}
                                                    {req.error_message && (
                                                        <p className="text-xs text-red-600 dark:text-red-400 truncate max-w-xs mt-1" title={req.error_message}>
                                                            Err: {req.error_message}
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Approver */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {req.approver ? (
                                                        <div>
                                                            <p className="font-medium text-gray-800 dark:text-gray-200">
                                                                {req.approver.name}
                                                            </p>
                                                            <span className="text-xs text-gray-400">
                                                                {req.approved_at ? new Date(req.approved_at).toLocaleDateString('fr-FR') : ''}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">En attente</span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* Details Modal */}
                                                        <button
                                                            onClick={() => openDetails(req)}
                                                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-colors"
                                                            title="Voir les détails et l'audit"
                                                        >
                                                            <FiEye size={17} />
                                                        </button>

                                                        {/* Download if Completed */}
                                                        {req.status === 'completed' && (
                                                            <a
                                                                href={route('contract-requests.download', req.id)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                                                                title="Télécharger le contrat PDF"
                                                            >
                                                                <FiDownload size={14} />
                                                                Télécharger
                                                            </a>
                                                        )}

                                                        {/* Super Admin Retry if Failed */}
                                                        {isSuperAdmin && req.status === 'failed' && (
                                                            <button
                                                                onClick={() => handleRetry(req)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                                                                title="Relancer la génération"
                                                            >
                                                                <FiRefreshCw size={13} />
                                                                Relancer
                                                            </button>
                                                        )}

                                                        {/* Super Admin Approval / Reject if Pending */}
                                                        {isSuperAdmin && req.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => openRejectModal(req)}
                                                                    className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                                                                    title="Refuser la demande"
                                                                >
                                                                    <FiXCircle size={18} />
                                                                </button>

                                                                <button
                                                                    onClick={() => openApproveModal(req)}
                                                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                                                                    title="Approuver la demande"
                                                                >
                                                                    <FiCheckCircle size={14} />
                                                                    Approuver
                                                                </button>
                                                            </>
                                                        )}

                                                        {/* Member Cancel if Pending */}
                                                        {!isSuperAdmin && isOwner && req.status === 'pending' && (
                                                            <button
                                                                onClick={() => handleCancel(req)}
                                                                className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                                            >
                                                                Annuler
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                            <FiFileText size={36} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                            <p className="text-base font-semibold text-gray-600 dark:text-gray-300">Aucune demande de contrat trouvée</p>
                                            <p className="text-xs text-gray-400 mt-1">Modifiez vos filtres ou demandez un contrat depuis une affectation.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {contractRequests.links && contractRequests.links.length > 3 && (
                        <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Affichage de <strong>{contractRequests.from || 0}</strong> à <strong>{contractRequests.to || 0}</strong> sur <strong>{contractRequests.total || 0}</strong> demandes
                            </div>
                            <div className="flex items-center gap-1">
                                {contractRequests.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${link.active
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : !link.url
                                                ? 'text-gray-300 dark:text-gray-600 pointer-events-none'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Details Modal */}
            <ShowModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                contractRequest={selectedRequest}
                onApprove={openApproveModal}
                onReject={openRejectModal}
                onRetry={handleRetry}
                isSuperAdmin={isSuperAdmin}
            />

            {/* Approve Confirmation Modal */}
            {approveModalOpen && approvingRequest && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 dark:border-gray-700 p-6 space-y-4">
                        <div className="flex items-center gap-3 text-indigo-600">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-950/50 rounded-2xl">
                                <FiCheckCircle size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirmer l'Approbation</h3>
                                <p className="text-xs text-gray-500">Demande de contrat #{approvingRequest.id}</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            En confirmant l'approbation, la génération asynchrone du contrat PDF pour le client <strong>{approvingRequest.client?.nom || approvingRequest.client?.c_nom}</strong> sera immédiatement lancée en arrière-plan.
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => setApproveModalOpen(false)}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={confirmApprove}
                                disabled={isSubmitting}
                                className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md disabled:opacity-50"
                            >
                                {isSubmitting ? 'Traitement...' : 'Confirmer & Générer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModalOpen && rejectingRequest && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 dark:border-gray-700 p-6 space-y-4">
                        <div className="flex items-center gap-3 text-rose-600">
                            <div className="p-3 bg-rose-100 dark:bg-rose-950/50 rounded-2xl">
                                <FiXCircle size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Refuser la Demande</h3>
                                <p className="text-xs text-gray-500">Demande de contrat #{rejectingRequest.id}</p>
                            </div>
                        </div>

                        <form onSubmit={confirmReject} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                    Motif du refus <span className="text-gray-400 font-normal">(Optionnel)</span>
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    rows={3}
                                    placeholder="Expliquez la raison du refus pour informer le demandeur..."
                                    className="w-full text-sm rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setRejectModalOpen(false)}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Traitement...' : 'Confirmer le Refus'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
