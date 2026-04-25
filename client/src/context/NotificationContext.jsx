import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { api } from '../services/api';
import { getSocket } from '../services/socket';

const NotificationContext = createContext({ unreadCount: 0, newNotification: null, setUnreadCount: () => {} });

export function NotificationProvider({ children }) {
    const { isAuthenticated } = useAuthStore();
    const [unreadCount, setUnreadCount] = useState(0);
    const [newNotification, setNewNotification] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) { setUnreadCount(0); return; }

        // İlk yüklemede okunmamış sayısını getir
        api.get('/notifications?limit=1')
            .then(r => setUnreadCount(r.data.unreadCount || 0))
            .catch(() => {});

        // Socket.IO üzerinden dinle
        const socket = getSocket();
        if (!socket) return;

        const handler = (notif) => {
            setNewNotification(notif);
            setUnreadCount(prev => prev + 1);
        };

        socket.on('new_notification', handler);
        return () => { socket.off('new_notification', handler); };
    }, [isAuthenticated]);

    return (
        <NotificationContext.Provider value={{ unreadCount, newNotification, setUnreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    return useContext(NotificationContext);
}
