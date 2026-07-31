import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { FiUsers, FiUserCheck, FiBriefcase, FiTrendingUp, FiArrowUpRight, FiMoreVertical } from 'react-icons/fi';

export default function Dashboard({ stats, recentActivity }) {
    // Data for Dashboard Visualization from backend
    const dashboardStats = [
        { title: 'Total Clients', value: stats?.totalClients || 0, change: '+0%', icon: <FiUsers />, color: 'bg-blue-500' },
        { title: 'Active Profiles', value: stats?.activeProfiles || 0, change: '+0%', icon: <FiUserCheck />, color: 'bg-emerald-500' },
        { title: 'Open Assignments', value: stats?.openAssignments || 0, change: '+0%', icon: <FiBriefcase />, color: 'bg-indigo-500' },
        { title: 'Monthly Revenue', value: stats?.monthlyRevenue || '$0.00', change: '+0%', icon: <FiTrendingUp />, color: 'bg-purple-500' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Platform Overview</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Welcome back. Here's what's happening with your agency today.</p>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {dashboardStats.map((stat, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800/80 hover:shadow-lg transition-shadow duration-300">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2 tracking-tight">{stat.value}</h3>
                                </div>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${stat.color}`}>
                                    <span className="text-2xl">{stat.icon}</span>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                <span className={`flex items-center font-semibold ${stat.change.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                    <FiArrowUpRight className={`mr-1 ${stat.change.startsWith('-') && 'rotate-90'}`} />
                                    {stat.change}
                                </span>
                                <span className="text-gray-400 ml-2">vs last month</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Lower Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                    {/* Activity Feed */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-800/80 overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800/80 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                            <button className="text-gray-400 hover:text-gray-600"><FiMoreVertical /></button>
                        </div>
                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                                        <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                        <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Entity</th>
                                        <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {recentActivity.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white">{item.action}</td>
                                            <td className="py-4 px-6 text-sm text-gray-500">{item.name}</td>
                                            <td className="py-4 px-6 text-sm">
                                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                                                    item.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                                    item.status === 'processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                                                    'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-400 text-right">{item.time}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick Match Widget */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg p-6 text-white flex flex-col justify-between">
                        <div>
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
                                <FiBriefcase size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Smart Matching</h3>
                            <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                                The new AI-powered matching engine has found 24 new perfect candidate fits for your open assignments.
                            </p>
                        </div>
                        <Link 
                            href={route('assignments.index')} 
                            className="bg-white text-indigo-700 hover:bg-gray-50 font-semibold py-3 px-4 rounded-xl text-center transition-colors duration-200 shadow-sm"
                        >
                            Review Matches
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
