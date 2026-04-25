import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../services/api';
import { Bookmark, HelpCircle, FileText, Trash2, Clock, Loader2 } from 'lucide-react';

export default function Bookmarks() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('all');

    const { data, isLoading } = useQuery({
        queryKey: ['bookmarks'],
        queryFn: () => api.get('/bookmarks?limit=50').then(r => r.data)
    });

    const removeMutation = useMutation({
        mutationFn: (bookmarkId) => api.delete(`/bookmarks/${bookmarkId}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    });

    const bookmarks = data?.data || [];

    const filtered = activeTab === 'all'
        ? bookmarks
        : bookmarks.filter(b => b.postType === (activeTab === 'questions' ? 'Questions' : 'Articles'));

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Helmet>
                <title>Kaydedilenler · Yazocial</title>
                <meta name="description" content="Kaydettiğiniz sorular ve makaleler." />
            </Helmet>

            <div className="flex items-center gap-3 bg-surface p-5 rounded-2xl border border-border">
                <Bookmark className="w-6 h-6 text-primary fill-primary/20" />
                <h1 className="text-2xl font-black tracking-tight">Kaydedilenler</h1>
                {bookmarks.length > 0 && (
                    <span className="ml-auto text-xs font-black text-textSecondary bg-surface2 px-2 py-1 rounded-full border border-border">
                        {bookmarks.length}
                    </span>
                )}
            </div>

            <div className="flex gap-1 p-1 bg-surface border border-border rounded-xl">
                {[
                    { id: 'all', label: 'Tümü' },
                    { id: 'questions', label: 'Sorular', icon: HelpCircle },
                    { id: 'articles', label: 'Makaleler', icon: FileText },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-black transition-colors ${
                            activeTab === tab.id
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-textSecondary hover:text-textPrimary hover:bg-surfaceHover'
                        }`}
                    >
                        {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
                        {tab.label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-20 bg-surface animate-pulse rounded-xl border border-border" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-20 text-center space-y-3 bg-surface/30 rounded-2xl border border-dashed border-border/50">
                    <Bookmark className="w-10 h-10 text-textSecondary/40 mx-auto" />
                    <p className="text-textSecondary text-sm italic">
                        {activeTab === 'all' ? 'Henüz kaydedilen içerik yok.' : `Kaydedilen ${activeTab === 'questions' ? 'soru' : 'makale'} yok.`}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(bookmark => (
                        <BookmarkCard
                            key={bookmark._id}
                            bookmark={bookmark}
                            onRemove={() => removeMutation.mutate(bookmark._id)}
                            isRemoving={removeMutation.isPending && removeMutation.variables === bookmark._id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function BookmarkCard({ bookmark, onRemove, isRemoving }) {
    const isQuestion = bookmark.postType === 'Questions';
    const post = bookmark.postId;

    const href = isQuestion
        ? `/questions/${post?._id || bookmark.postId}`
        : `/articles/${post?._id || bookmark.postId}`;

    return (
        <div className="bg-surface border border-border rounded-xl p-4 flex items-start gap-4 hover:border-primary/30 transition-colors group">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isQuestion ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                {isQuestion ? <HelpCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>

            <div className="flex-1 min-w-0">
                <Link to={href} className="block text-sm font-bold text-textPrimary hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {post?.title || post?.name || 'İçerik yüklenemedi'}
                </Link>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-textSecondary font-bold uppercase tracking-wider">
                    <span className={isQuestion ? 'text-emerald-400' : 'text-blue-400'}>
                        {isQuestion ? 'SORU' : 'MAKALE'}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(bookmark.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                    {post?.userId?.username && (
                        <span>u/{post.userId.username}</span>
                    )}
                </div>
            </div>

            <button
                onClick={onRemove}
                disabled={isRemoving}
                aria-label="Kaydedileni kaldır"
                className="p-2 text-textSecondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
            >
                {isRemoving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
        </div>
    );
}
