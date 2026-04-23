import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { 
  LayoutDashboard, 
  Users, 
  Tag, 
  Award, 
  Settings, 
  LogOut, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Kullanıcılar', path: '/admin/users', icon: Users },
    { name: 'Etiketler', path: '/admin/tags', icon: Tag },
    { name: 'Rozetler', path: '/admin/badges', icon: Award },
    { name: 'Ayarlar', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-72 bg-surface border-r border-border flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-border flex items-center justify-between">
          <div className="text-xl font-black tracking-tighter">
            ADMIN<span className="text-primary">PANEL</span>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-textSecondary hover:bg-surface2 hover:text-textPrimary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-border space-y-4">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
              {user?.username?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user?.username}</p>
              <p className="text-xs text-textSecondary uppercase tracking-widest">{user?.role}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link to="/" className="flex-1 flex items-center justify-center gap-2 p-2 bg-surface2 hover:bg-border rounded-lg text-xs font-medium transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
              Siteye Dön
            </Link>
            <button 
              onClick={logout}
              className="p-2 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-10 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
