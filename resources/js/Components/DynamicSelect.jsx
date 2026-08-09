import React, { useState, useEffect } from 'react';
import TextInput from '@/Components/TextInput';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export default function DynamicSelect({ value = '', onChange, options = [], className = '', placeholder = 'Précisez (Autre)...' }) {
    const standardOptions = options.filter(r => r !== 'Autre');

    const isCustomInitial = value && (!standardOptions.includes(value) || value === 'Autre');
    const [isAutre, setIsAutre] = useState(Boolean(isCustomInitial));
    const [customText, setCustomText] = useState(
        value === 'Autre' ? '' : (!standardOptions.includes(value) ? value : '')
    );

    useEffect(() => {
        const isCustom = value && (!standardOptions.includes(value) || value === 'Autre');
        if (isCustom) {
            setIsAutre(true);
            if (value !== 'Autre' && !standardOptions.includes(value)) {
                setCustomText(value);
            }
        } else if (!value) {
            setIsAutre(false);
            setCustomText('');
        } else {
            setIsAutre(false);
            setCustomText('');
        }
    }, [value]);

    const handleSelectChange = (e) => {
        const selected = e.target.value;
        if (selected === 'Autre') {
            setIsAutre(true);
            onChange(customText.trim() ? customText : 'Autre');
        } else {
            setIsAutre(false);
            onChange(selected);
        }
    };

    const handleCustomChange = (e) => {
        const text = e.target.value;
        setCustomText(text);
        onChange(text.trim() ? text : 'Autre');
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <select
                value={isAutre ? 'Autre' : (value || '')}
                onChange={handleSelectChange}
                className={cn(
                    "bg-gray-50 dark:bg-gray-800 rounded-xl border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 transition-all",
                    isAutre ? "w-1/2" : "w-full"
                )}
            >
                <option value="">-- Sélectionnez --</option>
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>

            {isAutre && (
                <div className="w-1/2">
                    <TextInput
                        value={customText}
                        onChange={handleCustomChange}
                        placeholder={placeholder}
                        className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl"
                        autoFocus
                    />
                </div>
            )}
        </div>
    );
}
