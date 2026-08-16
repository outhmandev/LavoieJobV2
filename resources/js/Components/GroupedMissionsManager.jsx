import React, { useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import TextInput from '@/Components/TextInput';

export default function GroupedMissionsManager({ 
    groupedMissions = {}, 
    selectedMissions = [], 
    onChange,
    allowAdd = true
}) {
    // Track which group has its "Autre" input open
    const [openAutreGroups, setOpenAutreGroups] = useState({});
    // Track text input for each group
    const [customTexts, setCustomTexts] = useState({});
    // Track locally added custom missions so they stay in their respective group visually before a reload
    const [localCustomMissions, setLocalCustomMissions] = useState({});

    const handleToggle = (missionName) => {
        if (selectedMissions.includes(missionName)) {
            onChange(selectedMissions.filter(m => m !== missionName));
        } else {
            onChange([...selectedMissions, missionName]);
        }
    };

    const toggleAutre = (group) => {
        setOpenAutreGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    const handleCustomTextChange = (group, text) => {
        setCustomTexts(prev => ({ ...prev, [group]: text }));
    };

    const handleAddCustomText = (group) => {
        const text = (customTexts[group] || '').trim();
        if (text && !selectedMissions.includes(text)) {
            onChange([...selectedMissions, text]);
            
            // Add to local state so it renders in this group
            setLocalCustomMissions(prev => ({
                ...prev,
                [group]: [...(prev[group] || []), text]
            }));

            // Clear input and close
            setCustomTexts(prev => ({ ...prev, [group]: '' }));
            setOpenAutreGroups(prev => ({ ...prev, [group]: false }));
        }
    };

    // Filter out standard missions and our locally tracked ones to find truly unmapped custom ones
    const allStandardMissions = Object.values(groupedMissions).flat();
    const allLocalCustomMissions = Object.values(localCustomMissions).flat();
    const knownMissions = [...allStandardMissions, ...allLocalCustomMissions];
    const customSelectedMissions = selectedMissions.filter(m => !knownMissions.includes(m));

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(groupedMissions).filter(([group]) => group !== 'Autres tâches').map(([group, standardMissions]) => {
                    // Combine standard missions with locally added ones for this group
                    const groupMissions = [...standardMissions, ...(localCustomMissions[group] || [])];
                    const isAutreOpen = openAutreGroups[group];
                    
                    return (
                        <div key={group} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
                            <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">{group}</h4>
                            <div className="flex flex-col gap-2 flex-grow">
                                {groupMissions.map(mission => {
                                    const isSelected = selectedMissions.includes(mission);
                                    return (
                                        <div 
                                            key={mission} 
                                            onClick={() => handleToggle(mission)}
                                            className={`flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                                                isSelected 
                                                    ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' 
                                                    : 'bg-gray-50 border-gray-100 hover:border-gray-300 dark:bg-gray-800/50 dark:border-gray-700 dark:hover:border-gray-600'
                                            }`}
                                        >
                                            <span className={`text-sm font-medium ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                                {mission}
                                            </span>
                                            {isSelected && <FiCheck className="text-indigo-600 dark:text-indigo-400" />}
                                        </div>
                                    );
                                })}

                                {/* Autre Button for this specific group */}
                                <div 
                                    onClick={() => toggleAutre(group)}
                                    className={`flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition-colors mt-auto ${
                                        isAutreOpen 
                                            ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' 
                                            : 'bg-gray-50 border-gray-100 hover:border-gray-300 dark:bg-gray-800/50 dark:border-gray-700 dark:hover:border-gray-600'
                                    }`}
                                >
                                    <span className={`text-sm font-medium ${isAutreOpen ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                        Autre option...
                                    </span>
                                    {isAutreOpen && <FiCheck className="text-indigo-600 dark:text-indigo-400" />}
                                </div>

                                {isAutreOpen && (
                                    <div className="flex gap-2 mt-2">
                                        <TextInput 
                                            value={customTexts[group] || ''} 
                                            onChange={e => handleCustomTextChange(group, e.target.value)} 
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCustomText(group))}
                                            placeholder="Précisez..."
                                            className="flex-1"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => handleAddCustomText(group)}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                        >
                                            Ajouter
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Legacy/Unmapped Custom Missions Group */}
                {customSelectedMissions.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-2">
                            <span>📝</span> Autres
                        </h4>
                        <div className="flex flex-col gap-2">
                            {customSelectedMissions.map(mission => (
                                <div 
                                    key={mission} 
                                    onClick={() => handleToggle(mission)}
                                    className="flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition-colors bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800"
                                >
                                    <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                                        {mission}
                                    </span>
                                    <FiCheck className="text-indigo-600 dark:text-indigo-400" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            {Object.keys(groupedMissions).length === 0 && customSelectedMissions.length === 0 && (
                <div className="text-center p-6 text-gray-500 italic bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    Aucune mission disponible.
                </div>
            )}
        </div>
    );
}
