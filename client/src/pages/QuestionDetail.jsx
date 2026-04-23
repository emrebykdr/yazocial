import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/auth.store';
import { MessageSquare, ThumbsUp, User, Clock, Loader2, Send } from 'lucide-react';

export default function QuestionDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { isAuthenticated, user: currentUser } = useAuthStore();
  const [answerBody, setAnswerBody] = useState('');

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

  if (isLoading) return <div className="text-center py-20 text-textSecondary animate-pulse text-lg">Yükleniyor...</div>;
  if (isError) return <div className="text-center py-20 text-danger">Soru bulunamadı veya bir hata oluştu.</div>;

  const question = response?.data;
  const answers = question?.answers || [];

  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    if (!answerBody.trim()) return;
    answerMutation.mutate({ questionId: id, body: answerBody });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Soru Bölümü */}
      <section className="space-y-4">
        <h1 className="text-3xl font-bold text-textPrimary leading-tight">{question.title}</h1>
        
        <div className="flex items-center gap-4 text-sm text-textSecondary border-b border-border pb-4">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{new Date(question.createdAt).toLocaleDateString('tr-TR')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            <span className="text-primary font-medium">{question.userId?.username || 'yazociol_user'}</span>
          </div>
        </div>

        <div className="text-textPrimary leading-relaxed text-lg whitespace-pre-wrap pt-2">
          {question.body}
        </div>

        <div className="flex gap-2 pt-4">
          {question.tags?.map((tag, idx) => (
            <span key={idx} className="bg-surface2 px-3 py-1 rounded-full text-xs text-textSecondary border border-border">
              #{tag.name || 'yazılım'}
            </span>
          ))}
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
                <div className="flex items-center gap-1.5 text-textSecondary bg-surface2 px-3 py-1 rounded-full text-sm">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{answer.score || 0}</span>
                </div>
              </div>
              <div className="text-textPrimary leading-relaxed whitespace-pre-wrap">
                {answer.body}
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
