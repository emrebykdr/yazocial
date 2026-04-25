import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import { api } from '../services/api';
import { useAuthStore } from '../store/auth.store';
import { ChevronLeft, ChevronUp, ChevronDown, MessageSquare, Send, Trash2, Loader2, User, Clock } from 'lucide-react';

function CommentItem({ comment, postId, currentUser, onDelete }) {
    const queryClient = useQueryClient();
    const [replyOpen, setReplyOpen] = useState(false);
    const [replyText, setReplyText] = useState('');

    const { data: repliesData } = useQuery({
        queryKey: ['post-comment-replies', comment._id],
        queryFn: () => api.get(`/posts/${postId}/comments`).then(() => []),
        enabled: false
    });

    const replyMutation = useMutation({
        mutationFn: (content) => api.post(`/posts/${postId}/comments`, { content, parentId: comment._id }).then(r => r.data.data),
        onSuccess: () => {
            queryClient.invalidateQueries(['post-comments', postId]);
            setReplyText('');
            setReplyOpen(false);
        }
    });

    const canDelete = currentUser && (currentUser._id === comment.userId?._id || currentUser.role === 'admin');

    return (
        <div className="space-y-3">
            <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-surface2 border border-border flex items-center justify-center text-xs font-black text-primary flex-shrink-0 overflow-hidden">
                    {comment.userId?.avatarUrl ? <img src={comment.userId.avatarUrl} className="w-full h-full object-cover" alt="" /> : (comment.userId?.username?.[0] || '?').toUpperCase()}
                </div>
                <div className="flex-1 bg-surface2/30 rounded-xl px-4 py-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-textPrimary">{comment.userId?.username}</span>
                            <span className="text-[10px] text-textSecondary flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setReplyOpen(v => !v)} className="text-[10px] text-textSecondary hover:text-primary transition-colors font-bold">
                                Yanıtla
                            </button>
                            {canDelete && (
                                <button onClick={() => onDelete(comment._id)} className="p-1 text-textSecondary hover:text-danger transition-colors" aria-label="Sil">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                    <p className="text-sm text-textSecondary leading-relaxed">{comment.content}</p>
                </div>
            </div>

            {replyOpen && (
                <div className="ml-11 flex gap-2">
                    <input
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Yanıtını yaz..."
                        className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                    />
                    <button onClick={() => replyMutation.mutate(replyText)} disabled={!replyText.trim() || replyMutation.isPending}
                        className="px-3 py-2 bg-primary hover:bg-primaryHover text-white rounded-xl text-xs font-black disabled:opacity-50 transition-colors">
                        {replyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
            )}
        </div>
    );
}

export default function PostDetail() {
    const { postId } = useParams();
    const { isAuthenticated, user } = useAuthStore();
    const queryClient = useQueryClient();
    const [commentText, setCommentText] = useState('');
    const [score, setScore] = useState(null);

    const { data: post, isLoading } = useQuery({
        queryKey: ['post', postId],
        queryFn: () => api.get(`/posts/${postId}`).then(r => { setScore(r.data.data.voteScore || 0); return r.data.data; })
    });

    const { data: commentsData, isLoading: commentsLoading } = useQuery({
        queryKey: ['post-comments', postId],
        queryFn: () => api.get(`/posts/${postId}/comments`).then(r => r.data)
    });

    const voteMutation = useMutation({
        mutationFn: (type) => api.post(`/posts/${postId}/vote`, { type }).then(r => r.data),
        onSuccess: (data) => setScore(data.voteScore)
    });

    const commentMutation = useMutation({
        mutationFn: (content) => api.post(`/posts/${postId}/comments`, { content }).then(r => r.data.data),
        onSuccess: () => {
            queryClient.invalidateQueries(['post-comments', postId]);
            queryClient.invalidateQueries(['post', postId]);
            setCommentText('');
        }
    });

    const deleteCommentMutation = useMutation({
        mutationFn: (commentId) => api.delete(`/posts/${postId}/comments/${commentId}`),
        onSuccess: () => queryClient.invalidateQueries(['post-comments', postId])
    });

    if (isLoading) return <div className="h-96 bg-surface/50 animate-pulse rounded-2xl" />;
    if (!post) return <div className="text-center py-20 text-textSecondary">Gönderi bulunamadı.</div>;

    const currentScore = score ?? post.voteScore ?? 0;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Helmet>
                <title>{post.title} — {post.communityId?.name} · Yazocial</title>
                <meta name="description" content={post.content?.slice(0, 160)} />
            </Helmet>

            <Link
                to={`/communities/${post.communityId?._id || post.communityId}`}
                className="inline-flex items-center gap-2 text-xs font-black text-textSecondary hover:text-primary transition-colors uppercase tracking-widest"
            >
                <ChevronLeft className="w-4 h-4" />
                {post.communityId?.name || 'Topluluğa Dön'}
            </Link>

            {/* Post */}
            <div className="bg-surface border border-border rounded-2xl p-6 space-y-5">
                <div className="flex gap-5">
                    {/* Vote */}
                    <div className="flex flex-col items-center gap-1.5 pt-1">
                        <button onClick={() => isAuthenticated && voteMutation.mutate('up')} disabled={!isAuthenticated}
                            className="p-2 hover:bg-primary/10 hover:text-primary rounded-xl text-textSecondary transition-colors disabled:opacity-30" aria-label="Beğen">
                            <ChevronUp className="w-5 h-5" />
                        </button>
                        <span className={`text-base font-black ${currentScore > 0 ? 'text-primary' : currentScore < 0 ? 'text-danger' : 'text-textSecondary'}`}>
                            {currentScore}
                        </span>
                        <button onClick={() => isAuthenticated && voteMutation.mutate('down')} disabled={!isAuthenticated}
                            className="p-2 hover:bg-danger/10 hover:text-danger rounded-xl text-textSecondary transition-colors disabled:opacity-30" aria-label="Beğenme">
                            <ChevronDown className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-4">
                        <h1 className="text-2xl font-black tracking-tighter text-textPrimary leading-tight">{post.title}</h1>

                        <div className="flex items-center gap-4 text-xs text-textSecondary">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-surface2 border border-border flex items-center justify-center text-[10px] font-black text-primary overflow-hidden">
                                    {post.userId?.avatarUrl ? <img src={post.userId.avatarUrl} className="w-full h-full object-cover" alt="" /> : (post.userId?.username?.[0] || '?').toUpperCase()}
                                </div>
                                <span className="font-bold">u/{post.userId?.username}</span>
                            </div>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(post.createdAt).toLocaleDateString('tr-TR')}</span>
                            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{post.commentCount} yorum</span>
                        </div>

                        <div className="prose prose-invert prose-sm max-w-none prose-a:text-primary border-t border-border/30 pt-4">
                            <ReactMarkdown>{post.content}</ReactMarkdown>
                        </div>
                    </div>
                </div>
            </div>

            {/* Yorumlar */}
            <div className="space-y-5">
                <h2 className="text-base font-black flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    {commentsData?.pagination?.total || commentsData?.data?.length || 0} Yorum
                </h2>

                {/* Yorum yaz */}
                {isAuthenticated ? (
                    <div className="flex gap-3">
                        <div className="w-9 h-9 rounded-full bg-surface2 border border-border flex items-center justify-center text-xs font-black text-primary flex-shrink-0 overflow-hidden">
                            {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" /> : <User className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 space-y-2">
                            <textarea
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                rows={3}
                                placeholder="Yorumunuzu yazın..."
                                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-textPrimary outline-none focus:border-primary transition-colors resize-none"
                            />
                            <div className="flex justify-end">
                                <button
                                    onClick={() => commentMutation.mutate(commentText)}
                                    disabled={!commentText.trim() || commentMutation.isPending}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primaryHover text-white text-xs font-black rounded-xl disabled:opacity-50 transition-colors"
                                >
                                    {commentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Yorum Yap
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-surface border border-border rounded-xl p-5 text-center space-y-2">
                        <p className="text-sm text-textSecondary">Yorum yapmak için giriş yapın.</p>
                        <Link to="/login" className="inline-block px-5 py-2 bg-primary hover:bg-primaryHover text-white text-xs font-black rounded-xl transition-colors">Giriş Yap</Link>
                    </div>
                )}

                {/* Yorum listesi */}
                {commentsLoading
                    ? [...Array(3)].map((_, i) => <div key={i} className="h-16 bg-surface animate-pulse rounded-xl" />)
                    : (commentsData?.data || []).length === 0
                        ? <div className="py-12 text-center text-textSecondary text-sm italic bg-surface/30 rounded-xl border border-dashed border-border/50">İlk yorumu sen yap!</div>
                        : (commentsData.data || []).map(comment => (
                            <CommentItem
                                key={comment._id}
                                comment={comment}
                                postId={postId}
                                currentUser={user}
                                onDelete={(cid) => deleteCommentMutation.mutate(cid)}
                            />
                        ))
                }
            </div>
        </div>
    );
}
