import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiTrendingUp, FiActivity, FiEye } from 'react-icons/fi';

export default function Statistics({ growthData }) {
    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Statistiques & Performances</h2>}>
            <Head title="Statistiques Marketing" />

            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Views</p>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">142.5K</h3>
                            <p className="text-sm text-emerald-500 mt-2 flex items-center gap-1"><FiTrendingUp /> +14% this month</p>
                        </div>
                        <div className="bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 p-3 rounded-xl">
                            <FiEye size={24} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg Engagement Rate</p>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">15.4%</h3>
                            <p className="text-sm text-emerald-500 mt-2 flex items-center gap-1"><FiTrendingUp /> +2.1% this month</p>
                        </div>
                        <div className="bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400 p-3 rounded-xl">
                            <FiActivity size={24} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Interactions</p>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">28.3K</h3>
                            <p className="text-sm text-emerald-500 mt-2 flex items-center gap-1"><FiTrendingUp /> +8% this month</p>
                        </div>
                        <div className="bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400 p-3 rounded-xl">
                            <FiTrendingUp size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Audience Growth</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={growthData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                                <XAxis dataKey="name" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                <Legend />
                                <Line type="monotone" dataKey="Facebook" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="Threads" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
