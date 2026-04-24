import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { api } from '../services/api';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Eye, Edit3, Send, AlertCircle, Image as ImageIcon } from 'lucide-react';
import TagInput from '../components/ui/TagInput';

export default function CreateArticle() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [manualTags, setManualTags] = useState([]);
  const [extractedTags, setExtractedTags] = useState([]);
  const [mode, setMode] = useState('edit');
  const [error, setError] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  // Twitter tarzı hashtag ayıklama
  React.useEffect(() => {
    const hashtagRegex = /#([a-zA-Z0-9çğıöşüÇĞİÖŞÜ_]+)/g;
    const fromTitle = title.match(hashtagRegex) || [];
    const fromBody = body.match(hashtagRegex) || [];
    const allHashtags = [...fromTitle, ...fromBody].map(tag => tag.slice(1).toLowerCase());
    
    setExtractedTags([...new Set(allHashtags)]);
  }, [title, body]);

  const combinedTags = [...new Set([...manualTags, ...extractedTags])].slice(0, 5);

  const mutation = useMutation({
    mutationFn: async (newArticle) => {
      const res = await api.post('/articles', newArticle);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['articles']);
      navigate(`/articles/${data.data._id}`);
    },
    onError: (err) => {
      const backendError = err.response?.data?.error;
      const backendDetails = err.response?.data?.details;
      setError(backendDetails || backendError || 'Makale yayınlanırken bir hata oluştu.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.length < 5) return setError('Başlık en az 5 karakter olmalıdır.');
    if (body.length < 100) return setError('Makale içeriği en az 100 karakter olmalıdır.');
    
    mutation.mutate({ title, content: body, status: 'published', tags: combinedTags });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tighter text-textPrimary uppercase">Yeni Makale Oluştur</h1>
      </div>

      <Card className="p-0 overflow-hidden border-border/50">
        <form onSubmit={handleSubmit} className="divide-y divide-border/30">
          <div className="p-8 bg-surface2/10 space-y-6">
            <Input
              label="Makale Başlığı"
              placeholder="Göz alıcı bir başlık yaz..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent text-3xl font-black tracking-tighter"
            />
            <div className="flex items-center gap-4">
               <Button type="button" variant="outline" className="text-[10px] flex items-center gap-2">
                 <ImageIcon className="w-3.5 h-3.5" /> KAPAK RESMİ EKLE
               </Button>
               <span className="text-[10px] font-black text-textSecondary uppercase tracking-widest italic opacity-50">Kapak resmi özelliği yakında...</span>
            </div>
          </div>

          <div className="px-6 py-3 bg-surface2/30 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMode('edit')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-black transition-colors ${mode === 'edit' ? 'bg-primary text-white' : 'text-textSecondary hover:bg-surfaceHover'}`}
            >
              <Edit3 className="w-4 h-4" />
              DÜZENLE
            </button>
            <button
              type="button"
              onClick={() => setMode('preview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-black transition-colors ${mode === 'preview' ? 'bg-primary text-white' : 'text-textSecondary hover:bg-surfaceHover'}`}
            >
              <Eye className="w-4 h-4" />
              ÖNİZLEME
            </button>
          </div>

          <div className="min-h-[500px]">
            {mode === 'edit' ? (
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Makale içeriğini buraya yaz. Markdown desteği ile zenginleştirebilirsin..."
                className="w-full min-h-[500px] p-8 bg-transparent text-textPrimary placeholder:text-textSecondary/30 focus:outline-none resize-none leading-relaxed text-lg font-medium font-serif"
              />
            ) : (
              <div className="p-8 prose prose-invert prose-lg max-w-none prose-headings:tracking-tighter prose-a:text-primary font-serif">
                {body ? (
                   <ReactMarkdown>{body}</ReactMarkdown>
                ) : (
                   <p className="text-textSecondary italic italic">Önizlenecek bir içerik yok...</p>
                )}
              </div>
            )}
          </div>

          <div className="p-8 bg-surface2/5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-textSecondary uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                Makale Etiketleri
              </h3>
              <button 
                type="button"
                onClick={() => setShowTagInput(!showTagInput)}
                className="text-[10px] font-black text-primary hover:underline uppercase tracking-tighter"
              >
                {showTagInput ? 'MANUEL GİRİŞİ GİZLE' : 'MANUEL ETİKET EKLE'}
              </button>
            </div>
            
            {showTagInput && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <TagInput tags={manualTags} setTags={setManualTags} placeholder="Örn: rehber, ipucu, teknoloji..." />
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-2">
              {combinedTags.map(t => (
                <span key={t} className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded text-primary text-[10px] font-bold flex items-center gap-1">
                  #{t}
                  {showTagInput && manualTags.includes(t) && (
                    <button 
                      type="button" 
                      onClick={() => setManualTags(manualTags.filter(tag => tag !== t))}
                      className="hover:text-danger ml-1"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>

          <div className="p-6 bg-surface2/20 flex items-center justify-between gap-4">
            {error && (
              <div className="flex items-center gap-2 text-danger text-xs font-black uppercase tracking-widest">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}
            <div className="flex items-center gap-4 ml-auto">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/articles')}
                className="px-8"
              >
                İPTAL
              </Button>
              <Button 
                type="submit" 
                disabled={mutation.isPending}
                className="flex items-center gap-2 px-10"
              >
                <Send className="w-4 h-4" />
                {mutation.isPending ? 'YAYINLANIYOR...' : 'YAYINLA'}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
