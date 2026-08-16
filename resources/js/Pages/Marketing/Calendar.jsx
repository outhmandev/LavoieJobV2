import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import dayjs from 'dayjs';

export default function Calendar({ events }) {
    const [currentDate, setCurrentDate] = useState(dayjs());

    const daysInMonth = currentDate.daysInMonth();
    const firstDayOfMonth = currentDate.startOf('month').day();

    const generateCalendar = () => {
        let days = [];
        // padding for previous month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="min-h-[120px] bg-slate-50 dark:bg-slate-900/50 p-2 border-r border-b border-slate-200 dark:border-slate-800"></div>);
        }
        
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = currentDate.date(i).format('Y-MM-DD');
            const dayEvents = events.filter(e => e.date === dateStr);

            days.push(
                <div key={`day-${i}`} className="min-h-[120px] bg-white dark:bg-slate-900 p-2 border-r border-b border-slate-200 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/80">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">{i}</span>
                    <div className="space-y-1">
                        {dayEvents.map(event => (
                            <div key={event.id} className={`text-xs px-2 py-1 rounded truncate shadow-sm cursor-pointer ${
                                event.status === 'Published' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' :
                                event.status === 'Scheduled' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' :
                                'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                                {event.platform.substring(0,1)} - {event.title || 'Draft'}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return days;
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Calendrier Éditorial</h2>}>
            <Head title="Calendrier Marketing" />

            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                    
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/30">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                            {currentDate.format('MMMM YYYY')}
                        </h2>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentDate(currentDate.subtract(1, 'month'))} className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:bg-slate-50 transition border border-slate-200 dark:border-slate-700">
                                <FiChevronLeft />
                            </button>
                            <button onClick={() => setCurrentDate(dayjs())} className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-sm font-medium hover:bg-slate-50 transition border border-slate-200 dark:border-slate-700">
                                Aujourd'hui
                            </button>
                            <button onClick={() => setCurrentDate(currentDate.add(1, 'month'))} className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:bg-slate-50 transition border border-slate-200 dark:border-slate-700">
                                <FiChevronRight />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 border-t border-l border-slate-200 dark:border-slate-800">
                        {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day, i) => (
                            <div key={i} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
                                {day}
                            </div>
                        ))}
                        {generateCalendar()}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
