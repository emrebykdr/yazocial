import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  FileText, 
  Clock, 
  Eye, 
  MessageSquare, 
  Plus 
} from 'lucide-react';

export default function Articles() {
  const { data: response, isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      const res = await api.get('/articles');
      return res.data.data;
    }
  });

  if (isLoading) return <div className="space-y-4 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-40 bg-surface rounded-xl" />)}</div>;

  const articles = response || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tighter text-textPrimary uppercase">Makaleler</h1>
          <p className="text-xs font-bold text-textSecondary uppercase tracking-widest">En yeni teknik yazılar ve rehberler</p>
        </div>
        <Link to="/articles/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> MAKALE YAZ
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {articles.length === 0 ? (
          <div className="col-span-full py-20 text-center text-textSecondary text-sm italic bg-surface rounded-xl border border-border">
            "Henüz hiçbir makale yayınlanmamış..."
          </div>
        ) : (
          articles.map((article) => (
            <Link key={article._id} to={`/articles/${article._id}`}>
              <Card className="h-full hover:border-primary/50 transition-colors flex flex-col group">
                <div className="space-y-4 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-textSecondary font-black uppercase tracking-widest">
                    {article.tags && article.tags.length > 0 ? (
                      article.tags.map(tag => (
                        <span key={tag._id} className="text-primary">#{tag.name}</span>
                      ))
                    ) : (
                      <span className="text-primary">GENEL</span>
                    )}
                    <span>•</span>
                    <span>{new Date(article.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <h2 className="text-xl font-black text-textPrimary group-hover:text-primary transition-colors leading-tight tracking-tighter">
                    {article.title}
                  </h2>
                  <p className="text-sm text-textSecondary line-clamp-2 leading-relaxed">
                    {article.content}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 pt-6 border-t border-border/30 mt-auto">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-textSecondary">
                    <Eye className="w-3.5 h-3.5" /> {article.viewCount || 0}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-textSecondary">
                    <MessageSquare className="w-3.5 h-3.5" /> 0
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-surface2 border border-border flex items-center justify-center overflow-hidden">
                      {article.userId?.avatarUrl ? (
                         <img src={article.userId.avatarUrl} className="w-full h-full object-cover" />
                      ) : (
                         <span className="text-[10px] font-bold text-primary">
                           {article.userId?.username?.[0].toUpperCase() || 'Y'}
                         </span>
                      )}
                    </div>
                    <span className="text-[10px] font-black text-textSecondary uppercase tracking-tighter">
                      {article.userId?.username || 'yazar'}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
