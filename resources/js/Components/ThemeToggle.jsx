import React, { useEffect, useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function ThemeToggle({ className = '' }) {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        // Initialize theme from localStorage or system preference
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setTheme('dark');
            document.documentElement.classList.add('dark');
        } else {
            setTheme('light');
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        if (theme === 'dark') {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setTheme('light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setTheme('dark');
        }
    };

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
            title={theme === 'dark' ? 'Mode Clair' : 'Mode Sombre'}
            className={`relative p-2.5 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                theme === 'dark'
                    ? 'bg-slate-800 text-amber-300 hover:bg-slate-700 border border-slate-700/80 shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 shadow-sm'
            } ${className}`}
        >
            <div className="relative w-4 h-4 flex items-center justify-center">
                {theme === 'dark' ? (
                    <FiSun className="w-4 h-4 transform transition-transform duration-300 rotate-0 scale-100" />
                ) : (
                    <FiMoon className="w-4 h-4 transform transition-transform duration-300 rotate-0 scale-100" />
                )}
            </div>
        </button>
    );
}
