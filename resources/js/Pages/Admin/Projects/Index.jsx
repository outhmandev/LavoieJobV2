import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { FiPlus, FiTrash2, FiSettings, FiBriefcase, FiCheckCircle } from 'react-icons/fi';

export default function Index({ projects }) {
    const [selectedProject, setSelectedProject] = useState(projects[0] || null);

    const { data: projectData, setData: setProjectData, post: postProject, reset: resetProject, processing: processingProject } = useForm({
        name: '',
        status: 'active'
    });

    const { data: jobData, setData: setJobData, post: postJob, reset: resetJob, processing: processingJob } = useForm({
        name: ''
    });

    const { data: missionData, setData: setMissionData, post: postMission, reset: resetMission, processing: processingMission } = useForm({
        group_name: '',
        name: ''
    });

    const createProject = (e) => {
        e.preventDefault();
        postProject(route('admin.projects.store'), {
            onSuccess: () => {
                resetProject();
                // Reload data to get the new project in the list and select it
                router.reload({ only: ['projects'] });
            }
        });
    };

    const addJob = (e) => {
        e.preventDefault();
        if (!selectedProject) return;
        postJob(route('admin.projects.jobs.store', selectedProject.id), {
            onSuccess: () => {
                resetJob();
                router.reload({ only: ['projects'] });
            }
        });
    };

    const deleteJob = (jobId) => {
        router.delete(route('admin.projects.jobs.destroy', [selectedProject.id, jobId]), {
            onSuccess: () => router.reload({ only: ['projects'] })
        });
    };

    const addMission = (e) => {
        e.preventDefault();
        if (!selectedProject) return;
        postMission(route('admin.projects.missions.store', selectedProject.id), {
            onSuccess: () => {
                resetMission();
                router.reload({ only: ['projects'] });
            }
        });
    };

    const deleteMission = (missionId) => {
        router.delete(route('admin.projects.missions.destroy', [selectedProject.id, missionId]), {
            onSuccess: () => router.reload({ only: ['projects'] })
        });
    };

    // Update selected project when projects prop changes (e.g. after adding a job)
    React.useEffect(() => {
        if (selectedProject) {
            const updated = projects.find(p => p.id === selectedProject.id);
            if (updated) setSelectedProject(updated);
        } else if (projects.length > 0) {
            setSelectedProject(projects[0]);
        }
    }, [projects]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                        <FiSettings className="text-indigo-500" />
                        System Administrator: Projects & Configuration
                    </h2>
                    <div className="hidden md:flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-full">
                        <FiCheckCircle size={16} /> Admin Privileges Active
                    </div>
                </div>
            }
        >
            <Head title="Admin - Projects Config" />

            <div className="max-w-7xl mx-auto pb-12 flex flex-col md:flex-row gap-8">
                
                {/* Left Sidebar: Projects List */}
                <div className="w-full md:w-1/3 flex flex-col gap-6">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Create New Project</h3>
                        <form onSubmit={createProject} className="flex flex-col gap-4">
                            <div>
                                <InputLabel value="Project Name" />
                                <TextInput value={projectData.name} onChange={e => setProjectData('name', e.target.value)} className="w-full mt-1" required />
                            </div>
                            <button disabled={processingProject} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl font-bold transition-all">
                                + Create Project
                            </button>
                        </form>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <h3 className="font-bold text-gray-900 dark:text-white">Existing Projects</h3>
                        </div>
                        <div className="flex flex-col">
                            {projects.map(project => (
                                <button
                                    key={project.id}
                                    onClick={() => setSelectedProject(project)}
                                    className={`text-left px-6 py-4 border-b border-gray-50 dark:border-gray-800/50 transition-colors ${selectedProject?.id === project.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-l-indigo-500' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-4 border-l-transparent'}`}
                                >
                                    <div className="font-bold text-gray-900 dark:text-white">{project.name}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {project.jobs?.length || 0} Types de personnel • {project.missions?.length || 0} Missions
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Project Details (Jobs & Missions) */}
                <div className="w-full md:w-2/3">
                    {selectedProject ? (
                        <div className="flex flex-col gap-6">
                            
                            {/* Jobs Card */}
                            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <FiBriefcase className="text-amber-500" />
                                        Type de personnel ({selectedProject.name})
                                    </h3>
                                </div>
                                <div className="p-6 bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800">
                                    <form onSubmit={addJob} className="flex gap-4">
                                        <TextInput placeholder="ex: Auxiliaire de vie" value={jobData.name} onChange={e => setJobData('name', e.target.value)} className="flex-1" required />
                                        <button disabled={processingJob} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2">
                                            <FiPlus /> Add
                                        </button>
                                    </form>
                                </div>
                                <div className="p-6">
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProject.jobs?.map(job => (
                                            <div key={job.id} className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {job.name}
                                                <button onClick={() => deleteJob(job.id)} className="text-red-400 hover:text-red-600"><FiTrash2 size={14}/></button>
                                            </div>
                                        ))}
                                        {(!selectedProject.jobs || selectedProject.jobs.length === 0) && (
                                            <div className="text-sm text-gray-500 italic">Aucun type de personnel configuré.</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Missions Card */}
                            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <FiCheckCircle className="text-emerald-500" />
                                        Fonctions & Missions ({selectedProject.name})
                                    </h3>
                                </div>
                                <div className="p-6 bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800">
                                    <form onSubmit={addMission} className="flex flex-col md:flex-row gap-4">
                                        <TextInput placeholder="Groupe (ex: 1️⃣ Soins de base)" value={missionData.group_name} onChange={e => setMissionData('group_name', e.target.value)} className="w-full md:w-1/3" />
                                        <TextInput placeholder="Mission (ex: Aide à la toilette)" value={missionData.name} onChange={e => setMissionData('name', e.target.value)} className="w-full md:w-auto flex-1" required />
                                        <button disabled={processingMission} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                                            <FiPlus /> Add
                                        </button>
                                    </form>
                                </div>
                                <div className="p-6 flex flex-col gap-6">
                                    {/* Group missions by group_name */}
                                    {Object.entries(
                                        (selectedProject.missions || []).reduce((acc, mission) => {
                                            const group = mission.group_name || 'Autre';
                                            if (!acc[group]) acc[group] = [];
                                            acc[group].push(mission);
                                            return acc;
                                        }, {})
                                    ).map(([groupName, missions]) => (
                                        <div key={groupName}>
                                            <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-3">{groupName}</h4>
                                            <div className="flex flex-col gap-2">
                                                {missions.map(mission => (
                                                    <div key={mission.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-100 dark:border-gray-800">
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">{mission.name}</span>
                                                        <button onClick={() => deleteMission(mission.id)} className="text-red-400 hover:text-red-600 p-1"><FiTrash2 size={16}/></button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {(!selectedProject.missions || selectedProject.missions.length === 0) && (
                                        <div className="text-sm text-gray-500 italic">Aucune mission configurée.</div>
                                    )}
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-800 text-gray-500">
                            Select a project from the left to configure its jobs and missions.
                        </div>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
