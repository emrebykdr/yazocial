import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../services/api';
import { useAuthStore } from '../store/auth.store';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import {
  User, MapPin, Calendar, Award, Settings, MessageSquare, FileText, Briefcase,
  X, Github, Twitter, Globe, Linkedin, Loader2, Check, MessageCircle
} from 'lucide-react';

function EditProfileModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    bio: user.bio || '',
    avatarUrl: user.avatarUrl || '',
    socialLinks: {
      github: user.socialLinks?.github || '',
      twitter: user.socialLinks?.twitter || '',
      website: user.socialLinks?.website || '',
      linkedin: user.socialLinks?.linkedin || '',
    }
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (data) => api.put(`/users/${user._id}`, data).then(r => r.data.data),
    onSuccess: (updated) => { onSave(updated); onClose(); },
    onError: (err) => setError(err.response?.data?.details || err.response?.data?.error || 'Güncelleme başarısız.')
  });

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));
  const setLink = (key, val) => setForm(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: val } }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-surface border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-black tracking-tighter uppercase">Profili Düzenle</h2>
          <button onClick={onClose} className="p-2 hover:bg-surfaceHover rounded-full text-textSecondary transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Avatar URL */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-surface2 border border-border overflow-hidden flex items-center justify-center flex-shrink-0">
              {form.avatarUrl ? <img src={form.avatarUrl} className="w-full h-full object-cover" alt="" /> : <User className="w-8 h-8 text-textSecondary" />}
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-black text-textSecondary uppercase tracking-widest mb-1">Avatar URL</label>
              <input
                value={form.avatarUrl}
                onChange={e => set('avatarUrl', e.target.value)}
                placeholder="https://..."
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-textPrimary outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Ad Soyad */}
          <div className="grid grid-cols-2 gap-3">
            {[['firstName', 'Ad'], ['lastName', 'Soyad']].map(([k, label]) => (
              <div key={k}>
                <label className="block text-[10px] font-black text-textSecondary uppercase tracking-widest mb-1">{label}</label>
                <input
                  value={form[k]}
                  onChange={e => set(k, e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-textPrimary outline-none focus:border-primary transition-colors"
                />
              </div>
            ))}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[10px] font-black text-textSecondary uppercase tracking-widest mb-1">Biyografi <span className="normal-case font-normal">{form.bio.length}/500</span></label>
            <textarea
              value={form.bio}
              onChange={e => set('bio', e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Kendini tanıt..."
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-textPrimary outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* Sosyal Linkler */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-textSecondary uppercase tracking-widest">Sosyal Linkler</h3>
            {[
              { key: 'github', icon: Github, placeholder: 'github.com/kullanici' },
              { key: 'twitter', icon: Twitter, placeholder: 'x.com/kullanici' },
              { key: 'linkedin', icon: Linkedin, placeholder: 'linkedin.com/in/kullanici' },
              { key: 'website', icon: Globe, placeholder: 'https://website.com' },
            ].map(({ key, icon: Icon, placeholder }) => (
              <div key={key} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-textSecondary flex-shrink-0" />
                <input
                  value={form.socialLinks[key]}
                  onChange={e => setLink(key, e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-textPrimary outline-none focus:border-primary transition-colors"
                />
              </div>
            ))}
          </div>

          {error && <p className="text-danger text-xs font-bold">{error}</p>}
        </div>

        <div className="p-6 border-t border-border flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>İptal</Button>
          <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="flex items-center gap-2">
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Kaydet
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser, setAuth, token, isAuthenticated } = useAuthStore();
  const profileId = id || currentUser?._id;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('questions');

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', profileId],
    queryFn: () => api.get(`/users/${profileId}`).then(r => r.data.data),
    enabled: !!profileId
  });

  const { data: followersData } = useQuery({
    queryKey: ['followers', profileId],
    queryFn: () => api.get(`/follows/${profileId}/followers`).then(r => r.data),
    enabled: !!profileId
  });

  const { data: followingData } = useQuery({
    queryKey: ['following', profileId],
    queryFn: () => api.get(`/follows/${profileId}/following`).then(r => r.data),
    enabled: !!profileId
  });

  const { data: followCheckData, refetch: refetchFollowCheck } = useQuery({
    queryKey: ['follow-check', currentUser?._id, profileId],
    queryFn: () => api.get(`/follows/check?followerId=${currentUser._id}&followingId=${profileId}`).then(r => r.data.data),
    enabled: !!currentUser && !!profileId && currentUser._id !== profileId
  });

  const followMutation = useMutation({
    mutationFn: () => api.post('/follows', { followingId: profileId }),
    onSuccess: () => {
      refetchFollowCheck();
      queryClient.invalidateQueries({ queryKey: ['followers', profileId] });
    }
  });

  const { data: questionsData } = useQuery({
    queryKey: ['user-questions', profileId],
    queryFn: () => api.get(`/questions?userId=${profileId}&limit=10`).then(r => r.data),
    enabled: !!profileId && activeTab === 'questions'
  });

  const { data: articlesData } = useQuery({
    queryKey: ['user-articles', profileId],
    queryFn: () => api.get(`/articles?userId=${profileId}&limit=10`).then(r => r.data),
    enabled: !!profileId && activeTab === 'articles'
  });

  if (isLoading) return <div className="h-96 bg-surface/50 animate-pulse rounded-xl" />;
  if (!user) return <div className="text-center py-20 text-textSecondary italic">Kullanıcı bulunamadı.</div>;

  const isOwnProfile = currentUser?._id === user._id;

  const handleSave = (updated) => {
    queryClient.setQueryData(['user', profileId], updated);
    if (isOwnProfile) setAuth(updated, token);
  };

  const socialIcons = { github: Github, twitter: Twitter, website: Globe, linkedin: Linkedin };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Helmet>
        <title>{user.username} — Yazocial</title>
        <meta name="description" content={user.bio || `${user.username} profili`} />
      </Helmet>

      {editOpen && <EditProfileModal user={user} onClose={() => setEditOpen(false)} onSave={handleSave} />}

      {/* Header */}
      <Card className="relative overflow-hidden p-0 border-border/50">
        <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent" />
        <div className="px-8 pb-8 flex flex-col sm:flex-row items-end gap-6 -mt-12 relative z-10">
          <div className="w-32 h-32 rounded-2xl bg-surface border-4 border-background overflow-hidden flex items-center justify-center">
            {user.avatarUrl ? <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" /> : <User className="w-16 h-16 text-textSecondary" />}
          </div>
          <div className="flex-1 space-y-1 mb-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tighter text-textPrimary uppercase">{user.username}</h1>
              {user.firstName && <span className="text-sm text-textSecondary">{user.firstName} {user.lastName}</span>}
              {user.role === 'admin' && <span className="px-2 py-0.5 bg-danger/10 text-danger text-[10px] font-black rounded uppercase tracking-widest border border-danger/20">ADMIN</span>}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-textSecondary uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                {new Date(user.createdAt).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })} Katıldı
              </span>
              <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-primary" /> {user.reputation || 0} İtibar</span>
            </div>
            {/* Sosyal linkler */}
            {user.socialLinks && (
              <div className="flex items-center gap-3 pt-1">
                {Object.entries(user.socialLinks).map(([key, val]) => {
                  if (!val) return null;
                  const Icon = socialIcons[key];
                  const href = val.startsWith('http') ? val : `https://${val}`;
                  return (
                    <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="text-textSecondary hover:text-primary transition-colors">
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
          <div className="mb-2 flex items-center gap-2">
            {isOwnProfile ? (
              <Button variant="outline" onClick={() => setEditOpen(true)} className="flex items-center gap-2">
                <Settings className="w-4 h-4" /> PROFİLİ DÜZENLE
              </Button>
            ) : (
              <>
                {isAuthenticated && (
                  <Button
                    onClick={() => followMutation.mutate()}
                    disabled={followMutation.isPending}
                    variant={followCheckData?.isFollowing ? 'outline' : 'primary'}
                    className="flex items-center gap-2 uppercase tracking-widest px-6"
                  >
                    {followMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (followCheckData?.isFollowing ? 'TAKİPTEN ÇIK' : 'TAKİP ET')}
                  </Button>
                )}
                {isAuthenticated && (
                  <Button variant="outline" onClick={async () => {
                    const res = await api.post('/conversations', { targetUserId: user._id });
                    navigate(`/messages/${res.data.data._id}`);
                  }} className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" /> Mesaj At
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon */}
        <div className="space-y-6">
          <Card className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-textSecondary uppercase tracking-[3px]">Hakkında</h3>
              <p className="text-sm text-textSecondary leading-relaxed">
                {user.bio || <span className="italic opacity-60">Henüz bir biyografi eklenmemiş...</span>}
              </p>
            </div>
            <div className="h-px bg-border/30" />
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-surface2/30 rounded-lg text-center space-y-1">
                <span className="block text-xl font-black text-textPrimary">{followersData?.count ?? 0}</span>
                <span className="block text-[10px] font-black text-textSecondary uppercase tracking-widest">Takipçi</span>
              </div>
              <div className="p-3 bg-surface2/30 rounded-lg text-center space-y-1">
                <span className="block text-xl font-black text-textPrimary">{followingData?.count ?? 0}</span>
                <span className="block text-[10px] font-black text-textSecondary uppercase tracking-widest">Takip Edilen</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Sağ Kolon */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-6 border-b border-border/30 px-2">
            {[
              { id: 'questions', label: 'Sorular', icon: MessageSquare },
              { id: 'articles', label: 'Makaleler', icon: FileText },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-1 py-4 text-xs font-black uppercase tracking-widest transition-colors relative whitespace-nowrap ${activeTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-textSecondary hover:text-textPrimary'}`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {activeTab === 'questions' && (
              (questionsData?.data?.length > 0) ? questionsData.data.map(q => (
                <a key={q._id} href={`/questions/${q._id}`} className="block bg-surface border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-colors">
                  <p className="text-sm font-bold text-textPrimary">{q.title}</p>
                  <p className="text-xs text-textSecondary mt-1">{new Date(q.createdAt).toLocaleDateString('tr-TR')}</p>
                </a>
              )) : <EmptyState />
            )}
            {activeTab === 'articles' && (
              (articlesData?.data?.length > 0) ? articlesData.data.map(a => (
                <a key={a._id} href={`/articles/${a._id}`} className="block bg-surface border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-colors">
                  <p className="text-sm font-bold text-textPrimary">{a.title}</p>
                  <p className="text-xs text-textSecondary mt-1">{new Date(a.createdAt).toLocaleDateString('tr-TR')}</p>
                </a>
              )) : <EmptyState />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-16 text-center text-textSecondary text-sm italic bg-surface/30 rounded-xl border border-dashed border-border/50">
      Henüz içerik yok...
    </div>
  );
}
