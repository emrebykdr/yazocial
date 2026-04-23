import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
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
  ShieldCheck
} from 'lucide-react';

export default function MainLayout() {
  const { isAuthenticated, logout, user } = useAuthStore();
  const location = useLocation();

  const sidebarItems = [
    { name: 'Ana Sayfa', path: '/', icon: Home },
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
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
            <input 
              type="text" 
              placeholder="Yazocial'da ara" 
              className="w-full bg-background border border-border hover:border-primary/50 transition-colors rounded-full py-1.5 pl-10 pr-4 text-sm outline-none focus:bg-surface focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <button className="p-2 hover:bg-surfaceHover rounded-full transition-colors"><Bell className="w-5 h-5" /></button>
                <Link to="/ask" className="flex items-center gap-1.5 bg-surfaceHover hover:bg-border px-3 py-1.5 rounded-full text-sm font-bold transition-all">
                  <Plus className="w-4 h-4" />
                  Soru Sor
                </Link>
                {(user?.role === 'admin' || user?.role === 'moderator') && (
                  <Link to="/admin" className="p-2 text-danger hover:bg-danger/10 rounded-full transition-colors" title="Admin Paneli">
                    <ShieldCheck className="w-5 h-5" />
                  </Link>
                )}
                <div className="w-8 h-8 bg-surfaceHover rounded-full border border-border flex items-center justify-center text-xs font-bold text-primary ml-2">
                  {user?.username?.[0].toUpperCase()}
                </div>
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

      <div className="max-w-[1300px] mx-auto w-full flex-1 flex gap-6 px-4 py-6">
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
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-surfaceHover font-bold' : 'hover:bg-surfaceHover text-textSecondary hover:text-textPrimary'}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border pt-4">
            <h3 className="px-4 text-[10px] font-black text-textSecondary uppercase tracking-widest mb-2">Topluluklar</h3>
            <div className="space-y-1">
              {['Yazılım', 'Frontend', 'Backend', 'AI'].map(tag => (
                <button key={tag} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-surfaceHover text-textSecondary hover:text-textPrimary transition-colors text-sm">
                  <div className="w-5 h-5 bg-surfaceHover rounded-full text-[10px] flex items-center justify-center">#</div>
                  {tag}
                </button>
              ))}
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
            <h3 className="text-xs font-black text-textSecondary uppercase tracking-widest">Popüler Topluluklar</h3>
            <div className="space-y-4">
              {[
                { name: 'r/javascript', members: '2.4m' },
                { name: 'r/reactjs', members: '800k' },
                { name: 'r/nodejs', members: '500k' },
              ].map((comm, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-surfaceHover rounded-full flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform">
                      {comm.name[2].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold">{comm.name}</p>
                      <p className="text-[10px] text-textSecondary">{comm.members} üye</p>
                    </div>
                  </div>
                  <button className="text-xs font-bold bg-textPrimary text-background px-3 py-1 rounded-full hover:opacity-80 transition-opacity">Katıl</button>
                </div>
              ))}
            </div>
            <button className="w-full py-2 text-xs font-bold hover:bg-surfaceHover rounded-full transition-colors text-textSecondary mt-2">Daha fazla göster</button>
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
