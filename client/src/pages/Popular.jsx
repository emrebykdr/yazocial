import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../services/api';
import { TrendingUp, MessageSquare, ChevronUp, ChevronDown, Clock, Tag } from 'lucide-react';

export default function Popular() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('questions');

  // Popüler Sorular (En çok oy alan ve cevaplanan)
  const { data: popularQuestionsRes, isLoading: isLoadingQuestions } = useQuery({
    queryKey: ['popular-questions'],
    queryFn: async () => {
      const res = await api.get('/questions?limit=10&sort=-voteScore,-answerCount');
      return res.data;
    }
  });

  // Popüler Etiketler (En çok kullanılan)
  const { data: popularTagsRes, isLoading: isLoadingTags } = useQuery({
    queryKey: ['popular-tags-page'],
    queryFn: async () => {
      const res = await api.get('/tags?limit=20&sort=-usageCount');
      return res.data;
    }
  });

  const questions = popularQuestionsRes?.data || [];
  const tags = popularTagsRes?.data || [];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Popüler İçerikler · Yazocial</title>
        <meta name="description" content="Yazocial'daki en popüler sorular ve trend etiketler." />
      </Helmet>
      <div className="flex items-center gap-3 bg-surface p-4 rounded-2xl border border-border">
        <TrendingUp className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-black tracking-tight">Popüler İçerikler</h1>
      </div>

      <div className="flex gap-4 border-b border-border pb-2">
        <button 
          onClick={() => setActiveTab('questions')}
          className={`pb-2 px-1 font-bold text-sm transition-colors ${activeTab === 'questions' ? 'text-primary border-b-2 border-primary' : 'text-textSecondary hover:text-textPrimary'}`}
        >
          Popüler Sorular
        </button>
        <button 
          onClick={() => setActiveTab('tags')}
          className={`pb-2 px-1 font-bold text-sm transition-colors ${activeTab === 'tags' ? 'text-primary border-b-2 border-primary' : 'text-textSecondary hover:text-textPrimary'}`}
        >
          Trend Etiketler
        </button>
      </div>

      {activeTab === 'questions' && (
        <div className="space-y-4">
          {isLoadingQuestions ? (
            <div className="text-center py-10 text-textSecondary animate-pulse">Yükleniyor...</div>
          ) : questions.length === 0 ? (
            <div className="text-center py-10 text-textSecondary italic">Henüz soru bulunmuyor.</div>
          ) : (
            questions.map(question => (
              <article 
                key={question._id} 
                className="bg-surface border border-border hover:border-primary/50 rounded-2xl flex flex-col p-5 group transition-all duration-300 cursor-pointer shadow-sm"
                onClick={() => navigate(`/questions/${question._id}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-[10px] text-textSecondary font-medium uppercase tracking-widest">
                    <span className="text-primary font-bold">GENEL</span>
                    <span>•</span>
                    <span className="hover:underline">u/{question.userId?.username || 'yazocial_user'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-textSecondary font-medium uppercase">
                    <Clock className="w-3 h-3" />
                    {new Date(question.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <h2 className="text-xl font-bold text-textPrimary leading-tight group-hover:text-primary transition-colors tracking-tight font-sans">
                    {question.title}
                  </h2>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-1 bg-surface2/50 rounded-full border border-border/50 px-2 py-0.5">
                    <ChevronUp className="w-4 h-4 text-primary" />
                    <span className="text-xs font-black text-textPrimary">{question.voteScore || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-surface2/50 border border-border/50 rounded-full text-xs font-black text-textSecondary uppercase tracking-tighter">
                    <MessageSquare className="w-4 h-4" />
                    {question.answerCount || 0} Cevap
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {activeTab === 'tags' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {isLoadingTags ? (
            <div className="col-span-full text-center py-10 text-textSecondary animate-pulse">Yükleniyor...</div>
          ) : tags.length === 0 ? (
            <div className="col-span-full text-center py-10 text-textSecondary italic">Etiket bulunamadı.</div>
          ) : (
            tags.map(tag => (
              <Link 
                key={tag._id} 
                to={`/explore?q=${tag.name}`}
                className="bg-surface border border-border hover:border-primary/50 hover:bg-surfaceHover p-4 rounded-2xl flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-textSecondary group-hover:text-primary transition-colors" />
                  <span className="font-bold text-textPrimary group-hover:text-primary transition-colors">#{tag.name}</span>
                </div>
                <span className="text-xs font-black text-textSecondary bg-surface2 px-2 py-1 rounded-full">
                  {tag.usageCount || 0}
                </span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
