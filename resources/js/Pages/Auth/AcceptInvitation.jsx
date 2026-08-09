import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { FiLock, FiCheckCircle, FiShield, FiUserCheck, FiEye, FiEyeOff } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function AcceptInvitation({ token, email, name }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('invitations.store', token));
    };

    const hasMinLength = data.password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(data.password);
    const hasNumber = /[0-9]/.test(data.password);
    const passwordsMatch = data.password && data.password === data.password_confirmation;

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col md:flex-row">
            <Head title="Activer votre compte - LavoieJob" />

            {/* Left side - Branding (Hidden on mobile) */}
            <div className="hidden md:flex md:w-1/2 bg-indigo-600 relative overflow-hidden flex-col justify-between p-12 lg:p-16">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -mr-40 -mt-40"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
                
                <div className="relative z-10">
                    <img src="/assets/lavoiejob.png" alt="LavoieJob" className="h-12 lg:h-16 w-auto brightness-0 invert object-contain" />
                </div>
                
                <div className="relative z-10 mb-20 text-white">
                    <h1 className="text-5xl lg:text-6xl font-black mb-8 leading-tight tracking-tight">Rejoignez<br/>l'équipe<br/>LavoieJob.</h1>
                    <p className="text-indigo-100 text-lg lg:text-xl max-w-md leading-relaxed font-medium">
                        Accédez à votre espace collaboratif et commencez à gérer vos projets et profils avec efficacité.
                    </p>
                </div>
                
                <div className="relative z-10 text-indigo-200 text-sm font-medium">
                    &copy; {new Date().getFullYear()} LavoieJob. Tous droits réservés.
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
                {/* Mobile logo */}
                <div className="absolute top-8 left-8 md:hidden">
                    <img src="/assets/lavoiejob.png" alt="LavoieJob" className="h-10 w-auto object-contain" />
                </div>

                <div className="w-full max-w-md mt-16 md:mt-0">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="mb-10">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 shadow-inner">
                                <FiUserCheck size={32} />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                                Bienvenue, {name} !
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400">
                                Votre compte a été préparé pour <span className="font-semibold text-indigo-600 dark:text-indigo-400">{email}</span>. Veuillez définir votre mot de passe pour l'activer.
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="password" value="Définir votre mot de passe *" className="text-gray-700 dark:text-gray-300 font-bold mb-2" />
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                        <FiLock size={18} />
                                    </div>
                                    <TextInput
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        className="pl-12 pr-12 w-full py-3 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 transition-colors rounded-xl"
                                        placeholder="••••••••••••"
                                        autoComplete="new-password"
                                        isFocused={true}
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    >
                                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password_confirmation" value="Confirmer le mot de passe *" className="text-gray-700 dark:text-gray-300 font-bold mb-2" />
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                        <FiLock size={18} />
                                    </div>
                                    <TextInput
                                        id="password_confirmation"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="pl-12 pr-12 w-full py-3 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 transition-colors rounded-xl"
                                        placeholder="••••••••••••"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                    />
                                </div>
                                <InputError message={errors.password_confirmation} className="mt-2" />
                            </div>

                            {/* Password Requirements */}
                            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl p-5 border border-indigo-100/50 dark:border-indigo-800/30 text-sm space-y-2 text-gray-600 dark:text-gray-400">
                                <div className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <FiShield className="text-indigo-500" /> Sécurité du mot de passe
                                </div>
                                <div className={`flex items-center gap-2.5 transition-colors ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}>
                                    <FiCheckCircle size={16} className={hasMinLength ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'} />
                                    Au moins 8 caractères
                                </div>
                                <div className={`flex items-center gap-2.5 transition-colors ${hasUpperCase ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}>
                                    <FiCheckCircle size={16} className={hasUpperCase ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'} />
                                    Au moins une lettre majuscule
                                </div>
                                <div className={`flex items-center gap-2.5 transition-colors ${hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}>
                                    <FiCheckCircle size={16} className={hasNumber ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'} />
                                    Au moins un chiffre
                                </div>
                                {data.password_confirmation && (
                                    <div className={`flex items-center gap-2.5 mt-3 pt-3 border-t border-indigo-100 dark:border-indigo-800/30 transition-colors ${passwordsMatch ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-500 font-medium'}`}>
                                        <FiCheckCircle size={16} className={passwordsMatch ? 'text-emerald-500' : 'text-rose-400'} />
                                        Les mots de passe correspondent
                                    </div>
                                )}
                            </div>

                            <div className="pt-4">
                                <PrimaryButton
                                    className="w-full justify-center py-4 text-base font-bold shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all rounded-xl"
                                    disabled={processing || !hasMinLength || !hasUpperCase || !hasNumber || !passwordsMatch}
                                >
                                    {processing ? 'Activation en cours...' : 'Activer mon compte & Accéder'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
