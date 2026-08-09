import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const CHRONIC_DISEASES = [
    "Diabète",
    "Hypertension artérielle",
    "Asthme",
    "Maladie respiratoire chronique",
    "Problèmes articulaires (genoux, épaules, hanches)",
    "Douleurs chroniques du dos (lombalgie, cervicalgie)",
    "Problèmes cardiaques stabilisés",
    "Troubles digestifs chroniques",
    "Migraine chronique",
    "Épilepsie contrôlée",
    "Troubles hormonaux (ex. thyroïde)",
    "Anémie chronique",
    "Troubles de la vision corrigés",
    "Troubles auditifs corrigés",
    "Allergies chroniques (hors contagion)"
];

export default function DiseaseSelector({
    isDiseased = 'Non',
    onIsDiseasedChange,
    details = '',
    onDetailsChange,
    className = ''
}) {
    const parseInitialItems = (str) => {
        if (!str || !str.trim()) return [];
        return str.split(',').map(s => s.trim()).filter(Boolean);
    };

    const [selectedDiseases, setSelectedDiseases] = useState(() => parseInitialItems(details));
    
    const [isAutre, setIsAutre] = useState(() => {
        const parsed = parseInitialItems(details);
        return parsed.some(d => !CHRONIC_DISEASES.includes(d) && d !== 'Autre maladie chronique');
    });
    
    const [autreText, setAutreText] = useState(() => {
        const parsed = parseInitialItems(details);
        const autre = parsed.find(d => !CHRONIC_DISEASES.includes(d) && d !== 'Autre maladie chronique');
        return autre || '';
    });

    useEffect(() => {
        if (details) {
            const parsed = parseInitialItems(details);
            setSelectedDiseases(parsed);
            
            const autre = parsed.find(d => !CHRONIC_DISEASES.includes(d) && d !== 'Autre maladie chronique');
            if (autre) {
                setIsAutre(true);
                setAutreText(autre);
            }
        } else {
            setSelectedDiseases([]);
            setIsAutre(false);
            setAutreText('');
        }
    }, [details]);

    const updateParent = (items, isA, aText) => {
        let finalItems = items.filter(i => CHRONIC_DISEASES.includes(i));
        if (isA) {
            if (aText.trim()) {
                finalItems.push(aText.trim());
            } else {
                finalItems.push('Autre maladie chronique');
            }
        }
        
        onDetailsChange(finalItems.join(', '));
    };

    const handleSelectChange = (e) => {
        const val = e.target.value;
        if (!val) return;
        
        let newItems = [...selectedDiseases];
        let newIsAutre = isAutre;

        if (val === 'Autre maladie chronique') {
            newIsAutre = true;
        } else if (!newItems.includes(val)) {
            newItems.push(val);
        }

        setSelectedDiseases(newItems);
        setIsAutre(newIsAutre);
        updateParent(newItems, newIsAutre, autreText);
        
        e.target.value = "";
    };

    const removeDisease = (disease) => {
        const isA = !CHRONIC_DISEASES.includes(disease) && disease !== 'Autre maladie chronique';
        
        if (isA || disease === 'Autre maladie chronique') {
            setIsAutre(false);
            setAutreText('');
            const newItems = selectedDiseases.filter(d => d !== disease && d !== 'Autre maladie chronique');
            setSelectedDiseases(newItems);
            updateParent(newItems, false, '');
        } else {
            const newItems = selectedDiseases.filter(d => d !== disease);
            setSelectedDiseases(newItems);
            updateParent(newItems, isAutre, autreText);
        }
    };

    const handleAutreChange = (e) => {
        const text = e.target.value;
        setAutreText(text);
        updateParent(selectedDiseases, true, text);
    };

    const chipsToDisplay = [...selectedDiseases.filter(d => CHRONIC_DISEASES.includes(d))];
    if (isAutre) {
        chipsToDisplay.push(autreText.trim() || 'Autre maladie chronique');
    }

    return (
        <div className={cn("p-5 bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl border border-rose-200/50 dark:border-rose-800/30 self-start w-full", className)}>
            <div>
                <InputLabel value="Maladies chroniques ?" className="text-rose-900 dark:text-rose-400 mb-3 font-semibold" />
                <div className="flex gap-4">
                    {['Oui', 'Non'].map(opt => (
                        <div
                            key={opt}
                            onClick={() => {
                                onIsDiseasedChange(opt);
                                if (opt === 'Non') {
                                    onDetailsChange('');
                                    setSelectedDiseases([]);
                                    setIsAutre(false);
                                    setAutreText('');
                                }
                            }}
                            className={cn(
                                "flex-1 text-center py-2.5 rounded-xl border-2 cursor-pointer font-semibold transition-all",
                                isDiseased === opt
                                    ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-sm"
                                    : "border-gray-200 dark:border-gray-700 text-gray-500 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                            )}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {isDiseased === 'Oui' && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-3 pt-4 mt-2 border-t border-rose-200/40 dark:border-rose-800/40"
                    >
                        <InputLabel value="Sélectionnez les maladies" className="text-xs text-rose-700 dark:text-rose-400 font-bold uppercase tracking-wider" />
                        
                        <select
                            onChange={handleSelectChange}
                            className="w-full bg-white dark:bg-gray-900 rounded-xl border-rose-200/70 dark:border-rose-700/50 text-sm text-gray-700 dark:text-gray-300 transition-all focus:ring-rose-500/50 focus:border-rose-500"
                            defaultValue=""
                        >
                            <option value="" disabled>-- Ajouter une maladie --</option>
                            {CHRONIC_DISEASES.filter(d => !selectedDiseases.includes(d)).map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                            {!isAutre && <option value="Autre maladie chronique">Autre maladie chronique</option>}
                        </select>

                        {isAutre && (
                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                                <TextInput
                                    value={autreText}
                                    onChange={handleAutreChange}
                                    placeholder="Précisez la maladie chronique..."
                                    className="w-full text-sm bg-white dark:bg-gray-900 rounded-xl border-rose-200/70 dark:border-rose-700/50 focus:ring-rose-500/50 focus:border-rose-500"
                                    autoFocus
                                />
                            </motion.div>
                        )}

                        {chipsToDisplay.length > 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2 pt-2">
                                {chipsToDisplay.map((disease, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 rounded-lg text-xs font-semibold shadow-sm">
                                        <span>{disease}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeDisease(disease)}
                                            className="text-gray-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors bg-gray-50 dark:bg-gray-700 hover:bg-rose-100 dark:hover:bg-rose-900 rounded-full p-0.5"
                                        >
                                            <FiX size={12} />
                                        </button>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
