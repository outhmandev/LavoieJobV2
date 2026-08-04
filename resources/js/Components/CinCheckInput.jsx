import React, { useState, useEffect } from 'react';
import TextInput from '@/Components/TextInput';
import { FiCheck, FiCheckCircle, FiAlertCircle, FiLoader, FiExternalLink } from 'react-icons/fi';
import axios from 'axios';

export default function CinCheckInput({
    value,
    onChange,
    type = 'all', // 'client', 'profile', or 'all'
    excludeId = null,
    className = '',
    placeholder = 'Ex: AB123456',
    required = false,
    ...props
}) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    // Reset status when user changes the CIN input value
    useEffect(() => {
        setResult(null);
    }, [value]);

    const handleCheck = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const trimmed = (value || '').trim();
        if (!trimmed) {
            setResult({
                checked: true,
                exists: false,
                empty: true,
                message: 'Veuillez saisir un numéro de CIN pour vérifier.',
            });
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const response = await axios.get('/api/check-cin', {
                params: {
                    cin: trimmed,
                    type: type,
                    exclude_id: excludeId,
                }
            });

            setResult({
                checked: true,
                exists: response.data.exists,
                profile: response.data.profile,
                client: response.data.client,
                cin: response.data.cin,
            });
        } catch (error) {
            console.error('Erreur vérification CIN:', error);
            setResult({
                checked: true,
                exists: false,
                error: true,
                message: 'Erreur lors de la vérification du CIN.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-1.5 w-full">
            <div className="relative flex items-center">
                <TextInput
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className={`w-full pr-12 ${className}`}
                    {...props}
                />
                <button
                    type="button"
                    onClick={handleCheck}
                    disabled={loading}
                    title="Vérifier si le CIN existe déjà"
                    className="absolute right-1.5 p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/70 text-indigo-600 dark:text-indigo-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 flex items-center justify-center shadow-sm"
                >
                    {loading ? (
                        <FiLoader className="animate-spin text-indigo-600 dark:text-indigo-400" size={16} />
                    ) : (
                        <FiCheck size={16} className="font-bold stroke-[3]" />
                    )}
                </button>
            </div>

            {/* Check Feedback Status */}
            {result && result.checked && (
                <div className="text-xs transition-all duration-200">
                    {result.empty && (
                        <p className="text-amber-500 flex items-center gap-1.5">
                            <FiAlertCircle size={14} className="flex-shrink-0" />
                            <span>{result.message}</span>
                        </p>
                    )}

                    {result.error && (
                        <p className="text-rose-500 flex items-center gap-1.5">
                            <FiAlertCircle size={14} className="flex-shrink-0" />
                            <span>{result.message}</span>
                        </p>
                    )}

                    {!result.empty && !result.error && !result.exists && (
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-2 font-medium">
                            <FiCheckCircle size={15} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                            <span>Ce CIN <strong>{result.cin}</strong> est disponible (aucun doublon trouvé).</span>
                        </div>
                    )}

                    {!result.empty && !result.error && result.exists && (
                        <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-300">
                                <FiAlertCircle size={15} className="flex-shrink-0" />
                                <span>Attention : Ce CIN existe déjà dans la base !</span>
                            </div>
                            
                            {result.profile && (
                                <div className="flex items-center justify-between gap-2 pl-5 pt-0.5 text-xs">
                                    <span>
                                        <strong>{result.profile.type}</strong> : {result.profile.name} ({result.profile.status || 'N/A'})
                                    </span>
                                    <a
                                        href={result.profile.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex-shrink-0"
                                    >
                                        Voir <FiExternalLink size={12} />
                                    </a>
                                </div>
                            )}

                            {result.client && (
                                <div className="flex items-center justify-between gap-2 pl-5 pt-0.5 text-xs">
                                    <span>
                                        <strong>{result.client.type}</strong> : {result.client.name} ({result.client.status || 'N/A'})
                                    </span>
                                    <a
                                        href={result.client.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex-shrink-0"
                                    >
                                        Voir <FiExternalLink size={12} />
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
