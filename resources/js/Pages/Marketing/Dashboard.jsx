import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { FiUsers, FiGlobe, FiSend, FiCalendar, FiTrendingUp } from 'react-icons/fi';

export default function Dashboard({ auth, stats, recentPosts, topPosts }) {
    const statCards = [
        { title: 'Total Followers', value: stats.totalFollowers.toLocaleString(), icon: <FiUsers />, color: 'bg-blue-500' },
        { title: 'Total Reach', value: stats.totalReach.toLocaleString(), icon: <FiGlobe />, color: 'bg-purple-500' },
        { title: 'Published Posts', value: stats.publishedCount, icon: <FiSend />, color: 'bg-emerald-500' },
        { title: 'Scheduled Posts', value: stats.scheduledCount, icon: <FiCalendar />, color: 'bg-amber-500' },
    ];

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-slate-800 dark:text-slate-200 leading-tight">Marketing Dashboard</h2>}
        >
            <Head title="Marketing Dashboard" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Marketing Overview</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Overview of your social media performance across Meta platforms.</p>
                        </div>
                        <Link 
                            href={route('portal.marketing.calendar')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
                        >
                            View Calendar
                        </Link>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statCards.map((stat, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</h3>
                                </div>
                                <div className={`${stat.color} text-white p-3 rounded-xl shadow-inner`}>
                                    {React.cloneElement(stat.icon, { size: 24 })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Platform Breakdown */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm col-span-1">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                <FiTrendingUp className="text-indigo-500" /> Platform Audience
                            </h3>
                            <div className="space-y-4 mt-6">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-slate-700 dark:text-slate-300">Facebook</span>
                                        <span className="text-slate-500">{stats.fbFollowers.toLocaleString()} followers</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(stats.fbFollowers / stats.totalFollowers) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-slate-700 dark:text-slate-300">Instagram</span>
                                        <span className="text-slate-500">{stats.instagramFollowers?.toLocaleString()} followers</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                        <div className="bg-pink-600 h-2 rounded-full" style={{ width: `${((stats.instagramFollowers || 0) / stats.totalFollowers) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-slate-700 dark:text-slate-300">Threads</span>
                                        <span className="text-slate-500">{stats.threadsFollowers.toLocaleString()} followers</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                        <div className="bg-black dark:bg-white h-2 rounded-full" style={{ width: `${(stats.threadsFollowers / stats.totalFollowers) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm col-span-1">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Derniers 5 Posts</h3>
                            {recentPosts.length > 0 ? (
                                <div className="space-y-4">
                                    {recentPosts.map((post) => (
                                        <div key={post.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 ${
                                                    post.platform === 'Facebook' ? 'bg-blue-600' : 
                                                    post.platform === 'Instagram' ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600' : 
                                                    'bg-slate-900 dark:bg-slate-700'
                                                }`}>
                                                    {post.platform === 'Facebook' ? 'f' : post.platform === 'Instagram' ? 'ig' : '@'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-slate-900 dark:text-white truncate">{post.title || 'Untitled Post'}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{post.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-500">
                                    Aucun post récent.
                                </div>
                            )}
                        </div>

                        {/* Top 5 Posts */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm col-span-1">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-amber-500">🏆</span> Top 5 Posts
                            </h3>
                            {topPosts?.length > 0 ? (
                                <div className="space-y-4">
                                    {topPosts.map((post, index) => (
                                        <div key={post.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow bg-white dark:bg-slate-800/50">
                                            <div className="flex items-center gap-4">
                                                <div className="text-lg font-bold text-slate-300 dark:text-slate-600 w-4 text-center">
                                                    #{index + 1}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-slate-900 dark:text-white truncate">{post.title || 'Untitled Post'}</p>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                        <span className="flex items-center gap-1"><FiTrendingUp size={12}/> {post.engagement_score || 0} engagements</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className={`text-xs font-bold px-2 py-1 rounded-md ${
                                                    post.platform === 'Facebook' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 
                                                    post.platform === 'Instagram' ? 'text-pink-600 bg-pink-50 dark:bg-pink-900/20' : 
                                                    'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-700'
                                                }`}>
                                                    {post.platform}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-500">
                                    Aucune donnée d'engagement.
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
