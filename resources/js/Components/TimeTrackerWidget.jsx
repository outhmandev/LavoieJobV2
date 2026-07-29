import React, { useState, useEffect, useRef } from 'react';
import { FiPlay, FiPause, FiSquare, FiClock, FiCheck } from 'react-icons/fi';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function TimeTrackerWidget() {
    const [status, setStatus] = useState({
        is_working: false,
        is_on_break: false,
        accumulated_work_seconds: 0,
        accumulated_break_seconds: 0,
        local_fetched_at: Date.now(),
    });
    const [elapsedWork, setElapsedWork] = useState(0);
    const [elapsedBreak, setElapsedBreak] = useState(0);
    const [loading, setLoading] = useState(true);
    const [stopAnimState, setStopAnimState] = useState('idle'); // 'idle', 'filling', 'success'
    const widgetRef = useRef(null);

    const fetchStatus = async () => {
        try {
            const res = await axios.get('/time-tracking/status');
            setStatus({
                ...res.data,
                local_fetched_at: Date.now(),
            });
            setElapsedWork(res.data.accumulated_work_seconds || 0);
            setElapsedBreak(res.data.accumulated_break_seconds || 0);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch time tracking status', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    // Bulletproof elapsed time calculation
    useEffect(() => {
        let interval;
        if (status.is_working) {
            interval = setInterval(() => {
                const now = Date.now();
                const diffSeconds = Math.floor((now - status.local_fetched_at) / 1000);
                
                if (status.is_on_break) {
                    setElapsedBreak((status.accumulated_break_seconds || 0) + diffSeconds);
                    setElapsedWork(status.accumulated_work_seconds || 0); // Freeze work timer
                } else {
                    setElapsedWork((status.accumulated_work_seconds || 0) + diffSeconds);
                    setElapsedBreak(status.accumulated_break_seconds || 0); // Freeze break timer
                }
            }, 1000);
        } else {
            setElapsedWork(0);
            setElapsedBreak(0);
        }
        return () => clearInterval(interval);
    }, [status]);

    const formatTime = (totalSeconds) => {
        const validSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
        const hours = Math.floor(validSeconds / 3600);
        const minutes = Math.floor((validSeconds % 3600) / 60);
        const seconds = validSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleAction = async (action) => {
        if (action === 'stop') {
            setStopAnimState('filling');
            
            try {
                // Fire the stop request in background
                await axios.post(`/time-tracking/${action}`);
                
                // Wait for the fill animation to visually reach the end
                setTimeout(() => {
                    setStopAnimState('success');
                    fetchStatus();
                    
                    // Fire unforgettable confetti explosion from the widget's location!
                    if (widgetRef.current) {
                        const rect = widgetRef.current.getBoundingClientRect();
                        const x = (rect.left + rect.width / 2) / window.innerWidth;
                        const y = (rect.top + rect.height / 2) / window.innerHeight;
                        
                        confetti({
                            particleCount: 120,
                            spread: 80,
                            origin: { x, y },
                            colors: ['#10b981', '#34d399', '#f59e0b', '#fbbf24', '#ffffff'],
                            disableForReducedMotion: true,
                            zIndex: 1000,
                            ticks: 200,
                            gravity: 0.8
                        });
                    }
                    
                    // Keep the success message visible for 3.5 seconds
                    setTimeout(() => {
                        setStopAnimState('idle');
                    }, 3500);
                }, 1800);
            } catch (error) {
                console.error(`Failed to ${action}`, error);
                setStopAnimState('idle');
            }
            return;
        }

        try {
            await axios.post(`/time-tracking/${action}`);
            fetchStatus(); // Refresh status after action
        } catch (error) {
            console.error(`Failed to ${action}`, error);
        }
    };

    if (loading) return null;

    return (
        <motion.div 
            ref={widgetRef}
            layout
            initial={{ borderRadius: 9999 }}
            className="relative flex items-center bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 p-1 overflow-hidden min-h-[46px]"
        >
            
            {/* The filling background (Framer Motion) */}
            <AnimatePresence>
                {stopAnimState !== 'idle' && (
                    <motion.div 
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        exit={{ opacity: 0, transition: { duration: 0.3 } }}
                        transition={{ duration: 1.8, ease: "easeInOut" }}
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400 z-10"
                    />
                )}
            </AnimatePresence>

            {/* Success/Animation Overlay Content */}
            <AnimatePresence mode="wait">
                {stopAnimState === 'filling' && (
                    <motion.div 
                        key="filling"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="absolute inset-0 z-20 flex items-center justify-center w-full h-full px-4 text-white font-bold text-sm drop-shadow-sm whitespace-nowrap gap-2"
                    >
                        <FiClock className="animate-spin" size={14} /> Enregistrement...
                    </motion.div>
                )}
                {stopAnimState === 'success' && (
                    <motion.div 
                        key="success"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="absolute inset-0 z-20 flex items-center justify-center w-full h-full px-4 text-white font-extrabold text-[15px] drop-shadow-md whitespace-nowrap gap-2"
                    >
                        🎉 Félicitations, excellent travail ! 👏
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Normal Content (Hidden during animation to maintain exact width without layout jumps) */}
            <div className={`flex items-center transition-opacity duration-300 ${stopAnimState !== 'idle' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                {/* Display Area */}
                <div className="flex items-center px-4 gap-4">
                    {/* Work Timer */}
                    <div className="flex flex-col items-center justify-center min-w-[70px]">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Travail</span>
                        <div className="flex items-center gap-1.5 font-mono text-sm">
                            <FiClock className={status.is_working && !status.is_on_break ? "text-emerald-500 animate-pulse" : "text-gray-300 dark:text-gray-600"} size={14} />
                            <span className={status.is_working && !status.is_on_break ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-gray-500 dark:text-gray-400 font-medium"}>
                                {status.is_working ? formatTime(elapsedWork) : "00:00:00"}
                            </span>
                        </div>
                    </div>
                    
                    {/* Break Timer */}
                    {(status.is_on_break || elapsedBreak > 0) && (
                        <>
                            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>
                            <div className="flex flex-col items-center justify-center min-w-[70px]">
                                <span className="text-[10px] font-bold text-amber-500/70 uppercase tracking-wider mb-0.5">Pause</span>
                                <div className="flex items-center gap-1.5 font-mono text-sm">
                                    <FiPause className={status.is_on_break ? "text-amber-500 animate-pulse" : "text-amber-300 dark:text-amber-700"} size={14} />
                                    <span className={status.is_on_break ? "text-amber-600 dark:text-amber-400 font-bold" : "text-amber-500/70 font-medium"}>
                                        {formatTime(elapsedBreak)}
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                
                {/* Controls Area */}
                <div className="flex items-center bg-gray-50 dark:bg-gray-900/50 rounded-full p-1 ml-2 border border-gray-100 dark:border-gray-800">
                    {!status.is_working ? (
                        <button 
                            onClick={() => handleAction('start')}
                            title="Commencer le travail"
                            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-all shadow-sm hover:shadow active:scale-95 text-sm font-semibold"
                        >
                            <FiPlay size={14} />
                            Start
                        </button>
                    ) : (
                        <div className="flex items-center gap-1">
                            {status.is_on_break ? (
                                <button 
                                    onClick={() => handleAction('resume')}
                                    title="Reprendre le travail"
                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-all shadow-sm hover:shadow active:scale-95 text-sm font-semibold"
                                >
                                    <FiPlay size={14} />
                                    Reprendre
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleAction('pause')}
                                    title="Prendre une pause"
                                    className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full transition-all shadow-sm hover:shadow active:scale-95 text-sm font-semibold"
                                >
                                    <FiPause size={14} />
                                    Pause
                                </button>
                            )}
                            <button 
                                onClick={() => handleAction('stop')}
                                title="Terminer la journée"
                                className="flex items-center justify-center w-8 h-8 ml-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-all shadow-sm hover:shadow active:scale-95"
                            >
                                <FiSquare size={12} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
