import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../services/api';
import { useAuthStore } from '../store/auth.store';
import { Users, Plus, Search, Loader2, X, Check } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

function CreateCommunityModal({ onClose }) {
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const mutation = useMutation({
        mutationFn: (data) => api.post('/communities', data).then(r => r.data.data),
        onSuccess: () => { queryClient.invalidateQueries(['communities']); onClose(); },
        onError: (err) => setError(err.response?.data?.details || err.response?.data?.error || 'Hata.')
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-lg font-black tracking-tighter uppercase">Topluluk Oluştur</h2>
                    <button onClick={onClose} className="p-2 hover:bg-surfaceHover rounded-full text-textSecondary"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-textSecondary uppercase tracking-widest mb-1">Topluluk Adı *</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="örn: react-developers" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-textPrimary outline-none focus:border-primary transition-colors" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-textSecondary uppercase tracking-widest mb-1">Açıklama</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Bu topluluk nedir?" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-textPrimary outline-none focus:border-primary transition-colors resize-none" />
                    </div>
                    {error && <p className="text-danger text-xs font-bold">{error}</p>}
                </div>
                <div className="p-6 border-t border-border flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-xs font-black text-textSecondary hover:bg-surfaceHover rounded-lg transition-colors">İptal</button>
                    <button onClick={() => mutation.mutate({ name, description })} disabled={mutation.isPending || !name.trim()} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primaryHover text-white text-xs font-black rounded-lg transition-colors disabled:opacity-50">
                        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Oluştur
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Communities() {
    const { isAuthenticated } = useAuthStore();
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search);
    const [createOpen, setCreateOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['communities', debouncedSearch],
        queryFn: () => api.get(`/communities?search=${debouncedSearch}&limit=30`).then(r => r.data),
    });

    const joinMutation = useMutation({
        mutationFn: (id) => api.post(`/communities/${id}/join`),
        onSuccess: () => queryClient.invalidateQueries(['communities'])
    });

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Helmet>
                <title>Topluluklar — Yazocial</title>
                <meta name="description" content="Yazocial toplulukları — geliştiricilerin bir araya geldiği gruplar." />
            </Helmet>

            {createOpen && <CreateCommunityModal onClose={() => setCreateOpen(false)} />}

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black tracking-tighter uppercase">Topluluklar</h1>
                {isAuthenticated && (
                    <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-xl text-xs font-black transition-colors">
                        <Plus className="w-4 h-4" /> Oluştur
                    </button>
                )}
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Topluluk ara..." className="w-full bg-surface border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary transition-colors" />
            </div>

            {isLoading ? (
                <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-surface rounded-xl animate-pulse" />)}</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(data?.data || []).map(community => (
                        <div key={community._id} className="bg-surface border border-border rounded-xl p-4 flex items-start gap-4 hover:border-primary/30 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                {community.icon ? <img src={community.icon} className="w-full h-full rounded-xl object-cover" /> : <span className="text-lg font-black text-primary">{community.name[0].toUpperCase()}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <Link to={`/communities/${community._id}`} className="text-sm font-black text-textPrimary hover:text-primary transition-colors block truncate">
                                    {community.name}
                                </Link>
                                <p className="text-xs text-textSecondary mt-0.5 line-clamp-2">{community.description || 'Açıklama yok.'}</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-[10px] text-textSecondary flex items-center gap-1"><Users className="w-3 h-3" /> {community.memberCount} üye</span>
                                    {isAuthenticated && (
                                        <button
                                            onClick={() => joinMutation.mutate(community._id)}
                                            disabled={joinMutation.isPending}
                                            className="text-[10px] font-black text-primary hover:underline"
                                        >
                                            Katıl
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {data?.data?.length === 0 && (
                        <div className="col-span-2 py-20 text-center text-textSecondary italic">Topluluk bulunamadı.</div>
                    )}
                </div>
            )}
        </div>
    );
}
