import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { notificationService, AppNotification } from '../services/notification.service';
import { socket } from '@/lib/socket';

export const NotificationCenter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const unreadCount = notifications.filter(n => !n.read).length;

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const data = await notificationService.getRecent();
            setNotifications(data);
        } catch (error) {
            console.error('Fetch notifications error:', error);
            toast.error('Bildirimler yüklenemedi');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();

        // Listen for real-time notifications
        const handlePushNotification = (payload: any) => {
            const newNotif: AppNotification = {
                id: Math.random().toString(36).substr(2, 9),
                type: payload.data.type || 'info',
                title: payload.data.title,
                message: payload.data.message,
                time: 'Az önce',
                read: false,
                createdAt: new Date().toISOString(),
            };
            setNotifications(prev => [newNotif, ...prev.slice(0, 9)]);
        };

        socket.on('notification:push', handlePushNotification);
        socket.on('order:new', (payload: any) => {
            handlePushNotification({
                data: {
                    type: 'success',
                    title: 'Yeni Sipariş',
                    message: `#${payload.data.orderNumber} numaralı yeni sipariş alındı.`
                }
            });
        });

        return () => {
            socket.off('notification:push');
            socket.off('order:new');
        };
    }, [fetchNotifications]);

    const handleMarkAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <div className="relative">
            <button
                onClick={toggleOpen}
                className="relative p-2 rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-zinc-200 z-50 overflow-hidden">
                        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                            <h3 className="font-semibold text-zinc-900">Bildirimler</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAsRead}
                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                                >
                                    Tümünü Okundu İşaretle
                                </button>
                            )}
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                            {loading ? (
                                <div className="p-8 flex justify-center">
                                    <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500 text-sm">
                                    Bildiriminiz yok.
                                </div>
                            ) : (
                                <div className="divide-y divide-zinc-50">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={cn(
                                                "p-4 hover:bg-zinc-50 transition-colors cursor-pointer",
                                                !notification.read && "bg-indigo-50/30"
                                            )}
                                        >
                                            <div className="flex gap-3">
                                                <div className={cn(
                                                    "h-8 w-8 shrink-0 rounded-full flex items-center justify-center",
                                                    notification.type === 'info' && "bg-blue-100 text-blue-600",
                                                    notification.type === 'warning' && "bg-yellow-100 text-yellow-600",
                                                    notification.type === 'success' && "bg-green-100 text-green-600",
                                                    notification.type === 'error' && "bg-red-100 text-red-600",
                                                )}>
                                                    {notification.type === 'info' && <Info className="w-4 h-4" />}
                                                    {notification.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                                                    {notification.type === 'success' && <CheckCircle className="w-4 h-4" />}
                                                    {notification.type === 'error' && <AlertTriangle className="w-4 h-4" />}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <p className="text-sm font-medium text-zinc-900 leading-none">{notification.title}</p>
                                                    <p className="text-xs text-zinc-500 line-clamp-2">{notification.message}</p>
                                                    <p className="text-[10px] text-zinc-400 font-medium">{notification.time}</p>
                                                </div>
                                                {!notification.read && (
                                                    <div className="h-2 w-2 rounded-full bg-indigo-500 mt-1" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
