import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { ANIMAL_ALLERGIES_TYPES } from '@/constants';
import { AnimatePresence, motion } from 'framer-motion';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export default function PetAllergiesSelector({
    isAllergic = 'Non',
    onIsAllergicChange,
    details = '',
    onDetailsChange,
    className = ''
}) {
    const parseInitialItems = (str) => {
        if (!str || !str.trim()) {
            return [{ type: '', custom: '' }];
        }
        const tokens = str.split(',').map(s => s.trim()).filter(Boolean);
        if (tokens.length === 0) {
            return [{ type: '', custom: '' }];
        }
        return tokens.map(token => {
            const standard = ANIMAL_ALLERGIES_TYPES.find(t => t.toLowerCase() === token.toLowerCase());
            if (standard && standard !== 'Autre') {
                return { type: standard, custom: '' };
            }
            return { type: 'Autre', custom: token === 'Autre' ? '' : token };
        });
    };

    const [items, setItems] = useState(() => parseInitialItems(details));
    const [count, setCount] = useState(() => Math.max(1, parseInitialItems(details).length));

    // Keep items synced if details prop changes externally
    useEffect(() => {
        if (details) {
            const parsed = parseInitialItems(details);
            setItems(parsed);
            setCount(parsed.length);
        }
    }, [details]);

    const updateParent = (newItems) => {
        const serialized = newItems
            .map(item => (item.type === 'Autre' ? (item.custom.trim() || 'Autre') : item.type))
            .filter(Boolean)
            .join(', ');
        onDetailsChange(serialized);
    };

    const handleCountChange = (e) => {
        const val = Math.max(1, Math.min(10, parseInt(e.target.value, 10) || 1));
        setCount(val);
        let newItems = [...items];
        if (val > newItems.length) {
            while (newItems.length < val) {
                newItems.push({ type: '', custom: '' });
            }
        } else if (val < newItems.length) {
            newItems = newItems.slice(0, val);
        }
        setItems(newItems);
        updateParent(newItems);
    };

    const handleTypeChange = (index, newType) => {
        const newItems = items.map((item, idx) => {
            if (idx === index) {
                return { ...item, type: newType, custom: newType === 'Autre' ? item.custom : '' };
            }
            return item;
        });
        setItems(newItems);
        updateParent(newItems);
    };

    const handleCustomChange = (index, customText) => {
        const newItems = items.map((item, idx) => {
            if (idx === index) {
                return { ...item, custom: customText };
            }
            return item;
        });
        setItems(newItems);
        updateParent(newItems);
    };

    return (
        <div className={cn("p-5 bg-orange-50/50 dark:bg-orange-900/10 rounded-2xl border border-orange-200/50 dark:border-orange-800/30 space-y-4 self-start", className)}>
            <div>
                <InputLabel value="Allergies aux animaux ?" className="text-orange-900 dark:text-orange-400 mb-3 font-semibold" />
                <div className="flex gap-4">
                    {['Oui', 'Non'].map(opt => (
                        <div
                            key={opt}
                            onClick={() => {
                                onIsAllergicChange(opt);
                                if (opt === 'Non') {
                                    onDetailsChange('');
                                } else if (!details && items.length > 0) {
                                    updateParent(items);
                                }
                            }}
                            className={cn(
                                "flex-1 text-center py-2.5 rounded-xl border-2 cursor-pointer font-semibold transition-all",
                                isAllergic === opt
                                    ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 shadow-sm"
                                    : "border-gray-200 dark:border-gray-700 text-gray-500 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                            )}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            </div>

            {/* Dynamic Allergies Details when 'Oui' is selected */}
            <AnimatePresence>
                {isAllergic === 'Oui' && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-4 pt-2 border-t border-orange-200/40 dark:border-orange-800/40"
                    >
                        {/* Number input */}
                        <div className="w-28">
                            <TextInput
                                type="number"
                                min="1"
                                max="10"
                                value={count}
                                onChange={handleCountChange}
                                className="w-full bg-white dark:bg-gray-900 rounded-xl font-bold text-center border-orange-200/70 dark:border-orange-700/50"
                            />
                        </div>

                        {/* Items list */}
                        <div className="space-y-4">
                            {items.map((item, idx) => (
                                <div key={idx} className="bg-white/80 dark:bg-gray-800/60 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30 space-y-2">
                                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                        Allergie/Phobie {idx + 1}
                                    </div>
                                    <div className="space-y-1">
                                        <InputLabel value="Type" className="text-xs text-gray-600 dark:text-gray-400 font-medium" />
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={item.type}
                                                onChange={e => handleTypeChange(idx, e.target.value)}
                                                className={cn(
                                                    "bg-gray-50 dark:bg-gray-900 rounded-xl border-gray-200/60 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 transition-all",
                                                    item.type === 'Autre' ? "w-1/2" : "w-full"
                                                )}
                                            >
                                                <option value="">-- choisissez --</option>
                                                {ANIMAL_ALLERGIES_TYPES.map(type => (
                                                    <option key={type} value={type}>
                                                        {type}
                                                    </option>
                                                ))}
                                            </select>

                                            {item.type === 'Autre' && (
                                                <div className="w-1/2">
                                                    <TextInput
                                                        value={item.custom}
                                                        onChange={e => handleCustomChange(idx, e.target.value)}
                                                        placeholder="Précisez..."
                                                        className="w-full text-sm bg-gray-50 dark:bg-gray-900 rounded-xl"
                                                        autoFocus
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
