import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiBell, FiCheckCircle, FiInfo, FiAlertTriangle, FiCheck, FiSend } from 'react-icons/fi';

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(route('notifications.index'));
            setNotifications(response.data.notifications || []);
            setUnreadCount(response.data.unread_count || 0);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 15 seconds for new notifications
        const interval = setInterval(fetchNotifications, 15000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id, actionUrl) => {
        try {
            await axios.post(route('notifications.read', id));
            setNotifications((prev) =>
                prev.map((item) => (item.id === id ? { ...item, read_at: new Date().toISOString() } : item))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));

            if (actionUrl) {
                window.location.href = actionUrl;
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            setLoading(true);
            await axios.post(route('notifications.readAll'));
            setNotifications((prev) => prev.map((item) => ({ ...item, read_at: new Date().toISOString() })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        } finally {
            setLoading(false);
        }
    };


    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <FiCheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'warning':
                return <FiAlertTriangle className="w-5 h-5 text-amber-500" />;
            default:
                return <FiInfo className="w-5 h-5 text-indigo-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                title="Notifications"
            >
                <FiBell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden transform transition-all duration-200">
                    {/* Header */}
                    <div className="px-4 py-3 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-full">
                                    {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    disabled={loading}
                                    className="text-xs font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 flex items-center gap-1 hover:underline"
                                >
                                    <FiCheck size={13} /> Tout marquer lu
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                        {notifications.length === 0 ? (
                            <div className="py-10 text-center px-4">
                                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3 text-gray-400">
                                    <FiBell size={24} />
                                </div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Aucune notification</p>
                                <p className="text-xs text-gray-400 mt-1">Vous recevrez des notifications ici dès qu'il y aura du nouveau.</p>
                            </div>
                        ) : (
                            notifications.map((item) => {
                                const isUnread = !item.read_at;
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => markAsRead(item.id, item.action_url)}
                                        className={`p-4 transition-colors cursor-pointer flex gap-3.5 items-start ${
                                            isUnread
                                                ? 'bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                        }`}
                                    >
                                        <div className="mt-0.5 shrink-0">{getIcon(item.type)}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className={`text-xs font-semibold truncate ${isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {item.title}
                                                </p>
                                                <span className="text-[10px] text-gray-400 whitespace-nowrap">{item.created_at}</span>
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed line-clamp-2">
                                                {item.message}
                                            </p>
                                        </div>
                                        {isUnread && (
                                            <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0"></span>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
