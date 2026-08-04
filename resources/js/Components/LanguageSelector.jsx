import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const STANDARD_LANGUAGES = ['Arabe', 'Français', 'Anglais', 'Espagnol', 'Amazigh'];

export default function LanguageSelector({ value = '', onChange, className = '' }) {
    const parseLanguages = (val) => {
        const tokens = (val || '')
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);

        const standards = tokens.filter(t => STANDARD_LANGUAGES.includes(t));
        const others = tokens.filter(t => !STANDARD_LANGUAGES.includes(t));

        return {
            standards,
            othersText: others.join(', '),
            hasOther: others.length > 0 || tokens.includes('Autre'),
        };
    };

    const parsed = parseLanguages(value);
    const [isAutreOpen, setIsAutreOpen] = useState(parsed.hasOther);
    const [otherText, setOtherText] = useState(parsed.othersText === 'Autre' ? '' : parsed.othersText);

    useEffect(() => {
        const p = parseLanguages(value);
        if (p.hasOther) {
            setIsAutreOpen(true);
            setOtherText(p.othersText === 'Autre' ? '' : p.othersText);
        }
    }, [value]);

    const updateCombined = (standards, customText, autreOpen) => {
        const parts = [...standards];
        if (autreOpen && customText && customText.trim()) {
            parts.push(customText.trim());
        } else if (autreOpen && (!customText || !customText.trim())) {
            parts.push('Autre');
        }
        onChange(parts.join(', '));
    };

    const toggleStandard = (lang) => {
        const currentStandards = parsed.standards;
        let newStandards;
        if (currentStandards.includes(lang)) {
            newStandards = currentStandards.filter(l => l !== lang);
        } else {
            newStandards = [...currentStandards, lang];
        }
        updateCombined(newStandards, otherText, isAutreOpen);
    };

    const toggleAutre = () => {
        const nextState = !isAutreOpen;
        setIsAutreOpen(nextState);
        if (!nextState) {
            setOtherText('');
            updateCombined(parsed.standards, '', false);
        } else {
            updateCombined(parsed.standards, otherText, true);
        }
    };

    const handleOtherChange = (e) => {
        const text = e.target.value;
        setOtherText(text);
        updateCombined(parsed.standards, text, true);
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <div className="flex justify-between items-center">
                <InputLabel value="Langues parlées" className="text-gray-600 dark:text-gray-400" />
                {value && (
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {value}
                    </span>
                )}
            </div>

            {/* Language action buttons with inline Autre text input on the right */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
                {STANDARD_LANGUAGES.map((lang) => {
                    const isSelected = parsed.standards.includes(lang);
                    return (
                        <button
                            key={lang}
                            type="button"
                            onClick={() => toggleStandard(lang)}
                            className={cn(
                                "px-3.5 py-2 rounded-xl text-xs font-bold transition-all border",
                                isSelected
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/30"
                                    : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                            )}
                        >
                            {isSelected ? `✓ ${lang}` : `+ ${lang}`}
                        </button>
                    );
                })}

                {/* Autre Button */}
                <button
                    type="button"
                    onClick={toggleAutre}
                    className={cn(
                        "px-3.5 py-2 rounded-xl text-xs font-bold transition-all border",
                        isAutreOpen
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/30"
                            : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                >
                    {isAutreOpen ? `✓ Autre` : `+ Autre`}
                </button>

                {/* Free text input on the right */}
                {isAutreOpen && (
                    <div className="flex-1 min-w-[200px]">
                        <TextInput
                            value={otherText}
                            onChange={handleOtherChange}
                            placeholder="Précisez la/les autre(s) langue(s)..."
                            className="w-full text-xs py-2 bg-gray-50 dark:bg-gray-800 rounded-xl"
                            autoFocus
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
