import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../services/api';
import { useAuthStore } from '../store/auth.store';
import { getSocket } from '../services/socket';
import { Send, Search, MessageCircle, Loader2, ArrowLeft } from 'lucide-react';

function ConversationList({ activeId }) {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const { data } = useQuery({
        queryKey: ['conversations'],
        queryFn: () => api.get('/conversations').then(r => r.data.data)
    });

    const conversations = data || [];

    return (
        <div className="border-r border-border h-full flex flex-col">
            <div className="p-4 border-b border-border">
                <h2 className="text-sm font-black uppercase tracking-widest">Mesajlar</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 && (
                    <p className="text-center text-xs text-textSecondary italic p-6">Henüz sohbet yok.</p>
                )}
                {conversations.map(convo => {
                    const other = convo.participants?.find(p => p._id !== user?._id);
                    const isActive = convo._id === activeId;
                    return (
                        <button key={convo._id} onClick={() => navigate(`/messages/${convo._id}`)} className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-surfaceHover transition-colors text-left ${isActive ? 'bg-surface2' : ''}`}>
                            <div className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center font-bold text-primary flex-shrink-0 overflow-hidden border border-border">
                                {other?.avatarUrl ? <img src={other.avatarUrl} className="w-full h-full object-cover" /> : (other?.username?.[0] || '?').toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{other?.username || 'Kullanıcı'}</p>
                                <p className="text-xs text-textSecondary truncate">{convo.lastMessage || 'Mesaj yok'}</p>
                            </div>
                            {convo.lastMessageAt && (
                                <span className="text-[10px] text-textSecondary flex-shrink-0">
                                    {new Date(convo.lastMessageAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function MessageThread({ conversationId }) {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (!conversationId) return;
        setLoading(true);
        api.get(`/conversations/${conversationId}/messages`).then(r => {
            setMessages(r.data.data);
            setLoading(false);
        }).catch(() => setLoading(false));

        const socket = getSocket();
        if (socket) {
            socket.emit('join_dm', conversationId);
            socket.on('new_dm', (msg) => {
                setMessages(prev => [...prev, msg]);
                queryClient.invalidateQueries(['conversations']);
            });
        }
        return () => { if (socket) socket.off('new_dm'); };
    }, [conversationId]);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const sendMutation = useMutation({
        mutationFn: (content) => api.post(`/conversations/${conversationId}/messages`, { content }).then(r => r.data.data),
        onSuccess: (msg) => {
            setMessages(prev => [...prev, msg]);
            queryClient.invalidateQueries(['conversations']);
        }
    });

    const handleSend = () => {
        if (!input.trim()) return;
        sendMutation.mutate(input.trim());
        setInput('');
    };

    if (!conversationId) return (
        <div className="flex-1 flex items-center justify-center text-textSecondary">
            <div className="text-center space-y-3">
                <MessageCircle className="w-12 h-12 mx-auto opacity-20" />
                <p className="text-sm">Sol menüden bir sohbet seç.</p>
            </div>
        </div>
    );

    if (loading) return <div className="flex-1 bg-surface/50 animate-pulse" />;

    return (
        <div className="flex-1 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && <p className="text-center text-xs text-textSecondary italic py-10">Sohbet başlat!</p>}
                {messages.map((msg, i) => {
                    const isOwn = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                    return (
                        <div key={msg._id || i} className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                            <div className="w-7 h-7 rounded-full bg-surface2 flex items-center justify-center text-xs font-black text-primary flex-shrink-0 overflow-hidden border border-border">
                                {msg.senderId?.avatarUrl ? <img src={msg.senderId.avatarUrl} className="w-full h-full object-cover" /> : (msg.senderId?.username?.[0] || '?').toUpperCase()}
                            </div>
                            <div className={`max-w-[65%] flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                                <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${isOwn ? 'bg-primary text-white rounded-br-sm' : 'bg-surface2 text-textPrimary rounded-bl-sm'}`}>
                                    {msg.content}
                                </div>
                                <div className="flex items-center gap-2 px-1">
                                    <span className="text-[10px] text-textSecondary">{new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                                    {isOwn && <span className="text-[10px] text-textSecondary">{msg.isRead ? '✓✓' : '✓'}</span>}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>
            <div className="p-3 border-t border-border flex gap-2">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Mesaj yaz..."
                    className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                />
                <button onClick={handleSend} disabled={!input.trim() || sendMutation.isPending} className="p-2.5 bg-primary hover:bg-primaryHover text-white rounded-xl transition-colors disabled:opacity-40">
                    {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
}

export default function DirectMessages() {
    const { conversationId } = useParams();

    return (
        <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)]">
            <Helmet>
                <title>Mesajlar — Yazocial</title>
            </Helmet>
            <div className="bg-surface border border-border rounded-xl h-full flex overflow-hidden">
                <div className="w-72 flex-shrink-0">
                    <ConversationList activeId={conversationId} />
                </div>
                <MessageThread conversationId={conversationId} />
            </div>
        </div>
    );
}
