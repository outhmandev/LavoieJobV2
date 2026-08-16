import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { FiCheckCircle, FiEdit2, FiSend } from 'react-icons/fi';

export default function Team({ posts }) {
    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Équipe Marketing</h2>}>
            <Head title="Équipe Marketing" />

            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Marketing Team Activity</h3>
                        <p className="text-sm text-slate-500 mt-1">Track content creation, approval, and publishing workflows.</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                            <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 rounded-tl-xl">Post Title</th>
                                    <th scope="col" className="px-6 py-4">Platform</th>
                                    <th scope="col" className="px-6 py-4">Status</th>
                                    <th scope="col" className="px-6 py-4">Created By</th>
                                    <th scope="col" className="px-6 py-4">Approved By</th>
                                    <th scope="col" className="px-6 py-4 rounded-tr-xl">Published By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.length > 0 ? posts.map((post) => (
                                    <tr key={post.id} className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                            {post.title || 'Untitled'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                                                post.platform === 'Facebook' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'
                                            }`}>
                                                {post.platform}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                                                post.status === 'Published' ? 'bg-emerald-100 text-emerald-700' :
                                                post.status === 'Scheduled' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'
                                            }`}>
                                                {post.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FiEdit2 className="text-slate-400" />
                                                {post.creator?.full_name || 'System'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {post.approver ? (
                                                    <><FiCheckCircle className="text-emerald-500" /> {post.approver.full_name}</>
                                                ) : (
                                                    <span className="text-slate-400 italic">Pending</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {post.publisher ? (
                                                    <><FiSend className="text-blue-500" /> {post.publisher.full_name}</>
                                                ) : (
                                                    <span className="text-slate-400 italic">Not Published</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                            No activity to display.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
