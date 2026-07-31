    import Checkbox from '@/Components/Checkbox';
    import InputError from '@/Components/InputError';
    import InputLabel from '@/Components/InputLabel';
    import PrimaryButton from '@/Components/PrimaryButton';
    import TextInput from '@/Components/TextInput';
    import GuestLayout from '@/Layouts/GuestLayout';
    import { Head, Link, useForm } from '@inertiajs/react';
    import { motion } from 'framer-motion';
    import { FiMail, FiLock } from 'react-icons/fi';

    export default function Login({ status, canResetPassword }) {
        const { data, setData, post, processing, errors, reset } = useForm({
            email: '',
            password: '',
            remember: false,
        });

        const submit = (e) => {
            e.preventDefault();

            post(route('login'), {
                onFinish: () => reset('password'),
            });
        };

        const containerVariants = {
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: {
                    staggerChildren: 0.1,
                },
            },
        };

        const itemVariants = {
            hidden: { y: 20, opacity: 0 },
            visible: {
                y: 0,
                opacity: 1,
                transition: {
                    type: 'spring',
                    stiffness: 100,
                    damping: 10,
                },
            },
        };

        return (
            <GuestLayout>
                <Head title="Connexion" />

                {status && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800"
                    >
                        {status}
                    </motion.div>
                )}

                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-10 text-center lg:text-left"
                >
                    <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Connexion
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-3 text-base">
                        Saisissez vos identifiants pour accéder à votre espace.
                    </p>
                </motion.div>

                <motion.form 
                    onSubmit={submit} 
                    className="space-y-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants}>
                        <InputLabel htmlFor="email" value="Adresse Email" className="text-slate-700 dark:text-slate-300 font-medium" />

                        <div className="relative mt-2">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiMail className="h-5 w-5 text-slate-400" />
                            </div>
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="block w-full pl-10 rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors shadow-sm"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="nom@entreprise.com"
                            />
                        </div>
                        <InputError message={errors.email} className="mt-2" />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <InputLabel htmlFor="password" value="Mot de passe" className="text-slate-700 dark:text-slate-300 font-medium" />

                        <div className="relative mt-2">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiLock className="h-5 w-5 text-slate-400" />
                            </div>
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="block w-full pl-10 rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors shadow-sm"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                        <InputError message={errors.password} className="mt-2" />
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex items-center justify-between mt-6">
                        <label className="flex items-center cursor-pointer group">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-colors group-hover:border-indigo-400"
                            />
                            <span className="ms-2 text-sm text-slate-600 dark:text-slate-400 select-none group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                                Se souvenir de moi
                            </span>
                        </label>

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                            >
                                Mot de passe oublié ?
                            </Link>
                        )}
                    </motion.div>

                    <motion.div variants={itemVariants} className="mt-8">
                        <PrimaryButton 
                            className="w-full justify-center py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 font-semibold text-base" 
                            disabled={processing}
                        >
                            {processing ? 'Connexion en cours...' : 'Se connecter'}
                        </PrimaryButton>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        Vous n'avez pas de compte ?{' '}
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400 cursor-not-allowed">
                            Contactez l'administrateur
                        </span>
                    </motion.div>
                </motion.form>
            </GuestLayout>
        );
    }
