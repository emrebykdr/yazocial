import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  Bell, 
  MessageSquare, 
  Heart, 
  UserPlus, 
  CheckCircle,
  Trash2,
  Clock
} from 'lucide-react';

export default function Notifications() {
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.put('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  if (isLoading) return <div className="space-y-4 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-20 bg-surface rounded-xl" />)}</div>;

  const notifications = response?.data || [];
  const unreadCount = response?.unreadCount || 0;

  const getIcon = (type) => {
    switch (type) {
      case 'comment': return <MessageSquare className="w-4 h-4 text-primary" />;
      case 'vote': return <Heart className="w-4 h-4 text-danger" />;
      case 'follow': return <UserPlus className="w-4 h-4 text-success" />;
      default: return <Bell className="w-4 h-4 text-textSecondary" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black tracking-tighter text-textPrimary uppercase">Bildirimler</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-black rounded-full uppercase tracking-widest">
              {unreadCount} YENİ
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            className="text-[10px] flex items-center gap-2"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <CheckCircle className="w-3.5 h-3.5" /> TÜMÜNÜ OKUNDU YAP
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="py-20 text-center text-textSecondary text-sm italic bg-surface rounded-xl border border-border">
            "Henüz hiçbir bildiriminiz yok..."
          </div>
        ) : (
          notifications.map((notif) => (
            <Card 
              key={notif._id} 
              className={`flex items-start gap-4 p-4 transition-all hover:bg-surface2/30 group ${!notif.isRead ? 'border-l-4 border-l-primary' : 'border-border/30 opacity-70'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${!notif.isRead ? 'bg-primary/10 border-primary/20' : 'bg-surface2 border-border/20'}`}>
                {getIcon(notif.type)}
              </div>
              
              <div className="flex-1 space-y-1">
                <p className={`text-sm ${!notif.isRead ? 'text-textPrimary font-bold' : 'text-textSecondary'}`}>
                  {notif.message || notif.title}
                </p>
                <div className="flex items-center gap-3 text-[10px] font-bold text-textSecondary uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(notif.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>•</span>
                  <span>{new Date(notif.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>

              <button 
                onClick={() => deleteMutation.mutate(notif._id)}
                className="p-2 opacity-0 group-hover:opacity-100 hover:bg-danger/10 hover:text-danger rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
