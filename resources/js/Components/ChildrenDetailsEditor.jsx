import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiUser, FiCalendar, FiMessageSquare } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export default function ChildrenDetailsEditor({
    count = 0,
    onCountChange,
    details = '',
    onDetailsChange,
    className = '',
    colorScheme = 'indigo', // 'indigo' | 'emerald' | 'purple'
    label = "Nombre d'enfants"
}) {
    // Parse initial details from string/JSON/array
    const parseDetails = (rawDetails, currentCount) => {
        const numCount = parseInt(currentCount, 10) || 0;
        if (numCount <= 0) return [];

        let parsedItems = [];
        if (Array.isArray(rawDetails)) {
            parsedItems = rawDetails;
        } else if (typeof rawDetails === 'string' && rawDetails.trim().startsWith('[')) {
            try {
                parsedItems = JSON.parse(rawDetails);
            } catch (e) {
                parsedItems = [];
            }
        } else if (typeof rawDetails === 'string' && rawDetails.trim()) {
            // Legacy plain text note
            parsedItems = [{ gender: '', age: '', comment: rawDetails }];
        }

        const items = [];
        for (let i = 0; i < numCount; i++) {
            items.push({
                gender: parsedItems[i]?.gender || '',
                age: parsedItems[i]?.age || '',
                comment: parsedItems[i]?.comment || ''
            });
        }
        return items;
    };

    const [items, setItems] = useState(() => parseDetails(details, count));

    // Sync items when external count or details change
    useEffect(() => {
        const numCount = parseInt(count, 10) || 0;
        setItems(prevItems => {
            if (prevItems.length === numCount) return prevItems;
            return parseDetails(details, numCount);
        });
    }, [count]);

    const syncParent = (newItems, newCount) => {
        setItems(newItems);
        if (onCountChange) {
            onCountChange(newCount);
        }
        if (onDetailsChange) {
            if (newCount === 0 || newItems.length === 0) {
                onDetailsChange('');
            } else {
                onDetailsChange(JSON.stringify(newItems));
            }
        }
    };

    const handleCountInputChange = (e) => {
        const rawVal = e.target.value;
        const val = rawVal === '' ? 0 : Math.max(0, parseInt(rawVal, 10) || 0);
        const newItems = [];
        for (let i = 0; i < val; i++) {
            newItems.push(items[i] || { gender: '', age: '', comment: '' });
        }
        syncParent(newItems, val);
    };

    const handleAddChild = () => {
        const newCount = items.length + 1;
        const newItems = [...items, { gender: '', age: '', comment: '' }];
        syncParent(newItems, newCount);
    };

    const handleRemoveChild = (index) => {
        const newItems = items.filter((_, idx) => idx !== index);
        syncParent(newItems, newItems.length);
    };

    const handleChildFieldChange = (index, field, value) => {
        const newItems = items.map((item, idx) => {
            if (idx === index) {
                return { ...item, [field]: value };
            }
            return item;
        });
        syncParent(newItems, newItems.length);
    };

    // Color classes
    const isEmerald = colorScheme === 'emerald';
    const activeBadgeClasses = isEmerald
        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/30"
        : "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/30";
    const accentBtnClasses = isEmerald
        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        : "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400";

    const currentCount = parseInt(count, 10) || 0;

    return (
        <div className={cn("space-y-4 col-span-1 md:col-span-2", className)}>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                    <InputLabel value={label} className="text-gray-600 dark:text-gray-400 font-semibold" />
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleAddChild}
                            className={cn(
                                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm hover:scale-105",
                                isEmerald
                                    ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                                    : "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100"
                            )}
                        >
                            <FiPlus size={15} /> Ajouter un enfant
                        </button>
                    </div>
                </div>

                {currentCount > 0 && (
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
                        {currentCount} enfant{currentCount > 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {/* Dynamic Children Cards */}
            <AnimatePresence>
                {currentCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 overflow-hidden pt-2"
                    >
                        {items.map((child, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-4 bg-gray-50/80 dark:bg-gray-800/60 rounded-2xl border border-gray-200/70 dark:border-gray-700/60 space-y-3 relative group"
                            >
                                <div className="flex items-center justify-between border-b border-gray-200/50 dark:border-gray-700/50 pb-2">
                                    <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                        <FiUser className={isEmerald ? "text-emerald-500" : "text-indigo-500"} />
                                        Enfant #{index + 1}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveChild(index)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Supprimer cet enfant"
                                    >
                                        <FiTrash2 size={15} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
                                    {/* Sexe Selector */}
                                    <div className="space-y-1">
                                        <InputLabel value="Sexe *" className="text-xs text-gray-600 dark:text-gray-400" />
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {['Garçon', 'Fille'].map(g => (
                                                <button
                                                    key={g}
                                                    type="button"
                                                    onClick={() => handleChildFieldChange(index, 'gender', g)}
                                                    className={cn(
                                                        "py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center flex items-center justify-center gap-1",
                                                        child.gender === g
                                                            ? activeBadgeClasses
                                                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    )}
                                                >
                                                    {g === 'Garçon' ? '👦 Garçon' : '👧 Fille'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Âge Input */}
                                    <div className="space-y-1">
                                        <InputLabel value="Âge *" className="text-xs text-gray-600 dark:text-gray-400" />
                                        <TextInput
                                            type="text"
                                            value={child.age || ''}
                                            onChange={(e) => handleChildFieldChange(index, 'age', e.target.value)}
                                            placeholder="Ex: 5 ans"
                                            className="w-full bg-white dark:bg-gray-800 text-xs rounded-xl py-2"
                                        />
                                    </div>

                                    {/* Commentaire / Remarques */}
                                    <div className="space-y-1">
                                        <InputLabel value="Commentaire" className="text-xs text-gray-600 dark:text-gray-400" />
                                        <TextInput
                                            type="text"
                                            value={child.comment || ''}
                                            onChange={(e) => handleChildFieldChange(index, 'comment', e.target.value)}
                                            placeholder="Remarques, scolarité, etc."
                                            className="w-full bg-white dark:bg-gray-800 text-xs rounded-xl py-2"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
