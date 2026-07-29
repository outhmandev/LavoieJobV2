import React, { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiX, FiSend, FiUser, FiCircle } from 'react-icons/fi';
import axios from 'axios';
import { usePage } from '@inertiajs/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export default function ChatWidget() {
    const { auth } = usePage().props;
    const currentUser = auth.user;
    
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('public'); // 'public' or 'private'
    const [activeUser, setActiveUser] = useState(null); // The user we are privately chatting with
    
    const [users, setUsers] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    
    const [publicMessages, setPublicMessages] = useState([]);
    const [privateMessages, setPrivateMessages] = useState({}); // { userId: [messages] }
    
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // Fetch initial data
    useEffect(() => {
        if (!isOpen) return;
        
        axios.get('/chat/users').then(res => setUsers(res.data));
        
        fetchMessages(null); // Fetch public messages
        
    }, [isOpen]);

    // Fetch messages for a specific conversation
    const fetchMessages = (userId = null) => {
        axios.get('/chat/messages', { params: { user_id: userId } }).then(res => {
            if (userId === null) {
                setPublicMessages(res.data);
            } else {
                setPrivateMessages(prev => ({ ...prev, [userId]: res.data }));
            }
        });
    };

    // When switching to a private chat, fetch messages if we don't have them
    useEffect(() => {
        if (activeTab === 'private' && activeUser && !privateMessages[activeUser.id]) {
            fetchMessages(activeUser.id);
        }
    }, [activeTab, activeUser]);

    // Listen to WebSockets
    useEffect(() => {
        if (!window.Echo) return;

        // Listen for Public Chat and Presence
        const presenceChannel = window.Echo.join('chat.public')
            .here((users) => {
                const userIds = new Set(users.map(u => u.id));
                setOnlineUsers(userIds);
            })
            .joining((user) => {
                setOnlineUsers(prev => {
                    const newSet = new Set(prev);
                    newSet.add(user.id);
                    return newSet;
                });
            })
            .leaving((user) => {
                setOnlineUsers(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(user.id);
                    return newSet;
                });
            })
            .listen('MessageSent', (e) => {
                if (!e.message.receiver_id) {
                    // It's a public message
                    setPublicMessages(prev => [...prev, e.message]);
                }
            });

        // Listen for Private Messages
        const privateChannel = window.Echo.private(`chat.${currentUser.id}`)
            .listen('MessageSent', (e) => {
                const senderId = e.message.sender_id;
                setPrivateMessages(prev => ({
                    ...prev,
                    [senderId]: [...(prev[senderId] || []), e.message]
                }));
            });

        return () => {
            presenceChannel.stopListening('MessageSent');
            window.Echo.leave('chat.public');
            privateChannel.stopListening('MessageSent');
            window.Echo.leave(`chat.${currentUser.id}`);
        };
    }, []);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [publicMessages, privateMessages, activeTab, activeUser, isOpen]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const receiverId = activeTab === 'private' && activeUser ? activeUser.id : null;
        
        // Optimistic UI update could go here, but let's just wait for the server response
        axios.post('/chat/messages', {
            content: newMessage,
            receiver_id: receiverId
        }).then(res => {
            const message = res.data;
            if (receiverId === null) {
                setPublicMessages(prev => [...prev, message]);
            } else {
                setPrivateMessages(prev => ({
                    ...prev,
                    [receiverId]: [...(prev[receiverId] || []), message]
                }));
            }
            setNewMessage('');
        }).catch(err => {
            console.error("Failed to send message", err);
        });
    };

    const displayMessages = activeTab === 'public' 
        ? publicMessages 
        : (activeUser && privateMessages[activeUser.id] ? privateMessages[activeUser.id] : []);

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Toggle Button */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center justify-center"
                >
                    <FiMessageSquare size={24} />
                    {/* Notification dot could go here */}
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white dark:bg-gray-800 w-[380px] h-[500px] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
                    
                    {/* Header */}
                    <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
                        <h3 className="font-bold flex items-center gap-2">
                            <FiMessageSquare /> Chat Équipe
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-indigo-700 p-1 rounded transition-colors">
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button 
                            className={cn("flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors", activeTab === 'public' ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-gray-500 hover:text-gray-700")}
                            onClick={() => { setActiveTab('public'); setActiveUser(null); }}
                        >
                            Global
                        </button>
                        <button 
                            className={cn("flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors", activeTab === 'private' ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" : "border-transparent text-gray-500 hover:text-gray-700")}
                            onClick={() => setActiveTab('private')}
                        >
                            Privé
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 flex overflow-hidden bg-gray-50 dark:bg-gray-900/50">
                        
                        {/* Users List for Private Chat */}
                        {activeTab === 'private' && !activeUser && (
                            <div className="w-full overflow-y-auto p-2">
                                <h4 className="text-xs font-bold text-gray-500 uppercase px-3 py-2">Membres</h4>
                                {users.map(user => (
                                    <button 
                                        key={user.id}
                                        onClick={() => setActiveUser(user)}
                                        className="w-full text-left flex items-center gap-3 px-3 py-3 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-colors"
                                    >
                                        <div className="relative">
                                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div className={cn("absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800", onlineUsers.has(user.id) ? "bg-emerald-500" : "bg-gray-400")}></div>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{user.name}</div>
                                            <div className="text-xs text-gray-500">{onlineUsers.has(user.id) ? 'En ligne' : 'Hors ligne'}</div>
                                        </div>
                                    </button>
                                ))}
                                {users.length === 0 && (
                                    <div className="text-center p-4 text-gray-500 text-sm">Aucun autre membre trouvé.</div>
                                )}
                            </div>
                        )}

                        {/* Messages Area */}
                        {(activeTab === 'public' || (activeTab === 'private' && activeUser)) && (
                            <div className="flex-1 flex flex-col h-full w-full">
                                {/* Back button for private chat */}
                                {activeTab === 'private' && activeUser && (
                                    <div className="bg-white dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                                        <button onClick={() => setActiveUser(null)} className="text-gray-500 hover:text-indigo-600 text-sm font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                            &larr; Retour
                                        </button>
                                        <div className="flex items-center gap-2 ml-2">
                                            <div className={cn("w-2 h-2 rounded-full", onlineUsers.has(activeUser.id) ? "bg-emerald-500" : "bg-gray-400")}></div>
                                            <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{activeUser.name}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Messages Scroll Area */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {displayMessages.length === 0 ? (
                                        <div className="text-center text-gray-500 text-sm mt-10">
                                            Aucun message pour le moment.<br/>Soyez le premier à dire bonjour !
                                        </div>
                                    ) : (
                                        displayMessages.map((msg, index) => {
                                            const isMe = msg.sender_id === currentUser.id;
                                            return (
                                                <div key={index} className={cn("flex flex-col max-w-[85%]", isMe ? "ml-auto items-end" : "items-start")}>
                                                    {!isMe && activeTab === 'public' && (
                                                        <span className="text-xs text-gray-500 mb-1 ml-1">{msg.sender?.name}</span>
                                                    )}
                                                    <div className={cn(
                                                        "px-4 py-2 rounded-2xl text-sm",
                                                        isMe 
                                                            ? "bg-indigo-600 text-white rounded-br-none" 
                                                            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm rounded-bl-none border border-gray-100 dark:border-gray-700"
                                                    )}>
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                                    <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Écrivez un message..."
                                            className="flex-1 bg-gray-100 dark:bg-gray-900 border-transparent focus:border-indigo-500 focus:ring-0 rounded-full py-2.5 pl-4 pr-10 text-sm dark:text-gray-100 placeholder-gray-400"
                                        />
                                        <button 
                                            type="submit" 
                                            disabled={!newMessage.trim()}
                                            className="absolute right-1 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-600 text-white disabled:opacity-50 disabled:bg-gray-400 transition-colors"
                                        >
                                            <FiSend size={14} className="ml-0.5" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
}
