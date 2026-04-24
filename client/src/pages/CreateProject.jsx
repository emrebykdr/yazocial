import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Send, AlertCircle, Github, ExternalLink, Code2, Plus, X } from 'lucide-react';
import TagInput from '../components/ui/TagInput';

export default function CreateProject() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    description: '',
    body: '',
    githubUrl: '',
    liveUrl: '',
    technologies: [],
    manualTags: []
  });
  const [extractedTags, setExtractedTags] = useState([]);
  const [techInput, setTechInput] = useState('');
  const [error, setError] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  // Twitter tarzı hashtag ayıklama
  React.useEffect(() => {
    const hashtagRegex = /#([a-zA-Z0-9çğıöşüÇĞİÖŞÜ_]+)/g;
    const fromName = formData.name.match(hashtagRegex) || [];
    const fromDesc = formData.description.match(hashtagRegex) || [];
    const fromBody = formData.body.match(hashtagRegex) || [];
    const allHashtags = [...fromName, ...fromDesc, ...fromBody].map(tag => tag.slice(1).toLowerCase());
    
    setExtractedTags([...new Set(allHashtags)]);
  }, [formData.name, formData.description, formData.body]);

  const combinedTags = [...new Set([...formData.manualTags, ...extractedTags])].slice(0, 5);

  const mutation = useMutation({
    mutationFn: async (newProject) => {
      const res = await api.post('/projects', newProject);
      return res.data;
    },
    onSuccess: (data) => {
      // React Query v5 API — object formatı zorunlu
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate(`/projects/${data.data._id}`);
    },
    onError: (err) => {
      const backendError = err.response?.data?.error;
      const backendDetails = err.response?.data?.details;
      setError(backendDetails || backendError || 'Proje paylaşılırken bir hata oluştu.');
    }
  });

  const handleAddTech = (e) => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault();
      if (!formData.technologies.includes(techInput.trim())) {
        setFormData({ ...formData, technologies: [...formData.technologies, techInput.trim()] });
      }
      setTechInput('');
    }
  };

  const removeTech = (tech) => {
    setFormData({ ...formData, technologies: formData.technologies.filter(t => t !== tech) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const projectName = formData.name.trim() || formData.title.trim();
    if (!projectName) return setError('Proje adı zorunludur.');
    if (formData.description.length < 10) return setError('Açıklama en az 10 karakter olmalıdır.');

    mutation.mutate({
      ...formData,
      // Backend modeli 'title' required bekliyor — name alanını title'a map'le
      title: projectName,
      name: projectName,
      tags: combinedTags,
      // liveUrl boşsa gönderme (opsiyonel)
      liveUrl: formData.liveUrl.trim() || undefined,
      githubUrl: formData.githubUrl.trim() || undefined,
      status: 'active'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tighter text-textPrimary uppercase">Projeni Vitrine Çıkar</h1>
      </div>

      <Card className="p-8 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Proje Adı"
                placeholder="Örn: Yazocial Social Media Platform"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="text-xl font-black tracking-tight"
              />
            </div>

            <div className="md:col-span-2">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-textSecondary ml-1">Kısa Açıklama</label>
                <textarea
                  placeholder="Projenin ne işe yaradığını kısaca anlat..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-surface2 border border-border rounded-md px-4 py-2.5 text-sm text-textPrimary focus:outline-none focus:border-primary transition-colors placeholder:text-textSecondary/50 resize-none h-24"
                />
              </div>
            </div>

            <Input
              label="GitHub Linki"
              placeholder="https://github.com/..."
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              icon={<Github className="w-4 h-4" />}
            />

            <Input
              label="Canlı Uygulama Linki (Opsiyonel)"
              placeholder="https://..."
              value={formData.liveUrl}
              onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
              icon={<ExternalLink className="w-4 h-4" />}
            />

            <div className="md:col-span-2">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-textSecondary ml-1">Teknolojiler</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.technologies.map(tech => (
                    <span key={tech} className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-xs font-black rounded-full border border-primary/20 uppercase tracking-tighter">
                      {tech}
                      <button type="button" onClick={() => removeTech(tech)}><X className="w-3 h-3 hover:text-danger transition-colors" /></button>
                    </span>
                  ))}
                </div>
                <Input
                  placeholder="Teknoloji yaz ve Enter'a bas... (Örn: React, Tailwind, Docker)"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={handleAddTech}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-textSecondary ml-1">Detaylı Açıklama (Opsiyonel)</label>
                <textarea
                  placeholder="Projenin mimarisi, kurulumu veya özellikleri hakkında detaylı bilgi ver (Markdown destekler)..."
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="w-full bg-surface2 border border-border rounded-md px-4 py-2.5 text-sm text-textPrimary focus:outline-none focus:border-primary transition-colors placeholder:text-textSecondary/50 min-h-[200px]"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-textSecondary ml-1">Proje Etiketleri</label>
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
                  <TagInput 
                    tags={formData.manualTags} 
                    setTags={(newTags) => setFormData({ ...formData, manualTags: newTags })} 
                    placeholder="Örn: open-source, web, mobil, kütüphane..." 
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-2">
                {combinedTags.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded text-primary text-[10px] font-bold flex items-center gap-1">
                    #{t}
                    {showTagInput && formData.manualTags.includes(t) && (
                      <button 
                        type="button" 
                        onClick={() => setFormData({ ...formData, manualTags: formData.manualTags.filter(tag => tag !== t) })}
                        className="hover:text-danger ml-1"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-border/30">
            {error && (
              <div className="flex items-center gap-2 text-danger text-xs font-black uppercase tracking-widest animate-pulse">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}
            <div className="flex items-center gap-4 ml-auto">
              <Button type="button" variant="outline" onClick={() => navigate('/projects')}>İPTAL</Button>
              <Button type="submit" disabled={mutation.isPending} className="flex items-center gap-2 px-8">
                <Plus className="w-4 h-4" />
                {mutation.isPending ? 'PAYLAŞILIYOR...' : 'ŞİMDİ PAYLAŞ'}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
