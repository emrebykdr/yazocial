import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth.store';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) return;

    // Backend'deki /api/notifications/stream ucuna bağlanıyoruz
    const eventSource = new EventSource(`http://localhost:3000/api/notifications/stream?token=${token}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Yeni Bildirim:', data);
      
      // Yeni bildirimi listenin başına ekle
      setNotifications((prev) => [data, ...prev]);

      // Opsiyonel: Tarayıcı bildirimi gösterilebilir
      if (Notification.permission === 'granted') {
        new Notification('Yazocial Bildirimi', {
          body: data.message,
        });
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Bağlantı Hatası:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [token]);

  return notifications;
};
