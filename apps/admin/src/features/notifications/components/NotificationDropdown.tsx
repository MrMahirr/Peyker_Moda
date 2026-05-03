import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, Info, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { socket } from '../../../lib/socket';
import notificationService, { Notification } from '../api/notificationService';
import { toast } from 'sonner';

export const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchNotifications();
        
        socket.on('notification:push', (payload: any) => {
            if (payload.type === 'NOTIFICATION') {
                const newNotif = {
                    id: Date.now().toString(),
                    title: payload.data.title,
                    message: payload.data.message,
                    isRead: false,
                    createdAt: new Date().toISOString(),
                    type: payload.data.type || 'info'
                };
                
                setNotifications(prev => [newNotif, ...prev].slice(0, 50));
                setUnreadCount(prev => prev + 1);
                
                toast.info(newNotif.title, {
                    description: newNotif.message,
                });
            }
        });

        return () => {
            socket.off('notification:push');
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getAll();
            setNotifications(Array.isArray(data) ? data : []);
            const count = await notificationService.getUnreadCount();
            setUnreadCount(typeof count === 'number' ? count : 0);
        } catch (error) {
            console.error('Bildirimler yüklenemedi:', error);
            setNotifications([]);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            toast.error('İşlem başarısız');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success('Tüm bildirimler okundu olarak işaretlendi');
        } catch (error) {
            toast.error('İşlem başarısız');
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await notificationService.remove(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (notifications.find(n => n.id === id && !n.isRead)) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            toast.error('Silme işlemi başarısız');
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case 'error': return <XCircle className="w-4 h-4 text-rose-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer relative p-2.5 rounded-xl hover:bg-primary-light dark:hover:bg-zinc-200 text-zinc-500 border border-transparent hover:border-primary-light transition-all duration-200 active:scale-95"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary-dark dark:bg-white rounded-full ring-2 ring-surface dark:ring-primary-dark animate-pulse" />
                )}
            </button>

            {isOpen && (
                <>
                    <div className="absolute right-4 top-full mt-[1px] w-4 h-4 bg-surface-secondary dark:bg-primary-light rotate-45 border-l border-t border-primary-light dark:border-zinc-800 z-[101]" />
                    
                    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-surface dark:bg-primary-lighte rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-primary-light dark:border-zinc-800 overflow-hidden z-[100] transform origin-top-right transition-all duration-200 ease-out">
                        <div className="p-4 border-b border-primary-light dark:border-zinc-800 flex items-center justify-between ">
                            <h3 className="font-bold text-primary-dark  flex items-center gap-2 text-sm">
                                Bildirimler
                                {unreadCount > 0 && <span className="text-xs font-medium text-zinc-400">{unreadCount} yeni</span>}
                            </h3>
                            <button 
                                onClick={handleMarkAllAsRead}
                                className="cursor-pointer text-xs text-primary-dark hover:underline flex items-center gap-1 font-bold transition-colors"
                            >
                                <Check className="w-3.5 h-3.5" />
                                Hepsini Oku
                            </button>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto sidebar-scroll">
                            {notifications.length === 0 ? (
                                <div className="p-10 text-center">
                                    <Bell className="w-10 h-10 text-primary-light dark:text-zinc-800 mx-auto mb-3" />
                                    <p className="text-zinc-400 text-sm font-medium">Henüz bildirim yok</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-primary-light dark:divide-zinc-800">
                                    {notifications.map((notif) => (
                                        <div 
                                            key={notif.id}
                                            onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                                            className={`p-4 flex gap-3 hover:bg-surface-secondary dark:hover:bg-zinc-800/50 transition-colors cursor-pointer relative group ${!notif.isRead ? 'bg-primary-light/30 dark:bg-zinc-800/20' : ''}`}
                                        >
                                            <div className="mt-1 shrink-0">
                                                {getIcon((notif as any).type || 'info')}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <p className={`text-[13px] font-bold truncate ${notif.isRead ? 'text-zinc-400' : 'text-primary dark:text-zinc-100'}`}>
                                                        {notif.title}
                                                    </p>
                                                    <span className="text-[10px] font-bold text-zinc-300 flex items-center gap-1 shrink-0 uppercase tracking-tight">
                                                        {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: tr }) : 'az önce'}
                                                    </span>
                                                </div>
                                                <p className="text-[12px] font-medium text-zinc-400 line-clamp-2 leading-relaxed">
                                                    {notif.message}
                                                </p>
                                            </div>
                                            
                                            <button 
                                                onClick={(e) => handleDelete(e, notif.id)}
                                                className="absolute right-2 bottom-2 p-1.5 rounded-lg text-zinc-300 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-3 border-t border-primary-light dark:border-zinc-300 text-center bg-white dark:bg-primary-light">
                            <button className="cursor-pointer text-[12px] text-zinc-700 hover:text-primary dark:hover:text-gray-900 font-bold transition-colors">
                                Tüm Bildirimleri Gör
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
