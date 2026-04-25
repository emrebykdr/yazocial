import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/auth.store';
import { 
  MessageSquare, 
  ChevronUp, 
  ChevronDown, 
  Share2, 
  Trash2,
  Clock,
  MoreHorizontal
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState(null);

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
      const res = await api.get('/questions');
      return res.data;
    }
  });

  const voteMutation = useMutation({
    mutationFn: async ({ postId, voteType }) => {
      const res = await api.post('/votes', { postType: 'Questions', postId, voteType });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    }
  });

  const handleVote = (e, postId, voteType) => {
    e.stopPropagation();
    if (!isAuthenticated) return alert("Oylama yapmak için giriş yapmalısınız.");
    voteMutation.mutate({ postId, voteType });
  };

  const handleShare = (e, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/questions/${id}`);
    alert("Bağlantı kopyalandı!");
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if(window.confirm("Bu soruyu silmek istediğinize emin misiniz?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-48 bg-surface/50 animate-pulse rounded-xl" />
      ))}
    </div>
  );

  if (isError) return <div className="text-center py-20 text-danger">Bağlantı hatası.</div>;

  const questions = response?.data || [];

  return (
    <div className="space-y-4">
      <Helmet>
        <title>Ana Sayfa — Yazocial</title>
        <meta name="description" content="Yazılımcıların bir araya geldiği soru-cevap ve makale platformu." />
      </Helmet>
      {/* Create Post Card - Serious Mode */}
      <div className="bg-surface border border-border rounded-xl p-3 flex items-center gap-3 mb-10 shadow-sm">
        <div className="w-8 h-8 bg-surface2 rounded-full flex items-center justify-center text-textSecondary overflow-hidden border border-border">
          {isAuthenticated && user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : <Clock className="w-4 h-4" />}
        </div>
        <Link to="/ask" className="flex-1 bg-surface2/50 hover:bg-surface2 border border-border rounded-lg px-4 py-2 text-sm text-textSecondary transition-all font-medium">
          Yeni bir konu başlat...
        </Link>
      </div>

      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="py-20 text-center text-textSecondary text-sm italic bg-surface rounded-xl border border-border">
            "Henüz hiçbir soru sorulmamış..."
          </div>
        ) : (
          questions.map((question) => (
            <article 
              key={question._id} 
              className="bg-surface border border-border hover:border-primary/50 rounded-2xl flex flex-col p-5 group transition-all duration-300 overflow-hidden cursor-pointer shadow-sm hover:shadow-md"
              onClick={() => navigate(`/questions/${question._id}`)}
            >
              {/* Top Info */}
              <div className="flex items-center gap-2 text-[10px] text-textSecondary font-medium uppercase tracking-widest mb-3">
                <span className="text-primary font-bold">GENEL</span>
                <span>•</span>
                <span className="hover:underline cursor-pointer" onClick={(e) => e.stopPropagation()}>u/{question.userId?.username || 'yazocial_user'}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(question.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>

              {/* Content Area */}
              <div className="space-y-2 mb-4">
                <h2 className="text-xl font-bold text-textPrimary leading-tight group-hover:text-primary transition-colors tracking-tight font-sans">
                  {question.title}
                </h2>
                <p className="text-sm text-textSecondary line-clamp-2 leading-relaxed">
                  {question.content}
                </p>
              </div>

              {/* Tags Display */}
              {question.tags && question.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {question.tags.map(tag => (
                    <Link 
                      key={tag._id}
                      to={`/explore?q=${tag.name}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] font-black text-textSecondary bg-surface2 px-2.5 py-1 rounded-md uppercase tracking-tighter hover:text-primary transition-colors"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="flex items-center gap-4">
                  {/* Vote System */}
                  <div className="flex items-center gap-1 bg-surface2/50 rounded-full border border-border/50 px-1 py-0.5">
                    <button onClick={(e) => handleVote(e, question._id, 'Up')} className="p-1.5 hover:bg-primary/20 hover:text-primary rounded-full text-textSecondary transition-colors">
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-black text-textPrimary min-w-[20px] text-center">{question.voteScore || 0}</span>
                    <button onClick={(e) => handleVote(e, question._id, 'Down')} className="p-1.5 hover:bg-danger/20 hover:text-danger rounded-full text-textSecondary transition-colors">
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-surface2/50 hover:bg-surfaceHover border border-border/50 rounded-full text-xs font-black text-textSecondary transition-colors uppercase tracking-tighter">
                    <MessageSquare className="w-4 h-4" />
                    {question.answerCount || 0}
                  </button>
                </div>

                <div 
                  className="flex items-center gap-2 relative"
                  onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpenMenuId(null); }}
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === question._id ? null : question._id); }}
                    className="p-2 hover:bg-surfaceHover rounded-full text-textSecondary transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>

                  {openMenuId === question._id && (
                    <div className="absolute bottom-full right-0 mb-2 w-36 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-20 animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <button 
                        onClick={(e) => { setOpenMenuId(null); handleShare(e, question._id); }} 
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold hover:bg-surfaceHover text-textSecondary hover:text-primary transition-colors text-left"
                      >
                        <Share2 className="w-4 h-4" />
                        Paylaş
                      </button>
                      {isAuthenticated && (user?.role === 'admin' || user?._id === question.userId?._id) && (
                        <button 
                          onClick={(e) => { setOpenMenuId(null); handleDelete(e, question._id); }} 
                          className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold hover:bg-danger/10 text-danger transition-colors text-left border-t border-border/50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Sil
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
