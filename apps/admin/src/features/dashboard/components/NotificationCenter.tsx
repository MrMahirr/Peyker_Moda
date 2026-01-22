import React, { useState } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

// Mock notifications
const MOCK_NOTIFICATIONS = [
    { id: 1, type: 'info', title: 'Yeni sipariş', message: '#1234 numaralı sipariş alındı.', time: '5 dk önce', read: false },
    { id: 2, type: 'warning', title: 'Stok Uyarısı', message: 'Keten Gömlek stokları azalıyor.', time: '1 saat önce', read: false },
    { id: 3, type: 'success', title: 'Ödeme Alındı', message: '#1230 siparişi için ödeme onaylandı.', time: '2 saat önce', read: true },
    { id: 4, type: 'error', title: 'İade Talebi', message: '#1225 için iade talebi oluşturuldu.', time: '1 gün önce', read: true },
];

export const NotificationCenter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
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
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-semibold text-slate-900">Bildirimler</h3>
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
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 text-sm">
                                    Bildiriminiz yok.
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={cn(
                                                "p-4 hover:bg-slate-50 transition-colors cursor-pointer",
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
                                                    <p className="text-sm font-medium text-slate-900 leading-none">{notification.title}</p>
                                                    <p className="text-xs text-slate-500 line-clamp-2">{notification.message}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">{notification.time}</p>
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
