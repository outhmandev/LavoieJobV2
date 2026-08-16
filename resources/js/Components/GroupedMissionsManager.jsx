import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiCheck } from 'react-icons/fi';
import TextInput from '@/Components/TextInput';

export default function GroupedMissionsManager({ 
    groupedMissions = {}, 
    selectedMissions = [], 
    onChange,
    allowAdd = false
}) {
    const [customGroup, setCustomGroup] = useState('');
    const [customMission, setCustomMission] = useState('');
    const [customAddedMissions, setCustomAddedMissions] = useState({});

    const handleToggle = (missionName) => {
        if (selectedMissions.includes(missionName)) {
            onChange(selectedMissions.filter(m => m !== missionName));
        } else {
            onChange([...selectedMissions, missionName]);
        }
    };

    const handleAddCustom = (e) => {
        e.preventDefault();
        if (!customGroup.trim() || !customMission.trim()) return;

        const group = customGroup.trim();
        const mission = customMission.trim();

        setCustomAddedMissions(prev => {
            const newGroup = prev[group] ? [...prev[group]] : [];
            if (!newGroup.includes(mission)) {
                newGroup.push(mission);
            }
            return { ...prev, [group]: newGroup };
        });

        if (!selectedMissions.includes(mission)) {
            onChange([...selectedMissions, mission]);
        }

        setCustomMission('');
    };

    // Filter out standard missions to find custom ones
    const allStandardMissions = Object.values(groupedMissions).flat();
    const customSelectedMissions = selectedMissions.filter(m => !allStandardMissions.includes(m));

    const [isAutreOpen, setIsAutreOpen] = useState(false);
    const [customText, setCustomText] = useState('');

    const handleAddCustomText = () => {
        if (customText.trim() && !selectedMissions.includes(customText.trim())) {
            onChange([...selectedMissions, customText.trim()]);
            setCustomText('');
            setIsAutreOpen(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(groupedMissions).filter(([group]) => group !== 'Autres tâches').map(([group, missions]) => (
                    <div key={group} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">{group}</h4>
                        <div className="flex flex-col gap-2">
                            {missions.map(mission => {
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
                        </div>
                    </div>
                ))}

                {/* Autres tâches group */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-2">
                        <span>📝</span> Autres tâches
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

                        <div 
                            onClick={() => setIsAutreOpen(!isAutreOpen)}
                            className={`flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                                isAutreOpen 
                                    ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' 
                                    : 'bg-gray-50 border-gray-100 hover:border-gray-300 dark:bg-gray-800/50 dark:border-gray-700 dark:hover:border-gray-600'
                            }`}
                        >
                            <span className={`text-sm font-medium ${isAutreOpen ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                Autre tâche
                            </span>
                            {isAutreOpen && <FiCheck className="text-indigo-600 dark:text-indigo-400" />}
                        </div>

                        {isAutreOpen && (
                            <div className="flex gap-2 mt-2">
                                <TextInput 
                                    value={customText} 
                                    onChange={e => setCustomText(e.target.value)} 
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCustomText())}
                                    placeholder="Précisez la tâche..."
                                    className="flex-1"
                                />
                                <button 
                                    type="button"
                                    onClick={handleAddCustomText}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Ajouter
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {Object.keys(groupedMissions).length === 0 && customSelectedMissions.length === 0 && !isAutreOpen && (
                <div className="text-center p-6 text-gray-500 italic bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    Aucune mission disponible.
                </div>
            )}
        </div>
    );
}
