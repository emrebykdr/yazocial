import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/auth.store';
import { MessageSquare, ThumbsUp, User, Clock, Loader2, Send, ChevronUp, ChevronDown, Share2, Trash2, MoreHorizontal, Bookmark } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function QuestionDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isAuthenticated, user: currentUser } = useAuthStore();
  const [answerBody, setAnswerBody] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/bookmarks', { postId: id, postType: 'Questions' });
      return res.data;
    },
    onSuccess: (data) => setBookmarked(data.bookmarked)
  });

  React.useEffect(() => {
    if (!isAuthenticated || !id) return;
    api.get(`/bookmarks/check?postId=${id}&postType=Questions`)
      .then(res => setBookmarked(res.data.bookmarked))
      .catch(() => {});
  }, [id, isAuthenticated]);

  // Soru ve Cevapları Getir
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['question', id],
    queryFn: async () => {
      const res = await api.get(`/questions/${id}`);
      return res.data;
    }
  });

  // Cevap Gönder
  const answerMutation = useMutation({
    mutationFn: async (newAnswer) => {
      const res = await api.post('/answers', newAnswer);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['question', id]);
      setAnswerBody('');
    }
  });

  // Oylama İşlemi
  const voteMutation = useMutation({
    mutationFn: async ({ postType, postId, voteType }) => {
      const res = await api.post('/votes', { postType, postId, voteType });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question', id] });
    }
  });

  // Soru Silme İşlemi
  const deleteQuestionMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/questions/${id}`);
    },
    onSuccess: () => {
      navigate('/');
    }
  });

  // Cevap Silme İşlemi
  const deleteAnswerMutation = useMutation({
    mutationFn: async (answerId) => {
      await api.delete(`/answers/${answerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question', id] });
    }
  });

  const handleVote = (e, postType, postId, voteType) => {
    e.stopPropagation();
    if (!isAuthenticated) return alert("Oylama yapmak için giriş yapmalısınız.");
    voteMutation.mutate({ postType, postId, voteType });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Bağlantı kopyalandı!");
  };

  const handleDeleteQuestion = () => {
    if (window.confirm("Bu soruyu silmek istediğinize emin misiniz?")) {
      deleteQuestionMutation.mutate();
    }
  };

  const handleDeleteAnswer = (answerId) => {
    if (window.confirm("Bu cevabı silmek istediğinize emin misiniz?")) {
      deleteAnswerMutation.mutate(answerId);
    }
  };

  if (isLoading) return <div className="text-center py-20 text-textSecondary animate-pulse text-lg">Yükleniyor...</div>;
  if (isError) return <div className="text-center py-20 text-danger">Soru bulunamadı veya bir hata oluştu.</div>;

  const question = response?.data;
  const answers = question?.answers || [];



  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    setSubmitError('');
    if (answerBody.trim().length < 10) {
      setSubmitError('Cevabınız en az 10 karakter olmalıdır.');
      return;
    }
    answerMutation.mutate({ questionId: id, content: answerBody });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <Helmet>
        <title>{question.title} — Yazocial</title>
        <meta name="description" content={question.content?.slice(0, 160)} />
      </Helmet>
      {/* Soru Bölümü */}
      <section className="space-y-6">
        <h1 className="text-3xl font-bold text-textPrimary leading-tight font-sans tracking-tight">{question.title}</h1>
        
        <div className="flex items-center gap-6 text-xs text-textSecondary border-b border-border pb-6 uppercase tracking-widest font-bold">
          <div className="flex items-center gap-2 group cursor-default">
            <Clock className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
            <span>{new Date(question.createdAt).toLocaleDateString('tr-TR')}</span>
          </div>
          <div className="flex items-center gap-2 group cursor-pointer">
            <User className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
            <span className="hover:text-primary transition-colors">u/{question.userId?.username || 'yazociol_user'}</span>
          </div>
        </div>

        <div className="prose prose-invert max-w-none prose-headings:tracking-tighter prose-a:text-primary pt-2">
          <ReactMarkdown>{question.content}</ReactMarkdown>
        </div>

        <div className="flex gap-2 pt-4">
          {question.tags?.map((tag, idx) => (
            <span key={idx} className="bg-surface2 px-3 py-1 rounded-full text-xs text-textSecondary border border-border uppercase tracking-tighter font-black">
              #{tag.name || 'yazılım'}
            </span>
          ))}
        </div>

        {/* Question Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-border/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-surface2/50 rounded-full border border-border/50 px-1 py-0.5">
              <button onClick={(e) => handleVote(e, 'Questions', question._id, 'Up')} className="p-1.5 hover:bg-primary/20 hover:text-primary rounded-full text-textSecondary transition-colors">
                <ChevronUp className="w-4 h-4" />
              </button>
              <span className="text-xs font-black text-textPrimary min-w-[20px] text-center">{question.voteScore || 0}</span>
              <button onClick={(e) => handleVote(e, 'Questions', question._id, 'Down')} className="p-1.5 hover:bg-danger/20 hover:text-danger rounded-full text-textSecondary transition-colors">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-surface2/50 border border-border/50 rounded-full text-xs font-black text-textSecondary uppercase tracking-tighter cursor-default">
              <MessageSquare className="w-4 h-4" />
              {question.answerCount || 0}
            </button>

            {isAuthenticated && (
              <button
                onClick={() => bookmarkMutation.mutate()}
                disabled={bookmarkMutation.isPending}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border transition-colors ${bookmarked ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-surface2/50 border-border/50 text-textSecondary hover:text-primary hover:border-primary/40'}`}
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                {bookmarked ? 'Kaydedildi' : 'Kaydet'}
              </button>
            )}
          </div>

          <div 
            className="flex items-center gap-2 relative"
            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpenMenuId(null); }}
          >
            <button 
              onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === 'question' ? null : 'question'); }}
              className="p-2 hover:bg-surfaceHover rounded-full text-textSecondary transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {openMenuId === 'question' && (
              <div className="absolute bottom-full right-0 mb-2 w-36 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-20 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <button 
                  onClick={() => { setOpenMenuId(null); handleShare(); }} 
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold hover:bg-surfaceHover text-textSecondary hover:text-primary transition-colors text-left"
                >
                  <Share2 className="w-4 h-4" />
                  Paylaş
                </button>
                {isAuthenticated && (currentUser?.role === 'admin' || currentUser?._id === question.userId?._id) && (
                  <button 
                    onClick={() => { setOpenMenuId(null); handleDeleteQuestion(); }} 
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
      </section>

      {/* Cevaplar Bölümü */}
      <section className="space-y-6 pt-8 border-t border-border">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          {answers.length} Cevap
        </h2>

        <div className="space-y-6">
          {answers.map((answer) => (
            <div key={answer._id} className="bg-surface border border-border rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-surface2 rounded-full flex items-center justify-center text-primary font-bold">
                    {answer.userId?.username?.[0].toUpperCase() || 'Y'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{answer.userId?.username || 'yazociol_user'}</div>
                    <div className="text-xs text-textSecondary">
                      {new Date(answer.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-surface2/50 rounded-full border border-border/50 px-1 py-0.5">
                    <button onClick={(e) => handleVote(e, 'Answers', answer._id, 'Up')} className="p-1 hover:bg-primary/20 hover:text-primary rounded-full text-textSecondary transition-colors">
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-black text-textPrimary min-w-[20px] text-center">{answer.voteScore || answer.score || 0}</span>
                    <button onClick={(e) => handleVote(e, 'Answers', answer._id, 'Down')} className="p-1 hover:bg-danger/20 hover:text-danger rounded-full text-textSecondary transition-colors">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  {isAuthenticated && (currentUser?.role === 'admin' || currentUser?._id === answer.userId?._id) && (
                    <div 
                      className="relative"
                      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpenMenuId(null); }}
                    >
                      <button 
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === answer._id ? null : answer._id); }}
                        className="p-1.5 hover:bg-surfaceHover rounded-full text-textSecondary transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {openMenuId === answer._id && (
                        <div className="absolute top-full right-0 mt-2 w-32 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                          <button 
                            onClick={() => { setOpenMenuId(null); handleDeleteAnswer(answer._id); }} 
                            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold hover:bg-danger/10 text-danger transition-colors text-left"
                          >
                            <Trash2 className="w-4 h-4" />
                            Sil
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="prose prose-invert prose-sm max-w-none prose-a:text-primary pl-11">
                <ReactMarkdown>{answer.content}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cevap Yaz Bölümü */}
      {isAuthenticated ? (
        <section className="pt-10 space-y-4">
          <h3 className="text-lg font-bold">Cevabınız</h3>
          <form onSubmit={handleAnswerSubmit} className="space-y-4">
            <textarea
              className="w-full bg-surface border border-border rounded-2xl p-4 text-textPrimary focus:border-primary outline-none min-h-[150px] transition-colors resize-none"
              placeholder="Çözümünüzü veya fikrinizi buraya yazın..."
              value={answerBody}
              onChange={(e) => setAnswerBody(e.target.value)}
            />
            {submitError && (
              <div className="text-danger text-xs font-bold animate-pulse">
                {submitError}
              </div>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={answerMutation.isPending || !answerBody.trim()}
                className="bg-primary hover:bg-primaryHover text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {answerMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Cevapla
              </button>
            </div>
          </form>
        </section>
      ) : (
        <div className="bg-surface2 border border-border rounded-2xl p-8 text-center space-y-4 mt-10">
          <p className="text-textSecondary">Cevap yazabilmek için giriş yapmalısınız.</p>
          <Link to="/login" className="inline-block bg-primary text-white px-6 py-2 rounded-lg font-medium">Giriş Yap</Link>
        </div>
      )}
    </div>
  );
}
