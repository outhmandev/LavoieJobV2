import React from 'react';
import {
    ResponsiveContainer,
    ComposedChart,
    Area,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    BarChart,
} from 'recharts';
import { 
    FiTrendingUp, 
    FiPieChart, 
    FiBarChart2, 
    FiLayers, 
    FiAward, 
    FiBriefcase, 
    FiDollarSign 
} from 'react-icons/fi';

const STATUS_COLORS = {
    'Validé': '#10B981', // Emerald
    'Prospect': '#3B82F6', // Blue
    'En cours de traitement': '#6366F1', // Indigo
    'En Attente': '#F59E0B', // Amber
    'Suggéré': '#8B5CF6', // Purple
    'Reclamation': '#F43F5E', // Rose
    'Rejet': '#6B7280', // Gray
    'Black liste': '#18181B', // Dark Zinc
    'Disponible': '#10B981',
    'Affecté(e)': '#3B82F6',
    'Injoignable': '#F59E0B',
    'Indisponible': '#9CA3AF',
    'Dossier incomplet': '#EC4899',
};

const PALETTE = [
    '#6366F1', '#3B82F6', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
];

const formatMAD = (value) => {
    return new Intl.NumberFormat('fr-MA', { 
        style: 'decimal', 
        maximumFractionDigits: 0 
    }).format(value || 0) + ' MAD';
};

const CustomTooltip = ({ active, payload, label, isCurrency = false }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-xl text-xs space-y-1.5 min-w-[140px]">
                <p className="font-bold text-gray-900 dark:text-white pb-1 border-b border-gray-100 dark:border-gray-800">
                    {label}
                </p>
                {payload.map((entry, index) => (
                    <div key={`item-${index}`} className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                            <span 
                                className="w-2.5 h-2.5 rounded-full" 
                                style={{ backgroundColor: entry.color || entry.fill }}
                            />
                            {entry.name}:
                        </span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">
                            {entry.name?.toLowerCase().includes('revenu') || entry.name?.toLowerCase().includes('chiffre')
                                ? formatMAD(entry.value)
                                : (entry.value || 0).toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function AnalyticsCharts({ charts, onSelectMonth, onSelectProject, onSelectStatus }) {
    if (!charts) return null;

    // Transform Client Statuses for Pie Chart
    const clientStatusData = Object.entries(charts.clientStatuses || {})
        .filter(([_, count]) => count > 0)
        .map(([name, value]) => ({
            name,
            value,
            color: STATUS_COLORS[name] || '#6366F1'
        }))
        .sort((a, b) => b.value - a.value);

    const totalClientsCount = clientStatusData.reduce((acc, curr) => acc + curr.value, 0);

    // Transform Profile Statuses for Bar Chart
    const profileStatusData = Object.entries(charts.profileStatuses || {})
        .filter(([_, count]) => count > 0)
        .map(([name, count]) => ({
            name,
            total: count,
            fill: STATUS_COLORS[name] || '#3B82F6'
        }))
        .sort((a, b) => b.total - a.total);

    // Top Projects
    const projectsData = (charts.projects || []).map((p) => ({
        id: p.id,
        name: p.name.length > 14 ? p.name.substring(0, 12) + '...' : p.name,
        fullName: p.name,
        revenue: p.revenue,
        clients: p.clients_count,
        affectations: p.affectations_count,
        profiles: p.profiles_count,
    }));

    return (
        <div className="space-y-6">
            {/* Row 1: Monthly Evolution (Revenue & Affectations) + Clients by Status Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Evolution Chart (2 Columns) */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                                    <FiTrendingUp size={16} />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                    Évolution Mensuelle du Chiffre d'Affaires & Affectations
                                </h3>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Progression des revenus (MAD) et volume de placements signés
                            </p>
                        </div>
                    </div>

                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                data={charts.monthlyEvolution || []}
                                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                                onClick={(e) => {
                                    if (e && e.activePayload && e.activePayload[0]) {
                                        const payload = e.activePayload[0].payload;
                                        if (onSelectMonth) onSelectMonth(payload.month_num);
                                    }
                                }}
                            >
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                <XAxis 
                                    dataKey="month" 
                                    tick={{ fontSize: 11, fill: '#64748B' }} 
                                    axisLine={{ stroke: '#E2E8F0' }}
                                    tickLine={false}
                                />
                                <YAxis 
                                    yAxisId="left" 
                                    tick={{ fontSize: 11, fill: '#64748B' }} 
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                                />
                                <YAxis 
                                    yAxisId="right" 
                                    orientation="right" 
                                    tick={{ fontSize: 11, fill: '#64748B' }} 
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend 
                                    wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                                    iconType="circle"
                                />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="revenue"
                                    name="Chiffre d'Affaires"
                                    stroke="#6366F1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                                <Bar
                                    yAxisId="right"
                                    dataKey="affectations"
                                    name="Affectations"
                                    fill="#3B82F6"
                                    radius={[4, 4, 0, 0]}
                                    barSize={18}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="clients"
                                    name="Nouveaux Clients"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Clients by Status Donut (1 Column) */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                                <FiPieChart size={16} />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                Répartition des Clients
                            </h3>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Distribution par statut de qualification
                        </p>
                    </div>

                    <div className="h-60 w-full relative flex items-center justify-center my-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={clientStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={3}
                                    dataKey="value"
                                    onClick={(e) => onSelectStatus && onSelectStatus(e.name)}
                                    className="cursor-pointer"
                                >
                                    {clientStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Total Count */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xs text-gray-400 font-medium">Total</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                {totalClientsCount.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Compact Custom Legend */}
                    <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-gray-100 dark:border-gray-800 text-[11px]">
                        {clientStatusData.slice(0, 6).map((item) => (
                            <button
                                key={item.name}
                                onClick={() => onSelectStatus && onSelectStatus(item.name)}
                                className="flex items-center justify-between p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 text-left transition-colors"
                            >
                                <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 truncate">
                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                    <span className="truncate">{item.name}</span>
                                </span>
                                <span className="font-semibold text-gray-900 dark:text-gray-200 shrink-0 ml-1">
                                    {item.value}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 2: Projects Performance Comparison & Profile Candidates Statuses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue & Placements by Project */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                                    <FiBriefcase size={16} />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                    Chiffre d'Affaires & Placements par Projet
                                </h3>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Comparatif de productivité entre agences et projets
                        </p>
                    </div>

                    <div className="h-64 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={projectsData}
                                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                                onClick={(e) => {
                                    if (e && e.activePayload && e.activePayload[0]) {
                                        const p = e.activePayload[0].payload;
                                        if (onSelectProject) onSelectProject(p.id);
                                    }
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                <XAxis 
                                    dataKey="name" 
                                    tick={{ fontSize: 11, fill: '#64748B' }} 
                                    axisLine={{ stroke: '#E2E8F0' }}
                                    tickLine={false}
                                />
                                <YAxis 
                                    yAxisId="left" 
                                    tick={{ fontSize: 11, fill: '#64748B' }} 
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                                />
                                <YAxis 
                                    yAxisId="right" 
                                    orientation="right" 
                                    tick={{ fontSize: 11, fill: '#64748B' }} 
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                                <Bar 
                                    yAxisId="left" 
                                    dataKey="revenue" 
                                    name="Chiffre d'Affaires" 
                                    fill="#8B5CF6" 
                                    radius={[4, 4, 0, 0]} 
                                    barSize={20}
                                    className="cursor-pointer"
                                />
                                <Bar 
                                    yAxisId="right" 
                                    dataKey="affectations" 
                                    name="Affectations" 
                                    fill="#10B981" 
                                    radius={[4, 4, 0, 0]} 
                                    barSize={20}
                                    className="cursor-pointer"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Candidate Profiles Status Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                                <FiLayers size={16} />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                Répartition des Profils Candidats
                            </h3>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Volume du vivier candidat selon leur disponibilité opérationnelle
                        </p>
                    </div>

                    <div className="h-64 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={profileStatusData}
                                margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" opacity={0.5} />
                                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    tick={{ fontSize: 11, fill: '#64748B' }} 
                                    axisLine={false}
                                    tickLine={false}
                                    width={100}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar 
                                    dataKey="total" 
                                    name="Candidats" 
                                    radius={[0, 4, 4, 0]} 
                                    barSize={16}
                                >
                                    {profileStatusData.map((entry, idx) => (
                                        <Cell key={`prof-${idx}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Row 3: Top Jobs & Occupations */}
            {charts.topJobs && charts.topJobs.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                            <FiAward size={16} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                Top Métiers & Profils Demandés
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Répartition des candidats par métier principal
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                        {charts.topJobs.map((job, idx) => (
                            <div 
                                key={job.name}
                                className="p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                            >
                                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                                    #{idx + 1} Métier
                                </span>
                                <span className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-1 mt-0.5">
                                    {job.name}
                                </span>
                                <span className="text-lg font-bold text-gray-800 dark:text-gray-100 block mt-1">
                                    {job.total.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
