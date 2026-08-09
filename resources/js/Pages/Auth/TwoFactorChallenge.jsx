import React, { useState, useRef, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { FiShield, FiKey, FiLock, FiSmartphone, FiArrowRight } from 'react-icons/fi';

export default function TwoFactorChallenge() {
    const [useRecovery, setUseRecovery] = useState(false);
    const codeInputRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        recovery_code: '',
    });

    useEffect(() => {
        if (codeInputRef.current) {
            codeInputRef.current.focus();
        }
    }, [useRecovery]);

    const submit = (e) => {
        e.preventDefault();
        post(route('two-factor.challenge'), {
            onError: () => reset(),
        });
    };

    const toggleRecovery = () => {
        setUseRecovery(!useRecovery);
        reset();
    };

    return (
        <GuestLayout>
            <Head title="Authentification à deux facteurs" />

            <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 shadow-inner">
                    {useRecovery ? <FiKey size={26} /> : <FiSmartphone size={26} />}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {useRecovery ? 'Code de Récupération' : 'Authentification à Deux Facteurs'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                    {useRecovery
                        ? 'Veuillez saisir l\'un de vos codes de secours d\'urgence générés lors de la configuration.'
                        : 'Ouvrez votre application d\'authentification (Google Authenticator, Microsoft, etc.) et saisissez le code à 6 chiffres.'}
                </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                {!useRecovery ? (
                    <div>
                        <InputLabel htmlFor="code" value="Code de vérification (6 chiffres)" className="text-center text-gray-700 dark:text-gray-300 font-semibold" />
                        <div className="mt-2 flex justify-center">
                            <TextInput
                                id="code"
                                ref={codeInputRef}
                                type="text"
                                inputMode="numeric"
                                name="code"
                                value={data.code}
                                className="text-center text-2xl tracking-[0.3em] font-mono py-3 font-bold w-64 max-w-full"
                                placeholder="123456"
                                maxLength={6}
                                isFocused={true}
                                onChange={(e) => setData('code', e.target.value.replace(/[^0-9]/g, ''))}
                            />
                        </div>
                        <InputError message={errors.code} className="mt-2 text-center" />
                    </div>
                ) : (
                    <div>
                        <InputLabel htmlFor="recovery_code" value="Code de secours d'urgence" className="text-gray-700 dark:text-gray-300 font-semibold" />
                        <div className="relative mt-2">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                <FiKey size={16} />
                            </div>
                            <TextInput
                                id="recovery_code"
                                ref={codeInputRef}
                                type="text"
                                name="recovery_code"
                                value={data.recovery_code}
                                className="pl-10 font-mono w-full uppercase tracking-wider"
                                placeholder="ABCDE-FGHIJ"
                                isFocused={true}
                                onChange={(e) => setData('recovery_code', e.target.value)}
                            />
                        </div>
                        <InputError message={errors.recovery_code || errors.code} className="mt-2" />
                    </div>
                )}

                <div className="pt-2">
                    <PrimaryButton
                        className="w-full justify-center py-3 text-base shadow-lg shadow-indigo-500/20"
                        disabled={processing || (!useRecovery && data.code.length < 6) || (useRecovery && !data.recovery_code.trim())}
                    >
                        <span className="flex items-center gap-2">
                            {processing ? 'Vérification...' : 'Valider & Se connecter'}
                            <FiArrowRight size={16} />
                        </span>
                    </PrimaryButton>
                </div>

                <div className="text-center pt-2">
                    <button
                        type="button"
                        onClick={toggleRecovery}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                    >
                        {useRecovery
                            ? '← Utiliser le code de l\'application d\'authentification'
                            : 'Problème avec votre appareil ? Utiliser un code de récupération'}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
