import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    FiUsers, 
    FiUserCheck, 
    FiBriefcase, 
    FiFileText, 
    FiDownload, 
    FiRefreshCw, 
    FiChevronRight, 
    FiTrendingUp, 
    FiAward, 
    FiCheckCircle, 
    FiClock, 
    FiEye, 
    FiLayers, 
    FiArrowRight, 
    FiBarChart2, 
    FiShield 
} from 'react-icons/fi';
import AnalyticsKPI from '@/Components/Analytics/AnalyticsKPI';
import AnalyticsFilters from '@/Components/Analytics/AnalyticsFilters';
import AnalyticsCharts from '@/Components/Analytics/AnalyticsCharts';

export default function AnalyticsIndex({ analytics, filters = {}, options = {}, recentActivity = [] }) {
    const [currentFilters, setCurrentFilters] = useState(filters);
    const [isUpdating, setIsUpdating] = useState(false);

    // Apply Filter change via Inertia router
    const handleFilterChange = (newFilters) => {
        setCurrentFilters(newFilters);
        setIsUpdating(true);

        // Filter out empty params
        const params = {};
        Object.entries(newFilters).forEach(([key, val]) => {
            if (val && val !== 'all') {
                params[key] = val;
            }
        });

        router.get(route('admin.analytics.index'), params, {
            preserveState: true,
            preserveScroll: true,
            only: ['analytics', 'filters', 'recentActivity'],
            onFinish: () => setIsUpdating(false),
        });
    };

    // Reset all filters
    const handleResetFilters = () => {
        const cleanFilters = {
            year: 'all',
            month: 'all',
            project_id: '',
            client_id: '',
            profile_id: '',
            status: '',
            start_date: '',
            end_date: '',
        };
        handleFilterChange(cleanFilters);
    };

    // Drilldown handlers
    const handleSelectMonth = (monthNum) => {
        handleFilterChange({
            ...currentFilters,
            month: String(monthNum),
        });
    };

    const handleSelectProject = (projectId) => {
        handleFilterChange({
            ...currentFilters,
            project_id: String(projectId),
        });
    };

    const handleSelectStatus = (statusName) => {
        handleFilterChange({
            ...currentFilters,
            status: statusName,
        });
    };

    // Format MAD currency helper
    const formatMAD = (amount) => {
        return new Intl.NumberFormat('fr-MA', {
            style: 'decimal',
            maximumFractionDigits: 0,
        }).format(amount || 0) + ' MAD';
    };

    const activeProjectName = options.projects?.find(
        (p) => String(p.id) === String(currentFilters.project_id)
    )?.name;

    const printDate = new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                            <span className="flex items-center gap-1">
                                <FiShield size={13} className="text-amber-500" />
                                Administration
                            </span>
                            <FiChevronRight size={12} />
                            <span>Statistiques & Analytics</span>
                            {activeProjectName && (
                                <>
                                    <FiChevronRight size={12} />
                                    <span className="bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                                        Projet: {activeProjectName}
                                    </span>
                                </>
                            )}
                        </div>
                        <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
                            <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
                                <FiBarChart2 size={20} />
                            </span>
                            Statistiques & Analytics Avancées
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Rapports décisionnels exclusifs Super Admin & Administrateur Système — Performance, Chiffre d'Affaires & Indicateurs Clés
                        </p>
                    </div>

                    {/* Header Actions: Exporter & Refresh */}
                    <div className="flex items-center gap-2.5 self-start sm:self-auto no-print">
                        <button
                            onClick={() => handleFilterChange(currentFilters)}
                            disabled={isUpdating}
                            className="p-2.5 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                            title="Actualiser les données"
                        >
                            <FiRefreshCw size={16} className={isUpdating ? 'animate-spin text-indigo-600' : ''} />
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-xl transition-all shadow-sm hover:shadow-indigo-500/25 cursor-pointer"
                            title="Exporter le rapport complet en PDF"
                        >
                            <FiDownload size={15} />
                            Exporter
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Statistiques & Analytics (Super Admin)" />

            <div className="space-y-6 max-w-7xl mx-auto py-2">
                {/* 0. Print-Only Document Header (Clean Official PDF Layout) */}
                <div className="hidden print:block border-b-2 border-indigo-600 pb-4 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                LAVOIEJOB — RAPPORT STATISTIQUE & DÉCISIONNEL
                            </h1>
                            <p className="text-xs text-slate-600 mt-1">
                                Performance Globale, Chiffre d'Affaires & Indicateurs Clés d'Activité
                            </p>
                        </div>
                        <div className="text-right text-xs text-slate-600 space-y-1">
                            <p><span className="font-bold text-slate-800">Date d'Export :</span> {printDate}</p>
                            <p><span className="font-bold text-slate-800">Périmètre :</span> {activeProjectName ? `Projet ${activeProjectName}` : 'Tous les projets'}</p>
                            <p>
                                <span className="font-bold text-slate-800">Période :</span>{' '}
                                {currentFilters.year && currentFilters.year !== 'all' ? `Année ${currentFilters.year}` : 'Toutes les années'}
                                {currentFilters.month && currentFilters.month !== 'all' ? ` (Mois: ${currentFilters.month})` : ''}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 1. Global Filter Component (Hidden during Print) */}
                <AnalyticsFilters
                    filters={currentFilters}
                    options={options}
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                    isUpdating={isUpdating}
                />

                {/* 2. KPI Cards & Status Pills Row */}
                <AnalyticsKPI
                    kpis={analytics?.kpis}
                    activeStatus={currentFilters.status}
                    onSelectStatus={handleSelectStatus}
                />

                {/* 3. Interactive Recharts Charts Grid */}
                <AnalyticsCharts
                    charts={analytics?.charts}
                    onSelectMonth={handleSelectMonth}
                    onSelectProject={handleSelectProject}
                    onSelectStatus={handleSelectStatus}
                />

                {/* 4. Project Performance Leaderboard & Drilldown Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden break-inside-avoid">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 no-print">
                                <FiLayers size={16} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                    Tableau Comparatif des Projets
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 no-print">
                                    Performances détaillées par agence avec options de drill-down direct
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/60 dark:bg-gray-900/40 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                                    <th className="py-3 px-6">Projet</th>
                                    <th className="py-3 px-6 text-center">Clients</th>
                                    <th className="py-3 px-6 text-center">Profils Vivier</th>
                                    <th className="py-3 px-6 text-center">Affectations</th>
                                    <th className="py-3 px-6 text-center">Taux Placement</th>
                                    <th className="py-3 px-6 text-center">Réclamations</th>
                                    <th className="py-3 px-6 text-right">Chiffre d'Affaires</th>
                                    <th className="py-3 px-6 text-right no-print">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                                {(analytics?.charts?.projects || []).map((p, idx) => {
                                    const isSelected = String(currentFilters.project_id) === String(p.id);
                                    return (
                                        <tr 
                                            key={p.id}
                                            className={`hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors ${
                                                isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20 font-semibold' : ''
                                            }`}
                                        >
                                            <td className="py-3.5 px-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="font-bold text-gray-900 dark:text-white">
                                                        {p.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-6 text-center font-medium text-gray-700 dark:text-gray-300">
                                                {p.clients_count.toLocaleString()}
                                            </td>
                                            <td className="py-3.5 px-6 text-center font-medium text-gray-700 dark:text-gray-300">
                                                {p.profiles_count.toLocaleString()}
                                            </td>
                                            <td className="py-3.5 px-6 text-center font-bold text-indigo-600 dark:text-indigo-400">
                                                {p.affectations_count.toLocaleString()}
                                            </td>
                                            <td className="py-3.5 px-6 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                                                    {p.conversion_rate}%
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-6 text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                                    p.reclamations_count > 0
                                                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                                                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                                }`}>
                                                    {p.reclamations_count}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-6 text-right font-black text-gray-900 dark:text-white">
                                                {formatMAD(p.revenue)}
                                            </td>
                                            <td className="py-3.5 px-6 text-right no-print">
                                                <button
                                                    onClick={() => handleSelectProject(isSelected ? '' : p.id)}
                                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-indigo-600 text-white shadow-sm'
                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 hover:text-indigo-600'
                                                    }`}
                                                >
                                                    {isSelected ? 'Filtré ✓' : 'Analyser'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 5. Bottom Grid: Recent Activity + Quick Shortcuts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 break-inside-avoid">
                    {/* Recent Operational Activity Feed */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 no-print">
                                        <FiClock size={16} />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                        Activité Opérationnelle Récente
                                    </h3>
                                </div>
                                <span className="text-xs text-gray-400 no-print">
                                    Flux en temps réel
                                </span>
                            </div>

                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {(recentActivity || []).length === 0 ? (
                                    <p className="text-xs text-gray-400 py-6 text-center">
                                        Aucune activité récente pour cette période.
                                    </p>
                                ) : (
                                    recentActivity.map((item) => (
                                        <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                    {item.name ? item.name.charAt(0).toUpperCase() : '•'}
                                                </div>
                                                <div>
                                                    <h5 className="text-xs font-bold text-gray-900 dark:text-white">
                                                        {item.action}
                                                    </h5>
                                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                                                        {item.name}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                                    {item.status}
                                                </span>
                                                <span className="text-[11px] text-gray-400">
                                                    {item.time}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Access & Workflow Shortcuts (Hidden in Print) */}
                    <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-900 rounded-2xl shadow-md p-6 text-white flex flex-col justify-between no-print">
                        <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm inline-block mb-4">
                                Accès Rapide
                            </span>
                            <h3 className="text-xl font-bold mb-2">
                                Administration Système
                            </h3>
                            <p className="text-indigo-100 text-xs leading-relaxed mb-6">
                                Gérez les projets, les utilisateurs du système, les rôles et consultez les journaux d'audit.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Link
                                href={route('admin.projects.index')}
                                className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold transition-all backdrop-blur-sm"
                            >
                                <span className="flex items-center gap-2">
                                    <FiBriefcase /> Configuration Projets
                                </span>
                                <FiArrowRight />
                            </Link>
                            <Link
                                href={route('admin.users.index')}
                                className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold transition-all backdrop-blur-sm"
                            >
                                <span className="flex items-center gap-2">
                                    <FiUsers /> Gestion Utilisateurs
                                </span>
                                <FiArrowRight />
                            </Link>
                            <Link
                                href={route('admin.audits.index')}
                                className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold transition-all backdrop-blur-sm"
                            >
                                <span className="flex items-center gap-2">
                                    <FiLayers /> Logs d'Audit
                                </span>
                                <FiArrowRight />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 6. Print-Only Document Footer */}
                <div className="hidden print:block mt-8 pt-4 border-t border-slate-300 text-xs text-slate-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-bold text-slate-800">LavoieJob V2 — Direction Générale</p>
                            <p className="text-[10px] text-slate-500">Rapport confidentiel généré pour usage interne exclusif.</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-500">Certifié conforme par le Système Décisionnel</p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
