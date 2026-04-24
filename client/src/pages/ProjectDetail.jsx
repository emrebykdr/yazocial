import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { api } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  Github, 
  ExternalLink, 
  User, 
  Calendar, 
  Briefcase,
  ChevronLeft,
  Layout,
  Code2,
  Cpu
} from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams();

  const { data: response, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const res = await api.get(`/projects/${id}`);
      return res.data.data;
    }
  });

  if (isLoading) return <div className="h-screen bg-surface/50 animate-pulse rounded-xl" />;
  if (!response) return <div className="text-center py-20">Proje bulunamadı.</div>;

  const project = response;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Link to="/projects" className="inline-flex items-center gap-2 text-xs font-black text-textSecondary hover:text-primary transition-colors uppercase tracking-widest">
        <ChevronLeft className="w-4 h-4" /> VİTRİNE DÖN
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-textPrimary tracking-tighter uppercase leading-none">{project.name || project.title}</h1>
            <p className="text-lg text-textSecondary leading-relaxed">{project.description}</p>
          </div>

          <Card className="p-0 overflow-hidden border-border/50">
            <div className="bg-surface2/30 px-6 py-3 border-b border-border/30 flex items-center gap-2">
              <Layout className="w-4 h-4 text-primary" />
              <span className="text-xs font-black uppercase tracking-widest text-textSecondary">Proje Detayları</span>
            </div>
            <div className="p-8 prose prose-invert max-w-none prose-headings:tracking-tighter prose-a:text-primary">
               {project.body ? <ReactMarkdown>{project.body}</ReactMarkdown> : <p className="italic opacity-50">Bu proje için detaylı bir açıklama girilmemiş.</p>}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-6 bg-primary/5 border-primary/20">
             <div className="space-y-4">
                <Button className="w-full flex items-center justify-center gap-2" onClick={() => project.liveUrl && window.open(project.liveUrl)}>
                  <ExternalLink className="w-4 h-4" /> CANLI ÖNİZLEME
                </Button>
                <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={() => project.githubUrl && window.open(project.githubUrl)}>
                  <Github className="w-4 h-4" /> GITHUB REPOSU
                </Button>
             </div>
          </Card>

          <Card className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-textSecondary uppercase tracking-widest flex items-center gap-2">
                <Code2 className="w-4 h-4 text-primary" /> TEKNOLOJİLER
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies?.map(tech => (
                  <span key={tech} className="px-3 py-1 bg-surface2 text-textPrimary text-xs font-bold rounded-md border border-border">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="h-px bg-border/30" />

            <div className="space-y-4">
              <h3 className="text-xs font-black text-textSecondary uppercase tracking-widest flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> GELİŞTİRİCİ
              </h3>
              <Link to={`/users/${project.userId?._id}`} className="flex items-center gap-3 p-3 bg-surface2/50 rounded-xl hover:bg-surfaceHover transition-colors border border-border/30 group">
                <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden">
                  {project.userId?.avatarUrl ? <img src={project.userId.avatarUrl} className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-textSecondary" />}
                </div>
                <div>
                  <p className="text-sm font-black text-textPrimary uppercase tracking-tighter group-hover:text-primary transition-colors">{project.userId?.username}</p>
                  <p className="text-[10px] font-bold text-textSecondary uppercase tracking-widest italic">{project.userId?.reputation || 0} İTİBAR</p>
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
