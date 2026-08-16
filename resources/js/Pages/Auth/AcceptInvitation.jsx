import React, { useState, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { FiLock, FiCheckCircle, FiShield, FiUserCheck, FiEye, FiEyeOff, FiUpload, FiUser, FiPhone, FiMapPin, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import ImageCropper from '@/Components/ImageCropper';

export default function AcceptInvitation({ token, email, name }) {
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null);
    
    const { data, setData, post, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
        phone_1: '',
        phone_2: '',
        city: '',
        department: '',
        avatar: null,
    });

    const submit = (e) => {
        e.preventDefault();
        if (step === 1) {
            setStep(2);
        } else {
            post(route('invitations.store', token));
        }
    };

    const hasMinLength = data.password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(data.password);
    const hasNumber = /[0-9]/.test(data.password);
    const passwordsMatch = data.password && data.password === data.password_confirmation;
    
    const canProceedToStep2 = hasMinLength && hasUpperCase && hasNumber && passwordsMatch;

    const [cropperOpen, setCropperOpen] = useState(false);
    const [cropperImageSrc, setCropperImageSrc] = useState(null);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.addEventListener('load', () => setCropperImageSrc(reader.result?.toString() || ''));
            reader.readAsDataURL(file);
            setCropperOpen(true);
            e.target.value = null;
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row">
            <Head title="Activer votre compte - LavoieJob" />

            {/* Left side - Branding (Hidden on mobile) */}
            <div className="hidden md:flex md:w-5/12 bg-indigo-600 relative overflow-hidden flex-col justify-between p-12 lg:p-16">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -mr-40 -mt-40"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
                
                <div className="relative z-10">
                    <img src="/assets/lavoiejob.png" alt="LavoieJob" className="h-12 lg:h-14 w-auto brightness-0 invert object-contain" />
                </div>
                
                <div className="relative z-10 mb-20 text-white">
                    <h1 className="text-4xl lg:text-5xl font-black mb-8 leading-tight tracking-tight">Configuration<br/>de votre profil.</h1>
                    <p className="text-indigo-100 text-lg max-w-md leading-relaxed font-medium">
                        Finalisez la configuration de votre compte pour rejoindre l'équipe LavoieJob et accéder à votre espace de travail collaboratif.
                    </p>
                    
                    {/* Stepper Indicator */}
                    <div className="mt-12 space-y-4">
                        <div className={`flex items-center gap-4 transition-opacity ${step === 1 ? 'opacity-100' : 'opacity-50'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step === 1 ? 'bg-white text-indigo-600' : 'bg-indigo-500 text-white'}`}>1</div>
                            <div className="font-semibold text-lg">Sécurité du compte</div>
                        </div>
                        <div className="w-0.5 h-6 bg-indigo-500 ml-5"></div>
                        <div className={`flex items-center gap-4 transition-opacity ${step === 2 ? 'opacity-100' : 'opacity-50'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step === 2 ? 'bg-white text-indigo-600' : 'bg-indigo-500 text-white'}`}>2</div>
                            <div className="font-semibold text-lg">Profil Personnel</div>
                        </div>
                    </div>
                </div>
                
                <div className="relative z-10 text-indigo-200 text-sm font-medium">
                    &copy; {new Date().getFullYear()} LavoieJob. Tous droits réservés.
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative overflow-y-auto">
                {/* Mobile logo */}
                <div className="absolute top-8 left-8 md:hidden">
                    <img src="/assets/lavoiejob.png" alt="LavoieJob" className="h-10 w-auto object-contain" />
                </div>

                <div className="w-full max-w-md mt-16 md:mt-0">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="mb-10">
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 shadow-inner">
                                        <FiShield size={32} />
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                                        Sécurité du compte
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Bienvenue <strong>{name}</strong> ! Définissez un mot de passe sécurisé pour votre compte associé à <span className="font-semibold text-indigo-600 dark:text-indigo-400">{email}</span>.
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
                                                className="pl-12 pr-12 w-full py-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 transition-colors rounded-xl shadow-sm"
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
                                                className="pl-12 pr-12 w-full py-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 transition-colors rounded-xl shadow-sm"
                                                placeholder="••••••••••••"
                                                autoComplete="new-password"
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                            />
                                        </div>
                                        <InputError message={errors.password_confirmation} className="mt-2" />
                                    </div>

                                    {/* Password Requirements */}
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/50 shadow-sm text-sm space-y-2 text-gray-600 dark:text-gray-400">
                                        <div className="font-bold text-gray-900 dark:text-white mb-3">Critères de sécurité</div>
                                        <div className={`flex items-center gap-2.5 transition-colors ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}>
                                            <FiCheckCircle size={16} className={hasMinLength ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'} />
                                            Au moins 8 caractères
                                        </div>
                                        <div className={`flex items-center gap-2.5 transition-colors ${hasUpperCase ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}>
                                            <FiCheckCircle size={16} className={hasUpperCase ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'} />
                                            Au moins une majuscule
                                        </div>
                                        <div className={`flex items-center gap-2.5 transition-colors ${hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}>
                                            <FiCheckCircle size={16} className={hasNumber ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'} />
                                            Au moins un chiffre
                                        </div>
                                        {data.password_confirmation && (
                                            <div className={`flex items-center gap-2.5 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 transition-colors ${passwordsMatch ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-500 font-medium'}`}>
                                                <FiCheckCircle size={16} className={passwordsMatch ? 'text-emerald-500' : 'text-rose-400'} />
                                                Les mots de passe correspondent
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 text-base font-bold shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all rounded-xl"
                                            disabled={!canProceedToStep2}
                                        >
                                            Étape Suivante <FiChevronRight />
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="mb-10">
                                    <button 
                                        onClick={() => setStep(1)} 
                                        className="mb-6 flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
                                    >
                                        <FiChevronLeft size={16} /> Retour
                                    </button>
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 shadow-inner">
                                        <FiUser size={32} />
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                                        Profil Personnel
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Ajoutez une photo et complétez vos coordonnées pour permettre à l'équipe de mieux vous connaître.
                                    </p>
                                </div>

                                <form onSubmit={submit} className="space-y-6">
                                    
                                    {/* Avatar Upload */}
                                    <div className="flex flex-col items-center mb-8">
                                        <div 
                                            onClick={triggerFileInput}
                                            className="relative w-32 h-32 rounded-full bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors group overflow-hidden shadow-sm"
                                        >
                                            {avatarPreview ? (
                                                <img src={avatarPreview} alt="Aperçu" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center p-4">
                                                    <FiUpload className="mx-auto text-gray-400 group-hover:text-indigo-500 mb-2 transition-colors" size={28} />
                                                    <span className="text-xs font-semibold text-gray-500 group-hover:text-indigo-500 transition-colors">Ajouter photo</span>
                                                </div>
                                            )}
                                            
                                            {/* Overlay on hover if image exists */}
                                            {avatarPreview && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <FiUpload className="text-white" size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            accept="image/*" 
                                            onChange={handleAvatarChange}
                                        />
                                        <InputError message={errors.avatar} className="mt-2 text-center" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="phone_1" value="Téléphone Principal (Requis)" className="text-gray-700 dark:text-gray-300 font-bold mb-2" />
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                                <FiPhone size={18} />
                                            </div>
                                            <TextInput
                                                id="phone_1"
                                                type="tel"
                                                name="phone_1"
                                                value={data.phone_1}
                                                className="pl-12 w-full py-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 transition-colors rounded-xl shadow-sm"
                                                placeholder="+212 6 XX XX XX XX"
                                                onChange={(e) => setData('phone_1', e.target.value)}
                                            />
                                        </div>
                                        <InputError message={errors.phone_1} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="phone_2" value="Téléphone Secondaire (Optionnel)" className="text-gray-700 dark:text-gray-300 font-bold mb-2" />
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                                <FiPhone size={18} />
                                            </div>
                                            <TextInput
                                                id="phone_2"
                                                type="tel"
                                                name="phone_2"
                                                value={data.phone_2}
                                                className="pl-12 w-full py-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 transition-colors rounded-xl shadow-sm"
                                                placeholder="+212 6 XX XX XX XX"
                                                onChange={(e) => setData('phone_2', e.target.value)}
                                            />
                                        </div>
                                        <InputError message={errors.phone_2} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="department" value="Département (Rôle Secondaire)" className="text-gray-700 dark:text-gray-300 font-bold mb-2" />
                                        <select
                                            id="department"
                                            name="department"
                                            value={data.department}
                                            onChange={(e) => setData('department', e.target.value)}
                                            className="w-full py-3 px-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 transition-colors rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="">-- Sélectionnez un département --</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="RH">Ressources Humaines (RH)</option>
                                            <option value="Gestion">Gestion</option>
                                        </select>
                                        <InputError message={errors.department} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="city" value="Ville" className="text-gray-700 dark:text-gray-300 font-bold mb-2" />
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                                <FiMapPin size={18} />
                                            </div>
                                            <TextInput
                                                id="city"
                                                type="text"
                                                name="city"
                                                value={data.city}
                                                className="pl-12 w-full py-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 transition-colors rounded-xl shadow-sm"
                                                placeholder="Ex: Casablanca, Rabat..."
                                                onChange={(e) => setData('city', e.target.value)}
                                            />
                                        </div>
                                        <InputError message={errors.city} className="mt-2" />
                                    </div>

                                    <div className="pt-8">
                                        <PrimaryButton
                                            className="w-full justify-center py-4 text-base font-bold shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all rounded-xl"
                                            disabled={processing}
                                        >
                                            {processing ? 'Activation en cours...' : 'Activer mon compte & Accéder'}
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            
            {cropperOpen && cropperImageSrc && (
                <ImageCropper 
                    imageSrc={cropperImageSrc} 
                    onCropComplete={(blob) => {
                        const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
                        setData('avatar', file);
                        setAvatarPreview(URL.createObjectURL(file));
                        setCropperOpen(false);
                    }} 
                    onCancel={() => setCropperOpen(false)} 
                />
            )}
        </div>
    );
}
