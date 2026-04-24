import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { api } from '../services/api';
import Card from '../components/ui/Card';
import { 
  User, 
  Calendar, 
  Eye, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  ChevronLeft
} from 'lucide-react';

export default function ArticleDetail() {
  const { id } = useParams();

  const { data: response, isLoading } = useQuery({
    queryKey: ['article', id],
    queryFn: async () => {
      const res = await api.get(`/articles/${id}`);
      return res.data.data;
    }
  });

  if (isLoading) return <div className="h-screen bg-surface/50 animate-pulse rounded-xl" />;
  if (!response) return <div className="text-center py-20">Makale bulunamadı.</div>;

  const article = response;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link to="/articles" className="inline-flex items-center gap-2 text-xs font-black text-textSecondary hover:text-primary transition-colors uppercase tracking-widest">
        <ChevronLeft className="w-4 h-4" /> GERİ DÖN
      </Link>

      <div className="space-y-6">
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-black text-primary uppercase tracking-[4px]">
            {article.tags?.map(tag => <span key={tag._id}>{tag.name}</span>) || <span>TEKNOLOJİ</span>}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-textPrimary leading-[1.1] tracking-tighter">
            {article.title}
          </h1>
          <div className="flex items-center justify-center gap-6 pt-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-surface2 border-2 border-primary/20 flex items-center justify-center overflow-hidden">
                 {article.userId?.avatarUrl ? <img src={article.userId.avatarUrl} className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-textSecondary" />}
               </div>
               <div className="text-left">
                 <p className="text-sm font-black text-textPrimary uppercase tracking-tighter">{article.userId?.username}</p>
                 <p className="text-[10px] font-bold text-textSecondary uppercase">{new Date(article.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
               </div>
             </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <article className="prose prose-invert prose-lg max-w-none prose-headings:tracking-tighter prose-a:text-primary prose-img:rounded-2xl prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1 prose-code:rounded font-serif">
           <ReactMarkdown>{article.content}</ReactMarkdown>
        </article>

        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="flex items-center justify-between py-4">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-textSecondary">
                <Eye className="w-5 h-5" />
                <span className="text-sm font-black uppercase tracking-widest">{article.viewCount || 0} Görüntülenme</span>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-surface2 rounded-full text-textSecondary transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-surface2 rounded-full text-textSecondary transition-colors">
                <Bookmark className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-surface2 rounded-full text-textSecondary transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
