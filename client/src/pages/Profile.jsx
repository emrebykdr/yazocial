import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/auth.store';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  User, 
  MapPin, 
  Calendar, 
  Award, 
  Settings, 
  MessageSquare, 
  FileText, 
  Briefcase 
} from 'lucide-react';

export default function Profile() {
  const { id } = useParams();
  const currentUser = useAuthStore((state) => state.user);
  const profileId = id || currentUser?._id;

  const { data: profileResponse, isLoading: profileLoading } = useQuery({
    queryKey: ['user', profileId],
    queryFn: async () => {
      const res = await api.get(`/users/${profileId}`);
      return res.data.data;
    },
    enabled: !!profileId
  });

  if (profileLoading) return <div className="h-96 bg-surface/50 animate-pulse rounded-xl" />;
  if (!profileResponse) return <div className="text-center py-20 text-textSecondary italic">Kullanıcı bulunamadı.</div>;

  const user = profileResponse;
  const isOwnProfile = currentUser?._id === user._id;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Card */}
      <Card className="relative overflow-hidden p-0 border-border/50">
        <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent" />
        <div className="px-8 pb-8 flex flex-col sm:flex-row items-end gap-6 -mt-12 relative z-10">
          <div className="w-32 h-32 rounded-2xl bg-surface border-4 border-background overflow-hidden flex items-center justify-center">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <User className="w-16 h-16 text-textSecondary" />
            )}
          </div>
          <div className="flex-1 space-y-1 mb-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tighter text-textPrimary uppercase">{user.username}</h1>
              {user.role === 'admin' && (
                <span className="px-2 py-0.5 bg-danger/10 text-danger text-[10px] font-black rounded uppercase tracking-widest border border-danger/20">ADMIN</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-textSecondary uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary" /> Türkiye</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" /> 
                {new Date(user.createdAt).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })} Katıldı
              </span>
              <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-primary" /> {user.reputation || 0} İtibar</span>
            </div>
          </div>
          <div className="mb-2">
            {isOwnProfile ? (
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="w-4 h-4" /> PROFİLİ DÜZENLE
              </Button>
            ) : (
              <Button className="flex items-center gap-2 uppercase tracking-widest px-8">TAKİP ET</Button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats & About */}
        <div className="space-y-6">
          <Card className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-textSecondary uppercase tracking-[3px]">Hakkında</h3>
              <p className="text-sm text-textSecondary leading-relaxed italic">
                "{user.bio || 'Henüz bir biyografi eklenmemiş...'}"
              </p>
            </div>
            <div className="h-px bg-border/30" />
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-surface2/30 rounded-lg text-center space-y-1">
                <span className="block text-xl font-black text-textPrimary">0</span>
                <span className="block text-[10px] font-black text-textSecondary uppercase tracking-widest">Takipçi</span>
              </div>
              <div className="p-3 bg-surface2/30 rounded-lg text-center space-y-1">
                <span className="block text-xl font-black text-textPrimary">0</span>
                <span className="block text-[10px] font-black text-textSecondary uppercase tracking-widest">Takip Edilen</span>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-xs font-black text-textSecondary uppercase tracking-[3px]">Yetenekler</h3>
            <div className="flex flex-wrap gap-2">
              {['Javascript', 'React', 'Node.js', 'MongoDB'].map(skill => (
                <span key={skill} className="px-2 py-1 bg-surface2/50 text-textSecondary text-[10px] font-bold rounded uppercase tracking-tighter border border-border/50">
                  {skill}
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-border/30 px-2 overflow-x-auto scrollbar-hide">
            {[
              { id: 'questions', label: 'Sorular', icon: MessageSquare },
              { id: 'articles', label: 'Makaleler', icon: FileText },
              { id: 'projects', label: 'Projeler', icon: Briefcase },
            ].map(tab => (
              <button
                key={tab.id}
                className="flex items-center gap-2 px-1 py-4 text-xs font-black uppercase tracking-widest transition-colors relative whitespace-nowrap text-primary border-b-2 border-primary"
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="py-20 text-center text-textSecondary text-sm italic bg-surface/30 rounded-xl border border-dashed border-border/50">
              "Şu an için gösterilecek bir aktivite bulunmuyor..."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
