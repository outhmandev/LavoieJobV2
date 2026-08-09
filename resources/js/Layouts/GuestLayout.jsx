import ApplicationLogo from '@/Components/ApplicationLogo';
import ThemeToggle from '@/Components/ThemeToggle';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function GuestLayout({ children, sideContent = null }) {
    return (
        <div className="flex min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white">
            
            {/* LEFT SIDE - FORM */}
            <div className="flex w-full lg:w-1/3 xl:w-[30%] flex-col items-center justify-center p-8 sm:p-12 relative bg-white dark:bg-slate-950 z-50 shadow-[30px_0_60px_rgba(0,0,0,0.15)]">
                
                {/* Theme switch button */}
                <div className="absolute top-6 right-6 z-20">
                    <ThemeToggle />
                </div>
                
                <div className="w-full max-w-sm relative z-10 flex flex-col">
                    {/* Logo - Centered right above the form */}
                    <div className="w-full flex justify-center mb-10">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <Link href="/">
                                <ApplicationLogo isLarge={true} className="drop-shadow-sm text-slate-900 dark:text-white" />
                            </Link>
                        </motion.div>
                    </div>

                    {/* The Form */}
                    {children}
                </div>
                
                {/* Footer */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="mt-16 w-full max-w-sm text-left text-xs font-medium text-slate-400 dark:text-slate-500"
                >
                    &copy; {new Date().getFullYear()} La Voie Job. Tous droits réservés.
                </motion.div>
            </div>

            {/* RIGHT SIDE - UNFORGETTABLE ADOBE-STYLE EXPERIENCE */}
            <div className="hidden lg:flex lg:w-2/3 xl:w-[70%] relative bg-[#0a0a0a] items-center justify-center overflow-hidden perspective-1000">
                
                {/* Background Base */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#111827] to-[#0a0a0a]"></div>

                {/* Ambient Morphing Blobs (Adobe style dynamic background) */}
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        borderRadius: ["30% 70% 70% 30% / 30% 30% 70% 70%", "60% 40% 30% 70% / 60% 30% 70% 40%", "30% 70% 70% 30% / 30% 30% 70% 70%"]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[800px] h-[800px] bg-gradient-to-tr from-indigo-600/20 to-blue-600/20 blur-[80px] -top-10 -right-20 z-0"
                />
                
                <motion.div 
                    animate={{ 
                        scale: [1, 1.5, 1],
                        rotate: [360, 180, 360],
                        borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "70% 30% 50% 50% / 30% 30% 70% 70%", "40% 60% 70% 30% / 40% 50% 60% 50%"]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[600px] h-[600px] bg-gradient-to-bl from-purple-600/10 to-indigo-600/20 blur-[100px] bottom-10 left-10 z-0"
                />

                {/* Complex SVG Drawing Animation (Stroke Dasharray technique) */}
                <svg className="absolute inset-0 w-full h-full z-0 opacity-30" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
                    <motion.path 
                        d="M -100,500 C 200,200 400,800 700,400 S 1100,600 1200,300" 
                        fill="transparent" 
                        stroke="url(#gradientStroke)" 
                        strokeWidth="2"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 3, ease: "easeInOut", delay: 0.5 }}
                    />
                    <motion.path 
                        d="M 1200,800 C 900,900 700,200 400,600 S -100,200 -200,500" 
                        fill="transparent" 
                        stroke="url(#gradientStroke2)" 
                        strokeWidth="1"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 4, ease: "easeInOut", delay: 1 }}
                    />
                    <defs>
                        <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0" />
                            <stop offset="50%" stopColor="#818CF8" stopOpacity="1" />
                            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="gradientStroke2" x1="100%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor="#9333EA" stopOpacity="0" />
                            <stop offset="50%" stopColor="#C084FC" stopOpacity="1" />
                            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* The Unforgettable Typography Reveal */}
                <div className="relative z-20 w-full max-w-4xl px-16 flex flex-col items-start justify-center">
                    
                    <div className="overflow-hidden mb-2">
                        <motion.div
                            initial={{ y: "100%", rotate: 5, opacity: 0 }}
                            animate={{ y: 0, rotate: 0, opacity: 1 }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                        >
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-500 font-bold tracking-widest uppercase text-sm mb-4 block">
                                Nouvelle Expérience
                            </span>
                        </motion.div>
                    </div>

                    <div className="overflow-hidden">
                        <motion.h1 
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                            className="text-6xl xl:text-8xl font-black text-white tracking-tighter leading-[0.9]"
                        >
                            Recruter.
                        </motion.h1>
                    </div>
                    
                    <div className="overflow-hidden">
                        <motion.h1 
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                            className="text-6xl xl:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500 tracking-tighter leading-[0.9]"
                        >
                            Autrement.
                        </motion.h1>
                    </div>

                    <motion.p 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, ease: "easeOut", delay: 1 }}
                        className="text-slate-400 text-xl xl:text-2xl font-light mt-8 max-w-lg border-l-2 border-indigo-500 pl-6"
                    >
                        Une conception révolutionnaire pour la gestion de vos talents. Fluide, rapide et inoubliable.
                    </motion.p>
                </div>

                {/* 3D Floating Glass Panes (Adobe After Effects style 3D space) */}
                <div className="absolute inset-0 z-10 pointer-events-none perspective-[2000px] flex items-center justify-end pr-32">
                    <motion.div 
                        initial={{ opacity: 0, x: 200, rotateY: -40, rotateX: 20, z: -500 }}
                        animate={{ opacity: 1, x: 0, rotateY: -15, rotateX: 10, z: 0 }}
                        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
                        className="relative"
                    >
                        {/* Main Glass Pane */}
                        <motion.div 
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="w-[450px] h-[300px] bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent transform -skew-x-12 translate-x-[-100%] animate-[shimmer_8s_infinite]"></div>
                            
                            {/* Decorative UI elements inside glass */}
                            <div className="p-8 h-full flex flex-col justify-between">
                                <div className="flex justify-between items-center">
                                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                        <div className="w-4 h-4 rounded-full bg-indigo-400 animate-pulse"></div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 rounded-full bg-white/20"></div>
                                        <div className="w-2 h-2 rounded-full bg-white/20"></div>
                                        <div className="w-2 h-2 rounded-full bg-white/50"></div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: "70%" }} transition={{ duration: 2, delay: 2 }} className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"></motion.div>
                                    </div>
                                    <div className="w-3/4 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: "40%" }} transition={{ duration: 2, delay: 2.2 }} className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"></motion.div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Secondary Floating Pane */}
                        <motion.div 
                            initial={{ opacity: 0, z: -200 }}
                            animate={{ opacity: 1, z: 50, y: [0, 15, 0] }}
                            transition={{ opacity: { duration: 1, delay: 1.5 }, y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 } }}
                            className="absolute -bottom-16 -left-16 w-64 h-48 bg-indigo-900/10 backdrop-blur-2xl border border-indigo-400/20 rounded-2xl shadow-2xl p-6"
                        >
                            <div className="flex flex-col gap-3 h-full justify-center">
                                <div className="w-full h-10 bg-white/5 rounded-xl border border-white/5"></div>
                                <div className="w-full h-10 bg-white/5 rounded-xl border border-white/5"></div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
            
        </div>
    );
}
