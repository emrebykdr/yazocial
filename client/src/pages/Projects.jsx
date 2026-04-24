import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  Briefcase, 
  Github, 
  ExternalLink, 
  Star, 
  Plus,
  User
} from 'lucide-react';

export default function Projects() {
  const navigate = useNavigate();
  const { data: response, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/projects');
      return res.data.data;
    }
  });

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">{[1,2,3,4].map(i => <div key={i} className="h-64 bg-surface rounded-xl" />)}</div>;

  const projects = response || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tighter text-textPrimary uppercase text-primary">Vitrin</h1>
          <p className="text-xs font-bold text-textSecondary uppercase tracking-widest">Topluluk tarafından geliştirilen projeler</p>
        </div>
        <Link to="/projects/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> PROJE PAYLAŞ
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {projects.length === 0 ? (
          <div className="col-span-full py-20 text-center text-textSecondary text-sm italic bg-surface rounded-xl border border-border">
            "Henüz hiçbir proje paylaşılmamış..."
          </div>
        ) : (
          projects.map((project) => (
            <Card key={project._id} onClick={() => navigate(`/projects/${project._id}`)} className="cursor-pointer group hover:border-primary/50 transition-all flex flex-col md:flex-row p-0 overflow-hidden">
               {/* Project Image Placeholder */}
               <div className="h-40 md:h-auto md:w-56 bg-surface2/50 flex items-center justify-center border-b md:border-b-0 md:border-r border-border/30 shrink-0">
                 <Briefcase className="w-12 h-12 text-textSecondary/20" />
               </div>
               
               <div className="flex flex-col flex-1">
                 <div className="p-6 space-y-4 flex-1">
                 <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-textPrimary tracking-tighter uppercase group-hover:text-primary transition-colors">
                      {project.name || project.title}
                    </h2>
                    <div className="flex items-center gap-2">
                      {project.githubUrl && <a href={project.githubUrl} target="_blank" onClick={(e) => e.stopPropagation()} className="p-1.5 hover:bg-surfaceHover rounded-md text-textSecondary hover:text-textPrimary transition-colors"><Github className="w-4 h-4" /></a>}
                      {project.liveUrl && <a href={project.liveUrl} target="_blank" onClick={(e) => e.stopPropagation()} className="p-1.5 hover:bg-surfaceHover rounded-md text-textSecondary hover:text-textPrimary transition-colors"><ExternalLink className="w-4 h-4" /></a>}
                    </div>
                 </div>
                 <p className="text-sm text-textSecondary line-clamp-3 leading-relaxed">
                   {project.description}
                 </p>
                 <div className="flex flex-wrap gap-2 pt-2">
                    {project.technologies?.slice(0, 3).map(tech => (
                      <span key={tech} className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-black rounded uppercase tracking-tighter border border-primary/10">{tech}</span>
                    ))}
                    {project.tags?.map(tag => (
                      <span key={tag._id} className="px-2 py-0.5 bg-surface2 text-textSecondary text-[10px] font-black rounded uppercase tracking-tighter border border-border">#{tag.name}</span>
                    ))}
                 </div>
               </div>

               <div className="px-6 py-4 bg-surface2/20 border-t border-border/30 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden">
                      {project.userId?.avatarUrl ? <img src={project.userId.avatarUrl} className="w-full h-full object-cover" /> : <User className="w-3 h-3 text-textSecondary" />}
                    </div>
                    <span className="text-[10px] font-black text-textSecondary uppercase tracking-widest">{project.userId?.username}</span>
                  </div>
                  <Button variant="outline" className="text-[10px] px-3 py-1">DETAYLAR</Button>
               </div>
             </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
