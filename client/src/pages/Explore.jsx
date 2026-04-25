import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { api } from '../services/api';
import { Compass, Search, Tag, User, HelpCircle, FileText, Briefcase, Clock, MessageSquare, ChevronUp } from 'lucide-react';

export default function Explore() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // URL'den q parametresini al
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) setSearchTerm(q);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate('/explore');
    }
  };

  const currentQuery = new URLSearchParams(location.search).get('q') || '';

  // Aramalar
  const { data: questionsRes, isLoading: loadingQuestions } = useQuery({
    queryKey: ['search-questions', currentQuery],
    queryFn: async () => {
      if (!currentQuery) return { data: [] };
      const res = await api.get(`/questions?search=${currentQuery}&limit=5`);
      return res.data;
    },
    enabled: !!currentQuery && (activeTab === 'all' || activeTab === 'questions')
  });

  const { data: usersRes, isLoading: loadingUsers } = useQuery({
    queryKey: ['search-users', currentQuery],
    queryFn: async () => {
      if (!currentQuery) return { data: [] };
      const res = await api.get(`/users?search=${currentQuery}&limit=5`);
      return res.data;
    },
    enabled: !!currentQuery && (activeTab === 'all' || activeTab === 'users')
  });

  const { data: tagsRes, isLoading: loadingTags } = useQuery({
    queryKey: ['search-tags', currentQuery],
    queryFn: async () => {
      if (!currentQuery) return { data: [] };
      const res = await api.get(`/tags?search=${currentQuery}&limit=10`);
      return res.data;
    },
    enabled: !!currentQuery && (activeTab === 'all' || activeTab === 'tags')
  });

  const { data: articlesRes, isLoading: loadingArticles } = useQuery({
    queryKey: ['search-articles', currentQuery],
    queryFn: async () => {
      if (!currentQuery) return { data: [] };
      const res = await api.get(`/articles?search=${currentQuery}&limit=5`);
      return res.data;
    },
    enabled: !!currentQuery && (activeTab === 'all' || activeTab === 'articles')
  });

  const { data: projectsRes, isLoading: loadingProjects } = useQuery({
    queryKey: ['search-projects', currentQuery],
    queryFn: async () => {
      if (!currentQuery) return { data: [] };
      const res = await api.get(`/projects?search=${currentQuery}&limit=5`);
      return res.data;
    },
    enabled: !!currentQuery && (activeTab === 'all' || activeTab === 'projects')
  });

  const questions = questionsRes?.data || [];
  const users = usersRes?.data || [];
  const tags = tagsRes?.data || [];
  const articles = articlesRes?.data || [];
  const projects = projectsRes?.data || [];

  const isSearching = loadingQuestions || loadingUsers || loadingTags || loadingArticles || loadingProjects;
  const hasResults = questions.length > 0 || users.length > 0 || tags.length > 0 || articles.length > 0 || projects.length > 0;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>{currentQuery ? `"${currentQuery}" — Keşfet` : 'Keşfet'} · Yazocial</title>
        <meta name="description" content="Yazocial'daki sorular, makaleler, kullanıcılar ve etiketlerde arama yapın." />
      </Helmet>
      <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-primary mb-2">
          <Compass className="w-8 h-8" />
          <h1 className="text-3xl font-black tracking-tight">Keşfet</h1>
        </div>
        <p className="text-textSecondary text-sm">Yazocial'daki tüm içeriklerde ve kullanıcılarda arama yapın.</p>
        
        <form onSubmit={handleSearch} className="max-w-xl mx-auto relative pt-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary mt-2" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ne aramak istiyorsunuz? (örn: react, api, kullanıcı adı)" 
            className="w-full bg-background border-2 border-border hover:border-primary/50 transition-colors rounded-full py-3 pl-12 pr-4 outline-none focus:bg-surface focus:border-primary text-textPrimary font-medium"
          />
        </form>
      </div>

      {currentQuery && (
        <>
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-border pb-2">
            {[
              { id: 'all', name: 'Tümü' },
              { id: 'questions', name: 'Sorular' },
              { id: 'users', name: 'Kullanıcılar' },
              { id: 'tags', name: 'Etiketler' },
              { id: 'articles', name: 'Makaleler' },
              { id: 'projects', name: 'Projeler' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 font-bold text-sm rounded-full transition-colors ${activeTab === tab.id ? 'bg-primary text-white' : 'text-textSecondary hover:bg-surfaceHover'}`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          <div className="space-y-8">
            {isSearching ? (
              <div className="text-center py-20 text-textSecondary animate-pulse">Arama yapılıyor...</div>
            ) : !hasResults ? (
              <div className="text-center py-20 text-textSecondary italic bg-surface rounded-2xl border border-border">
                "{currentQuery}" için sonuç bulunamadı.
              </div>
            ) : (
              <div className="space-y-8">
                {/* Etiketler */}
                {(activeTab === 'all' || activeTab === 'tags') && tags.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-black text-lg flex items-center gap-2 border-b border-border/50 pb-2">
                      <Tag className="w-5 h-5 text-primary" /> Etiketler
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {tags.map(tag => (
                        <Link 
                          key={tag._id} 
                          to={`/explore?q=${tag.name}`}
                          className="bg-surface2 hover:bg-primary hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all border border-border flex items-center gap-2 group"
                        >
                          <span>#{tag.name}</span>
                          <span className="text-[10px] bg-background/50 px-1.5 py-0.5 rounded-md group-hover:text-primary">{tag.usageCount}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Kullanıcılar */}
                {(activeTab === 'all' || activeTab === 'users') && users.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-black text-lg flex items-center gap-2 border-b border-border/50 pb-2">
                      <User className="w-5 h-5 text-indigo-400" /> Kullanıcılar
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {users.map(user => (
                        <Link 
                          key={user._id} 
                          to={`/users/${user._id}`}
                          className="bg-surface hover:border-indigo-400/50 border border-border p-4 rounded-xl flex items-center gap-4 transition-all"
                        >
                          <div className="w-12 h-12 bg-surface2 rounded-full overflow-hidden border border-border flex items-center justify-center font-black text-indigo-400 text-lg">
                            {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : user.username?.[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-textPrimary">u/{user.username}</div>
                            <div className="text-xs text-textSecondary">{user.reputation || 0} İtibar</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sorular */}
                {(activeTab === 'all' || activeTab === 'questions') && questions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-black text-lg flex items-center gap-2 border-b border-border/50 pb-2">
                      <HelpCircle className="w-5 h-5 text-emerald-400" /> Sorular
                    </h3>
                    <div className="space-y-3">
                      {questions.map(question => (
                        <Link 
                          key={question._id} 
                          to={`/questions/${question._id}`}
                          className="block bg-surface hover:border-emerald-400/50 border border-border p-4 rounded-xl transition-all"
                        >
                          <div className="font-bold text-textPrimary group-hover:text-emerald-400 mb-1">{question.title}</div>
                          <div className="flex items-center gap-3 text-xs text-textSecondary">
                            <span className="flex items-center gap-1"><ChevronUp className="w-3 h-3" /> {question.voteScore || 0}</span>
                            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {question.answerCount || 0}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(question.createdAt).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Makaleler */}
                {(activeTab === 'all' || activeTab === 'articles') && articles.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-black text-lg flex items-center gap-2 border-b border-border/50 pb-2">
                      <FileText className="w-5 h-5 text-blue-400" /> Makaleler
                    </h3>
                    <div className="space-y-3">
                      {articles.map(article => (
                        <Link 
                          key={article._id} 
                          to={`/articles/${article._id}`}
                          className="block bg-surface hover:border-blue-400/50 border border-border p-4 rounded-xl transition-all"
                        >
                          <div className="font-bold text-textPrimary group-hover:text-blue-400 mb-1">{article.title}</div>
                          <div className="flex items-center gap-3 text-xs text-textSecondary">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(article.createdAt).toLocaleDateString('tr-TR')}</span>
                            <span>u/{article.userId?.username}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projeler */}
                {(activeTab === 'all' || activeTab === 'projects') && projects.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-black text-lg flex items-center gap-2 border-b border-border/50 pb-2">
                      <Briefcase className="w-5 h-5 text-orange-400" /> Projeler
                    </h3>
                    <div className="space-y-3">
                      {projects.map(project => (
                        <Link 
                          key={project._id} 
                          to={`/projects/${project._id}`}
                          className="block bg-surface hover:border-orange-400/50 border border-border p-4 rounded-xl transition-all"
                        >
                          <div className="font-bold text-textPrimary group-hover:text-orange-400 mb-1">{project.name}</div>
                          <div className="text-xs text-textSecondary line-clamp-1">{project.description}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
