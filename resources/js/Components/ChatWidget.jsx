import React, { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiX, FiSend, FiLifeBuoy, FiClock, FiCheck, FiCheckCircle, FiPaperclip, FiSmile, FiLock } from 'react-icons/fi';
import axios from 'axios';
import { usePage } from '@inertiajs/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export default function ChatWidget() {
    const { auth } = usePage().props;
    const currentUser = auth?.user || null;
    
    const [isOpen, setIsOpen] = useState(false);
    const [publicMessages, setPublicMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Fetch initial data
    useEffect(() => {
        if (!isOpen) return;
        setUnreadCount(0);
        fetchMessages();
        setTimeout(() => {
            if(inputRef.current) inputRef.current.focus();
        }, 100);
    }, [isOpen]);

    const fetchMessages = () => {
        axios.get('/chat/messages').then(res => {
            setPublicMessages(res.data);
        }).catch(err => console.error(err));
    };

    // Listen to WebSockets
    useEffect(() => {
        if (!window.Echo || !currentUser) return;

        const presenceChannel = window.Echo.join('chat.public')
            .listen('MessageSent', (e) => {
                if (!e.message.receiver_id) {
                    setPublicMessages(prev => {
                        // Avoid duplicates if we sent it
                        if (prev.find(m => m.id === e.message.id)) return prev;
                        return [...prev, e.message];
                    });
                    
                    if (!isOpen && e.message.sender_id !== currentUser.id) {
                        setUnreadCount(prev => prev + 1);
                    }
                }
            })
            .listenForWhisper('typing', (e) => {
                if(e.userId !== currentUser.id) {
                    setIsTyping(true);
                    setTimeout(() => setIsTyping(false), 3000);
                }
            });

        return () => {
            presenceChannel.stopListening('MessageSent');
            window.Echo.leave('chat.public');
        };
    }, [isOpen, currentUser]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [publicMessages, isOpen, isTyping]);

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        if(window.Echo && currentUser) {
            window.Echo.join('chat.public').whisper('typing', { userId: currentUser.id });
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;

        const tempId = Date.now();
        const optimisticMsg = {
            id: tempId,
            content: newMessage,
            sender_id: currentUser.id,
            sender: { name: currentUser.name },
            created_at: new Date().toISOString(),
            status: 'sending'
        };

        setPublicMessages(prev => [...prev, optimisticMsg]);
        setNewMessage('');

        axios.post('/chat/messages', {
            content: optimisticMsg.content,
            receiver_id: null
        }).then(res => {
            const actualMsg = res.data;
            setPublicMessages(prev => prev.map(m => m.id === tempId ? actualMsg : m));
        }).catch(err => {
            console.error("Failed to send message", err);
            // Revert on fail
            setPublicMessages(prev => prev.filter(m => m.id !== tempId));
        });
    };

    const formatTime = (dateString) => {
        if(!dateString) return '';
        const d = new Date(dateString);
        return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute:'2-digit' });
    };

    if (!currentUser) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[999] print:hidden">
            {/* Chat Toggle Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="bg-gray-900 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white p-4 w-[60px] h-[60px] rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex items-center justify-center relative group transition-colors"
                        title="Support & Assistance"
                    >
                        <FiMessageSquare size={26} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900 shadow-sm animate-bounce">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white dark:bg-gray-900 w-[90vw] sm:w-[400px] h-[600px] max-h-[85vh] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-200/60 dark:border-gray-700/60 flex flex-col overflow-hidden origin-bottom-right"
                    >
                        
                        {/* Header */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-indigo-600 dark:to-purple-800 p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <div className="absolute bottom-0 left-10 w-24 h-24 bg-white/5 rounded-full blur-xl -mb-10"></div>
                            
                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <div className="flex items-center gap-1.5 text-white/80 text-[10px] font-bold mb-1.5 uppercase tracking-wider">
                                        <FiLifeBuoy size={12} />
                                        Support LavoieJob
                                    </div>
                                    <h3 className="text-2xl font-black text-white leading-tight tracking-tight">
                                        Comment pouvons-nous<br/>vous aider ?
                                    </h3>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors backdrop-blur-sm">
                                    <FiX size={20} />
                                </button>
                            </div>
                            
                            {/* Team Avatars */}
                            <div className="flex items-center gap-3 mt-5 relative z-10">
                                <div className="flex -space-x-2">
                                    <div className="w-9 h-9 rounded-full bg-indigo-500 border-2 border-gray-900 flex items-center justify-center text-white text-xs font-bold z-20">LV</div>
                                    <div className="w-9 h-9 rounded-full bg-emerald-500 border-2 border-gray-900 flex items-center justify-center text-white text-xs font-bold shadow-sm z-10">SP</div>
                                    <div className="w-9 h-9 rounded-full bg-rose-500 border-2 border-gray-900 flex items-center justify-center text-white text-xs font-bold shadow-sm z-0">IT</div>
                                </div>
                                <div className="text-white/80 text-xs leading-tight font-medium">
                                    L'équipe répond en<br/>moins de <span className="font-bold text-white">5 minutes</span>.
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900/50 relative overflow-hidden">
                            {/* Messages Scroll Area */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-5 relative z-10 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                                {publicMessages.length === 0 ? (
                                    <div className="text-center mt-10">
                                        <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl mx-auto flex items-center justify-center shadow-sm text-gray-400 mb-4 transform -rotate-6">
                                            <FiMessageSquare size={32} />
                                        </div>
                                        <h4 className="text-gray-900 dark:text-white font-bold mb-1">Envoyez-nous un message</h4>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">Nous sommes là pour vous assister.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col space-y-4">
                                        {/* Date Divider Example */}
                                        <div className="flex items-center justify-center my-2">
                                            <span className="text-[10px] font-bold text-gray-400 bg-gray-200/50 dark:bg-gray-800 px-3 py-1 rounded-full uppercase tracking-widest">Aujourd'hui</span>
                                        </div>

                                        {publicMessages.map((msg, index) => {
                                            const isMe = msg.sender_id === currentUser.id;
                                            const showName = !isMe && (index === 0 || publicMessages[index - 1]?.sender_id !== msg.sender_id);
                                            
                                            return (
                                                <div key={msg.id || index} className={cn("flex flex-col w-full", isMe ? "items-end" : "items-start")}>
                                                    {showName && (
                                                        <span className="text-[11px] font-bold text-gray-500 mb-1 ml-2">{msg.sender?.name || 'Support'}</span>
                                                    )}
                                                    <div className={cn(
                                                        "group flex items-end gap-2 max-w-[85%]",
                                                        isMe ? "flex-row-reverse" : "flex-row"
                                                    )}>
                                                        <div className={cn(
                                                            "px-4 py-2.5 text-[14px] leading-relaxed shadow-sm relative font-medium",
                                                            isMe 
                                                                ? "bg-gray-900 dark:bg-indigo-600 text-white rounded-2xl rounded-br-sm" 
                                                                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-2xl rounded-bl-sm border border-gray-100 dark:border-gray-700/60"
                                                        )}>
                                                            {msg.content}
                                                        </div>
                                                    </div>
                                                    <div className={cn("flex items-center gap-1 mt-1 text-[10px] text-gray-400 font-semibold", isMe ? "mr-1" : "ml-2")}>
                                                        {formatTime(msg.created_at)}
                                                        {isMe && (
                                                            msg.status === 'sending' ? <FiClock size={10} className="text-gray-300" /> : <FiCheckCircle size={10} className="text-emerald-500" />
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        
                                        {isTyping && (
                                            <div className="flex items-start">
                                                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1.5 items-center h-10">
                                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input Area */}
                            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700/60 z-20">
                                <form onSubmit={handleSendMessage} className="relative flex items-end gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-1.5 transition-colors focus-within:border-gray-900 dark:focus-within:border-indigo-500 focus-within:bg-white dark:focus-within:bg-gray-800 shadow-sm">
                                    <div className="flex flex-col justify-end pb-1.5 pl-1.5">
                                        <button type="button" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                            <FiPaperclip size={18} />
                                        </button>
                                    </div>
                                    <textarea
                                        ref={inputRef}
                                        value={newMessage}
                                        onChange={handleTyping}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                        placeholder="Votre message..."
                                        className="flex-1 max-h-32 bg-transparent border-none focus:ring-0 resize-none py-2.5 px-2 text-[14px] font-medium dark:text-white placeholder-gray-400 min-h-[44px]"
                                        rows={1}
                                    />
                                    <div className="flex items-center gap-1 pb-1 pr-1">
                                        <button type="button" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2">
                                            <FiSmile size={18} />
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={!newMessage.trim()}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-900 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white disabled:opacity-40 disabled:hover:bg-gray-900 transition-all shadow-sm transform active:scale-95"
                                        >
                                            <FiSend size={16} className="ml-0.5" />
                                        </button>
                                    </div>
                                </form>
                                <div className="text-center mt-3 text-[10px] text-gray-400 flex items-center justify-center gap-1 font-medium">
                                    <FiLock size={10} /> Protégé par le réseau sécurisé LavoieJob
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
