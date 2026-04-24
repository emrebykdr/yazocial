import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { 
  Home, 
  TrendingUp, 
  Compass, 
  Plus, 
  Bell, 
  Search,
  Users,
  Info,
  LogOut,
  ShieldCheck,
  FileText,
  Briefcase
} from 'lucide-react';

export default function MainLayout() {
  const { isAuthenticated, logout, user } = useAuthStore();
  const location = useLocation();

  // Popüler Etiketleri Getir
  const { data: tagsResponse } = useQuery({
    queryKey: ['popular-tags'],
    queryFn: async () => {
      const res = await api.get('/tags?limit=10&sort=-usageCount');
      return res.data;
    }
  });
  const popularTags = tagsResponse?.data || [];
  
  // En İyi Katkıda Bulunanları Getir
  const { data: usersResponse } = useQuery({
    queryKey: ['top-contributors'],
    queryFn: async () => {
      const res = await api.get('/users?limit=5&sort=-reputation');
      return res.data;
    }
  });
  const topContributors = usersResponse?.data || [];

  const sidebarItems = [
    { name: 'Ana Sayfa', path: '/', icon: Home },
    { name: 'Makaleler', path: '/articles', icon: FileText },
    { name: 'Projeler', path: '/projects', icon: Briefcase },
    { name: 'Popüler', path: '/popular', icon: TrendingUp },
    { name: 'Keşfet', path: '/explore', icon: Compass },
  ];

  return (
    <div className="min-h-screen bg-background text-textPrimary flex flex-col font-sans">
      {/* Reddit Style Top Nav */}
      <header className="sticky top-0 z-50 bg-surface border-b border-border h-14">
        <div className="max-w-[1600px] mx-auto px-4 h-full flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="hidden md:block text-lg font-black tracking-tighter uppercase">yazocial</span>
          </Link>

          {/* Search Bar */}
          <form 
            className="flex-1 max-w-2xl relative"
            onSubmit={(e) => {
              e.preventDefault();
              const query = e.target.search.value;
              if(query) window.location.href = `/explore?q=${encodeURIComponent(query)}`;
            }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
            <input 
              name="search"
              type="text" 
              placeholder="Yazocial'da ara" 
              className="w-full bg-background border border-border hover:border-primary/50 transition-colors rounded-full py-1.5 pl-10 pr-4 text-sm outline-none focus:bg-surface focus:border-primary"
            />
          </form>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/notifications" className="p-2 hover:bg-surfaceHover rounded-full transition-colors relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border border-surface"></span>
                </Link>
                <Link to="/ask" className="flex items-center gap-1.5 bg-surfaceHover hover:bg-border px-3 py-1.5 rounded-full text-sm font-bold transition-all">
                  <Plus className="w-4 h-4" />
                  Soru Sor
                </Link>
                {(user?.role === 'admin' || user?.role === 'moderator') && (
                  <Link to="/admin" className="p-2 text-danger hover:bg-danger/10 rounded-full transition-colors" title="Admin Paneli">
                    <ShieldCheck className="w-5 h-5" />
                  </Link>
                )}
                <Link to="/profile" className="w-8 h-8 bg-surfaceHover rounded-full border border-border flex items-center justify-center text-xs font-bold text-primary ml-2 overflow-hidden" title="Profil">
                  {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : user?.username?.[0].toUpperCase()}
                </Link>
                <button 
                  onClick={() => logout()}
                  className="p-2 hover:bg-danger/10 hover:text-danger rounded-full transition-colors"
                  title="Çıkış Yap"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-1.5 rounded-full text-sm font-bold hover:bg-surfaceHover transition-colors border border-transparent">Oturum Aç</Link>
                <Link to="/register" className="bg-primary hover:bg-primaryHover text-white px-4 py-1.5 rounded-full text-sm font-bold transition-all">Kaydol</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto w-full flex-1 flex gap-8 px-4 py-8">
        {/* Left Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 sticky top-20 h-fit space-y-6">
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-surface2 text-primary font-bold shadow-sm' : 'hover:bg-surfaceHover text-textSecondary font-medium hover:text-textPrimary'}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border pt-4">
            <h3 className="px-4 text-[10px] font-black text-textSecondary uppercase tracking-widest mb-2">Popüler Etiketler</h3>
            <div className="space-y-1">
              {popularTags.length > 0 ? popularTags.map(tag => (
                <Link 
                  key={tag._id} 
                  to={`/explore?q=${tag.name}`}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-surfaceHover text-textSecondary font-medium hover:text-textPrimary transition-all text-sm group"
                >
                  <div className="w-5 h-5 bg-surface2 group-hover:bg-primary/20 group-hover:text-primary rounded-lg text-[10px] flex items-center justify-center transition-colors">#</div>
                  {tag.name}
                </Link>
              )) : (
                <p className="px-4 text-[10px] text-textSecondary italic">Henüz etiket yok...</p>
              )}
            </div>
          </div>
        </aside>

        {/* Main Feed */}
        <main className="flex-1 max-w-3xl min-w-0">
          <Outlet />
        </main>

        {/* Right Info Panel */}
        <aside className="hidden xl:block w-80 sticky top-20 h-fit space-y-4">
          <div className="bg-surface border border-border rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-black text-textSecondary uppercase tracking-widest">En İyi Katkıda Bulunanlar</h3>
            <div className="space-y-4">
              {topContributors.length > 0 ? topContributors.map((topUser, i) => (
                <div key={topUser._id} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-surface2 rounded-full flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-all overflow-hidden border border-border">
                      {topUser.avatarUrl ? (
                        <img src={topUser.avatarUrl} className="w-full h-full object-cover" />
                      ) : (
                        topUser.username?.[0].toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold hover:text-primary transition-colors">u/{topUser.username}</p>
                      <p className="text-[10px] text-textSecondary">{topUser.reputation || 0} itibar</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-black bg-surface2 hover:bg-primary hover:text-white px-4 py-1.5 rounded-full transition-all uppercase tracking-widest border border-border">Takip Et</button>
                </div>
              )) : (
                <p className="text-xs text-textSecondary italic text-center py-4">Kullanıcı bulunamadı.</p>
              )}
            </div>
            <button className="w-full py-2 text-xs font-bold hover:bg-surfaceHover rounded-full transition-colors text-textSecondary mt-2">Tümünü Gör</button>
          </div>

          <div className="px-4 py-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-textSecondary">
            <button className="hover:underline">Hakkında</button>
            <button className="hover:underline">İçerik Politikası</button>
            <button className="hover:underline">Gizlilik Politikası</button>
            <button className="hover:underline">Kullanıcı Sözleşmesi</button>
          </div>
          <p className="px-4 text-[10px] text-textSecondary">Yazocial, Inc. © 2026. Tüm hakları saklıdır.</p>
        </aside>
      </div>
    </div>
  );
}
