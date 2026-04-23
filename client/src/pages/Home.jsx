import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  MessageSquare, 
  ArrowBigUp, 
  ArrowBigDown, 
  Share2, 
  MoreHorizontal,
  Clock
} from 'lucide-react';

export default function Home() {
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
      const res = await api.get('/questions');
      return res.data;
    }
  });

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
      {/* Create Post Card - Serious Mode */}
      <div className="bg-surface border border-border rounded-lg p-2 flex items-center gap-2 mb-6">
        <Link to="/ask" className="flex-1 bg-background hover:bg-surfaceHover border border-border rounded-md px-4 py-2 text-sm text-textSecondary transition-colors">
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
              className="bg-surface border border-border hover:border-textSecondary/30 rounded-md flex group transition-colors overflow-hidden cursor-pointer"
              onClick={(e) => {
                 if(e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
                   window.location.href = `/questions/${question._id}`;
                 }
              }}
            >
              {/* Vote Sidebar */}
              <div className="bg-surface2/30 w-12 flex flex-col items-center py-2 gap-1 border-r border-border/20">
                <button className="p-1 hover:bg-primary/10 hover:text-primary rounded text-textSecondary transition-colors">
                  <ArrowBigUp className="w-6 h-6" />
                </button>
                <span className="text-xs font-black">{question.score || 0}</span>
                <button className="p-1 hover:bg-indigo-400/10 hover:text-indigo-400 rounded text-textSecondary transition-colors">
                  <ArrowBigDown className="w-6 h-6" />
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 p-3 space-y-2">
                <div className="flex items-center gap-2 text-[10px] text-textSecondary font-medium uppercase tracking-wider">
                  <span className="text-primary font-bold">y/yazilim</span>
                  <span>•</span>
                  <span className="hover:underline cursor-pointer">u/{question.userId?.username || 'yazocial_user'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(question.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-textPrimary leading-tight group-hover:text-primary transition-colors tracking-tight">
                    {question.title}
                  </h2>
                  <p className="text-sm text-textSecondary line-clamp-3 leading-relaxed">
                    {question.body}
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button className="flex items-center gap-2 px-2 py-1.5 hover:bg-surfaceHover rounded text-xs font-black text-textSecondary transition-colors uppercase tracking-tighter">
                    <MessageSquare className="w-4 h-4" />
                    {question.answerCount || 0} Yorum
                  </button>
                  <button className="flex items-center gap-2 px-2 py-1.5 hover:bg-surfaceHover rounded text-xs font-black text-textSecondary transition-colors uppercase tracking-tighter">
                    <Share2 className="w-4 h-4" />
                    Paylaş
                  </button>
                  <button className="p-1.5 hover:bg-surfaceHover rounded text-textSecondary ml-auto">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
