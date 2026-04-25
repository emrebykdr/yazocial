import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { api } from '../services/api';
import { useAuthStore } from '../store/auth.store';
import {
    Users, MessageSquare, ChevronLeft, Plus, Trash2, Loader2, Send,
    ChevronUp, ChevronDown, Settings, BarChart2, Clock, TrendingUp, User
} from 'lucide-react';

function CreatePostModal({ communityId, onClose }) {
    const queryClient = useQueryClient();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');

    const mutation = useMutation({
        mutationFn: (data) => api.post('/posts', data).then(r => r.data.data),
        onSuccess: () => { queryClient.invalidateQueries(['community-posts', communityId]); onClose(); },
        onError: (err) => setError(err.response?.data?.details || 'Hata oluştu.')
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-surface border border-border rounded-2xl w-full max-w-xl shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-lg font-black tracking-tighter uppercase">Yeni Gönderi</h2>
                    <button onClick={onClose} className="p-2 hover:bg-surfaceHover rounded-full text-textSecondary transition-colors" aria-label="Kapat">✕</button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-textSecondary uppercase tracking-widest mb-1.5">Başlık *</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            maxLength={200}
                            placeholder="Konuyu özetleyen bir başlık yaz..."
                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-textPrimary outline-none focus:border-primary transition-colors"
                        />
                        <span className="text-[10px] text-textSecondary mt-1 block">{title.length}/200</span>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-textSecondary uppercase tracking-widest mb-1.5">İçerik *</label>
                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            rows={6}
                            placeholder="Detayları paylaş. Markdown desteklenir."
                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-textPrimary outline-none focus:border-primary transition-colors resize-none"
                        />
                    </div>
                    {error && <p className="text-danger text-xs font-bold">{error}</p>}
                </div>
                <div className="p-6 border-t border-border flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-xs font-black text-textSecondary hover:bg-surfaceHover rounded-xl transition-colors">İptal</button>
                    <button
                        onClick={() => mutation.mutate({ communityId, title, content })}
                        disabled={mutation.isPending || !title.trim() || !content.trim()}
                        className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primaryHover text-white text-xs font-black rounded-xl disabled:opacity-50 transition-colors"
                    >
                        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Yayınla
                    </button>
                </div>
            </div>
        </div>
    );
}

function PostCard({ post, onDelete, currentUser }) {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [score, setScore] = useState(post.voteScore || 0);

    const voteMutation = useMutation({
        mutationFn: (type) => api.post(`/posts/${post._id}/vote`, { type }).then(r => r.data),
        onSuccess: (data) => setScore(data.voteScore)
    });

    const canDelete = currentUser && (currentUser._id === post.userId?._id || currentUser.role === 'admin');

    return (
        <div className="bg-surface border border-border rounded-2xl p-5 hover:border-border/80 transition-colors">
            <div className="flex gap-4">
                {/* Vote */}
                <div className="flex flex-col items-center gap-1 pt-1">
                    <button
                        onClick={() => currentUser && voteMutation.mutate('up')}
                        disabled={!currentUser}
                        className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-lg text-textSecondary transition-colors disabled:opacity-30"
                        aria-label="Beğen"
                    >
                        <ChevronUp className="w-5 h-5" />
                    </button>
                    <span className={`text-sm font-black min-w-[24px] text-center ${score > 0 ? 'text-primary' : score < 0 ? 'text-danger' : 'text-textSecondary'}`}>
                        {score}
                    </span>
                    <button
                        onClick={() => currentUser && voteMutation.mutate('down')}
                        disabled={!currentUser}
                        className="p-1.5 hover:bg-danger/10 hover:text-danger rounded-lg text-textSecondary transition-colors disabled:opacity-30"
                        aria-label="Beğenme"
                    >
                        <ChevronDown className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                        <button
                            onClick={() => navigate(`/communities/posts/${post._id}`)}
                            className="text-base font-bold text-textPrimary hover:text-primary transition-colors text-left leading-tight"
                        >
                            {post.title}
                        </button>
                        {canDelete && (
                            <button
                                onClick={() => window.confirm('Bu gönderiyi silmek istediğinize emin misiniz?') && onDelete(post._id)}
                                className="p-1.5 text-textSecondary hover:text-danger rounded-lg hover:bg-danger/10 transition-colors flex-shrink-0"
                                aria-label="Sil"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <p className="text-sm text-textSecondary leading-relaxed line-clamp-3">{post.content}</p>

                    <div className="flex items-center gap-4 pt-1">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-surface2 border border-border overflow-hidden flex items-center justify-center text-[10px] font-black text-primary">
                                {post.userId?.avatarUrl ? <img src={post.userId.avatarUrl} className="w-full h-full object-cover" alt="" /> : (post.userId?.username?.[0] || '?').toUpperCase()}
                            </div>
                            <span className="text-xs text-textSecondary font-bold">u/{post.userId?.username}</span>
                        </div>
                        <span className="text-[10px] text-textSecondary flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                        <button
                            onClick={() => navigate(`/communities/posts/${post._id}`)}
                            className="text-[10px] text-textSecondary flex items-center gap-1 hover:text-primary transition-colors"
                        >
                            <MessageSquare className="w-3 h-3" />
                            {post.commentCount} yorum
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MembersTab({ communityId }) {
    const { data, isLoading } = useQuery({
        queryKey: ['community-members', communityId],
        queryFn: () => api.get(`/communities/${communityId}/members?limit=50`).then(r => r.data)
    });

    if (isLoading) return <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-surface rounded-xl animate-pulse" />)}</div>;

    const roleLabel = { owner: 'Kurucu', moderator: 'Moderatör', member: 'Üye' };
    const roleBadge = { owner: 'bg-primary/10 text-primary border-primary/20', moderator: 'bg-warning/10 text-warning border-warning/20', member: 'bg-surface2 text-textSecondary border-border' };

    return (
        <div className="space-y-2">
            {(data?.data || []).map(m => (
                <div key={m._id} className="flex items-center gap-4 bg-surface border border-border rounded-xl p-4 hover:border-border/80 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-surface2 border border-border flex items-center justify-center overflow-hidden font-bold text-primary flex-shrink-0">
                        {m.userId?.avatarUrl ? <img src={m.userId.avatarUrl} className="w-full h-full object-cover" alt="" /> : (m.userId?.username?.[0] || '?').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <Link to={`/users/${m.userId?._id}`} className="text-sm font-bold text-textPrimary hover:text-primary transition-colors">
                            {m.userId?.username}
                        </Link>
                        {m.userId?.bio && <p className="text-xs text-textSecondary truncate">{m.userId.bio}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-textSecondary">{m.userId?.reputation || 0} itibar</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${roleBadge[m.role] || roleBadge.member}`}>
                            {roleLabel[m.role] || 'Üye'}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

function StatsCard({ communityId }) {
    const { data } = useQuery({
        queryKey: ['community-stats', communityId],
        queryFn: () => api.get(`/communities/${communityId}/stats`).then(r => r.data.data)
    });

    return (
        <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-[10px] font-black text-textSecondary uppercase tracking-widest">İstatistikler</h3>
            <div className="grid grid-cols-3 gap-3">
                {[
                    { icon: BarChart2, label: 'Toplam Gönderi', value: data?.totalPosts ?? '—' },
                    { icon: TrendingUp, label: 'Bu Hafta', value: data?.weeklyPosts ?? '—' },
                    { icon: Users, label: 'Üye', value: data?.memberCount ?? '—' },
                ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bg-surface2/30 rounded-xl p-3 text-center space-y-1.5">
                        <Icon className="w-4 h-4 text-primary mx-auto" />
                        <div className="text-lg font-black text-textPrimary">{value}</div>
                        <div className="text-[9px] font-black text-textSecondary uppercase tracking-wider">{label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function CommunityDetail() {
    const { id } = useParams();
    const { isAuthenticated, user } = useAuthStore();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('feed');
    const [sortBy, setSortBy] = useState('new');
    const [createPostOpen, setCreatePostOpen] = useState(false);

    const { data: community, isLoading } = useQuery({
        queryKey: ['community', id],
        queryFn: () => api.get(`/communities/${id}`).then(r => r.data.data)
    });

    const { data: membershipData } = useQuery({
        queryKey: ['community-membership', id],
        queryFn: () => api.get(`/communities/${id}/membership`).then(r => r.data),
        enabled: isAuthenticated
    });

    const { data: postsData, isLoading: postsLoading } = useQuery({
        queryKey: ['community-posts', id, sortBy],
        queryFn: () => api.get(`/posts?communityId=${id}&limit=30&sort=${sortBy === 'top' ? '-voteScore' : '-createdAt'}`).then(r => r.data),
        enabled: activeTab === 'feed'
    });

    const joinMutation = useMutation({
        mutationFn: () => api.post(`/communities/${id}/join`),
        onSuccess: () => {
            queryClient.invalidateQueries(['community-membership', id]);
            queryClient.invalidateQueries(['community', id]);
            queryClient.invalidateQueries(['community-stats', id]);
        }
    });

    const leaveMutation = useMutation({
        mutationFn: () => api.delete(`/communities/${id}/leave`),
        onSuccess: () => {
            queryClient.invalidateQueries(['community-membership', id]);
            queryClient.invalidateQueries(['community', id]);
            queryClient.invalidateQueries(['community-stats', id]);
        }
    });

    const deletePostMutation = useMutation({
        mutationFn: (postId) => api.delete(`/posts/${postId}`),
        onSuccess: () => queryClient.invalidateQueries(['community-posts', id])
    });

    if (isLoading) return <div className="space-y-4"><div className="h-40 bg-surface/50 animate-pulse rounded-xl" /><div className="h-96 bg-surface/30 animate-pulse rounded-xl" /></div>;
    if (!community) return <div className="text-center py-20 text-textSecondary">Topluluk bulunamadı.</div>;

    const isMember = membershipData?.isMember;
    const isOwner = membershipData?.role === 'owner';

    const tabs = [
        { id: 'feed', label: 'Gönderi Akışı' },
        { id: 'members', label: `Üyeler` },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <Helmet>
                <title>{community.name} — Yazocial Topluluğu</title>
                <meta name="description" content={community.description || `${community.name} topluluğu`} />
            </Helmet>

            {createPostOpen && <CreatePostModal communityId={id} onClose={() => setCreatePostOpen(false)} />}

            <Link to="/communities" className="inline-flex items-center gap-2 text-xs font-black text-textSecondary hover:text-primary transition-colors uppercase tracking-widest">
                <ChevronLeft className="w-4 h-4" /> Tüm Topluluklar
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ana içerik — sol 2/3 */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Header */}
                    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                        <div className="h-28 bg-gradient-to-r from-primary/25 via-primary/10 to-transparent relative">
                            {community.banner && <img src={community.banner} className="w-full h-full object-cover absolute inset-0" alt="" />}
                        </div>
                        <div className="px-6 pb-5 flex items-end gap-4 -mt-8 relative">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 border-4 border-surface flex items-center justify-center text-2xl font-black text-primary overflow-hidden flex-shrink-0">
                                {community.icon ? <img src={community.icon} className="w-full h-full object-cover" alt="" /> : community.name[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0 mb-1">
                                <h1 className="text-2xl font-black tracking-tighter truncate">{community.name}</h1>
                                <p className="text-xs text-textSecondary mt-0.5">
                                    <span className="font-bold text-primary">{community.memberCount}</span> üye
                                    {' · '}Kurucu: <span className="font-bold">{community.ownerId?.username}</span>
                                </p>
                            </div>
                        </div>
                        {community.description && (
                            <p className="px-6 pb-5 text-sm text-textSecondary leading-relaxed">{community.description}</p>
                        )}
                    </div>

                    {/* Tabs + sort */}
                    <div className="flex items-center justify-between border-b border-border">
                        <div className="flex">
                            {tabs.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`px-5 py-3 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-textSecondary hover:text-textPrimary'}`}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        {activeTab === 'feed' && (
                            <div className="flex items-center gap-1 pr-2">
                                {[{ id: 'new', label: 'Yeni', icon: Clock }, { id: 'top', label: 'Popüler', icon: TrendingUp }].map(({ id: sId, label, icon: Icon }) => (
                                    <button key={sId} onClick={() => setSortBy(sId)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors ${sortBy === sId ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:bg-surfaceHover'}`}>
                                        <Icon className="w-3 h-3" />{label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Feed içeriği */}
                    {activeTab === 'feed' && (
                        <div className="space-y-3">
                            {isMember && (
                                <button onClick={() => setCreatePostOpen(true)} className="w-full flex items-center gap-3 bg-surface border border-dashed border-border/60 rounded-2xl p-4 text-sm text-textSecondary hover:border-primary/40 hover:text-primary transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-surface2 border border-border flex items-center justify-center overflow-hidden">
                                        {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" /> : <User className="w-4 h-4" />}
                                    </div>
                                    <span>Topluluğa bir şeyler yaz...</span>
                                    <Plus className="w-4 h-4 ml-auto" />
                                </button>
                            )}
                            {postsLoading
                                ? [...Array(3)].map((_, i) => <div key={i} className="h-28 bg-surface rounded-2xl animate-pulse" />)
                                : (postsData?.data || []).length === 0
                                    ? (
                                        <div className="py-20 text-center text-textSecondary bg-surface/30 rounded-2xl border border-dashed border-border/50 space-y-3">
                                            <MessageSquare className="w-10 h-10 mx-auto opacity-20" />
                                            <p className="text-sm">{isMember ? 'İlk gönderiyi sen oluştur!' : 'Katılarak gönderi paylaşabilirsin.'}</p>
                                        </div>
                                    )
                                    : (postsData.data || []).map(post => (
                                        <PostCard key={post._id} post={post} currentUser={user} onDelete={(pid) => deletePostMutation.mutate(pid)} />
                                    ))
                            }
                        </div>
                    )}

                    {activeTab === 'members' && <MembersTab communityId={id} />}
                </div>

                {/* Sağ sidebar */}
                <div className="space-y-4">
                    <StatsCard communityId={id} />

                    {/* Katıl/Ayrıl + Ayarlar */}
                    <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
                        {isAuthenticated && !isOwner && (
                            isMember ? (
                                <button onClick={() => leaveMutation.mutate()} disabled={leaveMutation.isPending}
                                    className="w-full py-2.5 text-xs font-black border border-border/50 text-textSecondary hover:border-danger hover:text-danger rounded-xl transition-colors">
                                    Topluluktan Ayrıl
                                </button>
                            ) : (
                                <button onClick={() => joinMutation.mutate()} disabled={joinMutation.isPending}
                                    className="w-full py-2.5 text-xs font-black bg-primary hover:bg-primaryHover text-white rounded-xl transition-colors flex items-center justify-center gap-2">
                                    {joinMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Topluluğa Katıl
                                </button>
                            )
                        )}
                        {isOwner && (
                            <div className="text-[10px] text-textSecondary text-center flex items-center justify-center gap-1.5">
                                <Settings className="w-3.5 h-3.5" /> Bu topluluğun kurucususunuz
                            </div>
                        )}
                        {!isAuthenticated && (
                            <Link to="/login" className="block w-full py-2.5 text-xs font-black bg-primary hover:bg-primaryHover text-white rounded-xl transition-colors text-center">
                                Katılmak için giriş yap
                            </Link>
                        )}
                    </div>

                    {/* Kurallar / Açıklama */}
                    <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
                        <h3 className="text-[10px] font-black text-textSecondary uppercase tracking-widest">Topluluk Hakkında</h3>
                        <p className="text-xs text-textSecondary leading-relaxed">
                            {community.description || 'Bu topluluk için henüz bir açıklama eklenmemiş.'}
                        </p>
                        <div className="pt-2 border-t border-border/30 space-y-2 text-xs text-textSecondary">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                Saygılı ve yapıcı olun
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                Konu dışı içerik paylaşmayın
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                Kaynak ve referans belirtin
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
