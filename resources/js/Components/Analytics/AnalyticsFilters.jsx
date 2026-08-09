import React, { useState } from 'react';
import { 
    FiFilter, 
    FiCalendar, 
    FiFolder, 
    FiTag, 
    FiX, 
    FiRotateCcw, 
    FiChevronDown, 
    FiSearch,
    FiCheck
} from 'react-icons/fi';

const MONTHS = [
    { value: '1', label: 'Janvier' },
    { value: '2', label: 'Février' },
    { value: '3', label: 'Mars' },
    { value: '4', label: 'Avril' },
    { value: '5', label: 'Mai' },
    { value: '6', label: 'Juin' },
    { value: '7', label: 'Juillet' },
    { value: '8', label: 'Août' },
    { value: '9', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' },
];

export default function AnalyticsFilters({ filters, options, onFilterChange, onReset, isUpdating }) {
    const [showDateRange, setShowDateRange] = useState(Boolean(filters.start_date || filters.end_date));

    const currentYear = new Date().getFullYear().toString();
    const currentMonth = (new Date().getMonth() + 1).toString();

    const handleQuickPreset = (preset) => {
        if (preset === 'this_month') {
            onFilterChange({
                ...filters,
                year: currentYear,
                month: currentMonth,
                start_date: '',
                end_date: '',
            });
        } else if (preset === 'this_year') {
            onFilterChange({
                ...filters,
                year: currentYear,
                month: 'all',
                start_date: '',
                end_date: '',
            });
        } else if (preset === 'all_time') {
            onFilterChange({
                ...filters,
                year: 'all',
                month: 'all',
                start_date: '',
                end_date: '',
            });
        }
    };

    const hasActiveFilters = Boolean(
        (filters.year && filters.year !== 'all') ||
        (filters.month && filters.month !== 'all') ||
        filters.project_id ||
        filters.status ||
        filters.start_date ||
        filters.end_date
    );

    const getProjectName = (id) => {
        const p = (options.projects || []).find((item) => String(item.id) === String(id));
        return p ? p.name : `Projet #${id}`;
    };

    const getMonthLabel = (m) => {
        const found = MONTHS.find((item) => String(item.value) === String(m));
        return found ? found.label : `Mois ${m}`;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 no-print">
            {/* Top Bar: Title & Quick Presets */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                        <FiFilter size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            Filtres Globaux & Période
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Affinez les indicateurs et les graphiques en temps réel
                        </p>
                    </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900/60 p-1 rounded-xl border border-gray-100 dark:border-gray-800 text-xs">
                    <button
                        onClick={() => handleQuickPreset('this_month')}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                            filters.year === currentYear && filters.month === currentMonth
                                ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        Ce mois-ci
                    </button>
                    <button
                        onClick={() => handleQuickPreset('this_year')}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                            filters.year === currentYear && (filters.month === 'all' || !filters.month)
                                ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        Cette année ({currentYear})
                    </button>
                    <button
                        onClick={() => handleQuickPreset('all_time')}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                            (filters.year === 'all' || !filters.year) && (filters.month === 'all' || !filters.month) && !filters.start_date
                                ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        Vue Globale
                    </button>
                </div>
            </div>

            {/* Main Select Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Year Selector */}
                <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                        Année
                    </label>
                    <select
                        value={filters.year || 'all'}
                        onChange={(e) => onFilterChange({ ...filters, year: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    >
                        <option value="all">Toutes les années</option>
                        {(options.years || [2026, 2025, 2024, 2023]).map((yr) => (
                            <option key={yr} value={yr}>
                                {yr}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Month Selector */}
                <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                        Mois
                    </label>
                    <select
                        value={filters.month || 'all'}
                        onChange={(e) => onFilterChange({ ...filters, month: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    >
                        <option value="all">Tous les mois</option>
                        {MONTHS.map((m) => (
                            <option key={m.value} value={m.value}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Project Filter */}
                <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                        Projet / Agence
                    </label>
                    <select
                        value={filters.project_id || ''}
                        onChange={(e) => onFilterChange({ ...filters, project_id: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    >
                        <option value="">Tous les projets</option>
                        {(options.projects || []).map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Status Filter */}
                <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                        Statut Client / Profil
                    </label>
                    <select
                        value={filters.status || ''}
                        onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    >
                        <option value="">Tous les statuts</option>
                        {(options.clientStatuses || []).map((st) => (
                            <option key={st} value={st}>
                                {st}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Custom Date Range Toggle & Inputs */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                    onClick={() => setShowDateRange(!showDateRange)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold flex items-center gap-1.5 self-start"
                >
                    <FiCalendar size={14} />
                    {showDateRange ? 'Masquer la plage de dates personnalisée' : 'Définir une plage de dates exacte'}
                </button>

                {showDateRange && (
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <div className="flex items-center gap-1">
                            <span className="text-gray-500 dark:text-gray-400">Du:</span>
                            <input
                                type="date"
                                value={filters.start_date || ''}
                                onChange={(e) => onFilterChange({ ...filters, start_date: e.target.value })}
                                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-gray-500 dark:text-gray-400">Au:</span>
                            <input
                                type="date"
                                value={filters.end_date || ''}
                                onChange={(e) => onFilterChange({ ...filters, end_date: e.target.value })}
                                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Active Filter Badges & Reset Bar */}
            {hasActiveFilters && (
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-gray-500 dark:text-gray-400 mr-1">
                        Filtres actifs:
                    </span>

                    {filters.project_id && (
                        <span className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 rounded-lg">
                            <FiFolder size={12} />
                            Projet: {getProjectName(filters.project_id)}
                            <button
                                onClick={() => onFilterChange({ ...filters, project_id: '' })}
                                className="hover:text-indigo-900 ml-1"
                            >
                                <FiX size={12} />
                            </button>
                        </span>
                    )}

                    {filters.year && filters.year !== 'all' && (
                        <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-lg">
                            <FiCalendar size={12} />
                            Année: {filters.year}
                            <button
                                onClick={() => onFilterChange({ ...filters, year: 'all' })}
                                className="hover:text-blue-900 ml-1"
                            >
                                <FiX size={12} />
                            </button>
                        </span>
                    )}

                    {filters.month && filters.month !== 'all' && (
                        <span className="inline-flex items-center gap-1 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2.5 py-1 rounded-lg">
                            <FiCalendar size={12} />
                            Mois: {getMonthLabel(filters.month)}
                            <button
                                onClick={() => onFilterChange({ ...filters, month: 'all' })}
                                className="hover:text-teal-900 ml-1"
                            >
                                <FiX size={12} />
                            </button>
                        </span>
                    )}

                    {filters.status && (
                        <span className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2.5 py-1 rounded-lg">
                            <FiTag size={12} />
                            Statut: {filters.status}
                            <button
                                onClick={() => onFilterChange({ ...filters, status: '' })}
                                className="hover:text-purple-900 ml-1"
                            >
                                <FiX size={12} />
                            </button>
                        </span>
                    )}

                    {(filters.start_date || filters.end_date) && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-lg">
                            <FiCalendar size={12} />
                            Dates: {filters.start_date || '...'} ➔ {filters.end_date || '...'}
                            <button
                                onClick={() => onFilterChange({ ...filters, start_date: '', end_date: '' })}
                                className="hover:text-amber-900 ml-1"
                            >
                                <FiX size={12} />
                            </button>
                        </span>
                    )}

                    <button
                        onClick={onReset}
                        className="inline-flex items-center gap-1 text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 font-medium ml-auto transition-colors"
                    >
                        <FiRotateCcw size={12} />
                        Réinitialiser tout
                    </button>
                </div>
            )}
        </div>
    );
}
