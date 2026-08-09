import React from 'react';
import { 
    FiUsers, 
    FiUserCheck, 
    FiBriefcase, 
    FiDollarSign, 
    FiAlertCircle, 
    FiArrowUpRight, 
    FiArrowDownRight, 
    FiMinus,
    FiCheckCircle,
    FiClock,
    FiUserX,
    FiSlash,
    FiFilter
} from 'react-icons/fi';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', { 
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
    }).format(amount || 0) + ' MAD';
};

const getStatusBadgeStyle = (status) => {
    switch (status) {
        case 'Validé':
            return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20';
        case 'Prospect':
            return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20 hover:bg-blue-500/20';
        case 'En cours de traitement':
            return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20 hover:bg-indigo-500/20';
        case 'En Attente':
            return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 hover:bg-amber-500/20';
        case 'Suggéré':
            return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20 hover:bg-purple-500/20';
        case 'Reclamation':
            return 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20 hover:bg-rose-500/20';
        case 'Rejet':
            return 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20 hover:bg-gray-500/20';
        case 'Black liste':
            return 'bg-zinc-800 text-zinc-100 border-zinc-900 hover:bg-zinc-900';
        default:
            return 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200';
    }
};

export default function AnalyticsKPI({ kpis, activeStatus, onSelectStatus }) {
    if (!kpis) return null;

    const cards = [
        {
            id: 'clients',
            title: 'Total Clients',
            value: kpis.totalClients?.value || 0,
            formattedValue: (kpis.totalClients?.value || 0).toLocaleString(),
            trend: kpis.totalClients?.trend,
            subtitle: 'Clients enregistrés',
            icon: <FiUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
            iconBg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-900/50',
            accent: 'from-blue-600 to-indigo-600',
        },
        {
            id: 'profiles',
            title: 'Total Profils',
            value: kpis.totalProfiles?.value || 0,
            formattedValue: (kpis.totalProfiles?.value || 0).toLocaleString(),
            trend: kpis.totalProfiles?.trend,
            subtitle: `${kpis.totalProfiles?.available || 0} disponibles actuellement`,
            icon: <FiUserCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
            iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-900/50',
            accent: 'from-emerald-600 to-teal-600',
        },
        {
            id: 'affectations',
            title: 'Total Affectations',
            value: kpis.totalAssignments?.value || 0,
            formattedValue: (kpis.totalAssignments?.value || 0).toLocaleString(),
            trend: kpis.totalAssignments?.trend,
            subtitle: `${kpis.totalAssignments?.active || 0} contrats actifs`,
            icon: <FiBriefcase className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
            iconBg: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-100 dark:border-indigo-900/50',
            accent: 'from-indigo-600 to-violet-600',
        },
        {
            id: 'revenue',
            title: 'Chiffre d\'Affaires',
            value: kpis.totalRevenue?.value || 0,
            formattedValue: formatCurrency(kpis.totalRevenue?.value),
            trend: kpis.totalRevenue?.trend,
            subtitle: 'Honoraires et contrats signés',
            icon: <FiDollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
            iconBg: 'bg-purple-50 dark:bg-purple-950/50 border-purple-100 dark:border-purple-900/50',
            accent: 'from-purple-600 to-pink-600',
        },
        {
            id: 'reclamations',
            title: 'Réclamations',
            value: kpis.totalReclamations?.value || 0,
            formattedValue: (kpis.totalReclamations?.value || 0).toLocaleString(),
            trend: kpis.totalReclamations?.trend,
            subtitle: `${kpis.totalReclamations?.clientReclamations || 0} clients, ${kpis.totalReclamations?.profileReclamations || 0} profils`,
            icon: <FiAlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
            iconBg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-100 dark:border-rose-900/50',
            accent: 'from-rose-600 to-orange-600',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Main KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {cards.map((card) => {
                    const trend = card.trend || { change: 0, trend: 'neutral' };
                    const isUp = trend.trend === 'up';
                    const isDown = trend.trend === 'down';

                    return (
                        <div
                            key={card.id}
                            className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 group"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    {card.title}
                                </span>
                                <div className={`p-2.5 rounded-xl border ${card.iconBg} group-hover:scale-110 transition-transform duration-200`}>
                                    {card.icon}
                                </div>
                            </div>

                            <div className="mt-3">
                                <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    {card.formattedValue}
                                </div>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {card.subtitle}
                                </p>
                            </div>

                            {/* Trend Indicator */}
                            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1 font-medium">
                                    {isUp && (
                                        <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md font-semibold">
                                            <FiArrowUpRight size={14} />
                                            +{Math.abs(trend.change)}%
                                        </span>
                                    )}
                                    {isDown && (
                                        <span className="flex items-center gap-0.5 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded-md font-semibold">
                                            <FiArrowDownRight size={14} />
                                            -{Math.abs(trend.change)}%
                                        </span>
                                    )}
                                    {!isUp && !isDown && (
                                        <span className="flex items-center gap-0.5 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-md">
                                            <FiMinus size={14} />
                                            0%
                                        </span>
                                    )}
                                    <span className="text-gray-400 dark:text-gray-500 text-[11px] ml-1">
                                        vs mois préc.
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Clients Grouped by Existing Statuses Pill Row */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                            Clients par Statut Opérationnel
                        </h4>
                    </div>
                    {activeStatus && (
                        <button
                            onClick={() => onSelectStatus('')}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 self-start"
                        >
                            <FiFilter size={12} />
                            Afficher tous les statuts
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                    {Object.entries(kpis.clientStatuses || {}).map(([status, count]) => {
                        const isSelected = activeStatus === status;
                        return (
                            <button
                                key={status}
                                onClick={() => onSelectStatus(isSelected ? '' : status)}
                                className={`flex flex-col items-start p-2.5 rounded-xl border transition-all text-left duration-150 ${getStatusBadgeStyle(status)} ${
                                    isSelected ? 'ring-2 ring-indigo-500 shadow-sm scale-[1.02]' : 'opacity-90'
                                }`}
                            >
                                <span className="text-[11px] font-medium leading-tight line-clamp-1">
                                    {status}
                                </span>
                                <span className="text-lg font-bold mt-1">
                                    {count.toLocaleString()}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
