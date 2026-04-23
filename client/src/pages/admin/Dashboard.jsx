import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { 
  Users, 
  MessageSquare, 
  HelpCircle, 
  TrendingUp, 
  Activity,
  AlertTriangle
} from 'lucide-react';

export default function AdminDashboard() {
  // Gelecekte gerçek istatistikleri çekecek bir API ucu eklenebilir
  // Şimdilik mockup veriler ve mevcut User sayısını gösterelim
  const { data: usersResponse } = useQuery({
    queryKey: ['admin-users-count'],
    queryFn: () => api.get('/users').then(res => res.data)
  });

  const stats = [
    { name: 'Toplam Kullanıcı', value: usersResponse?.data?.length || 0, icon: Users, color: 'text-primary' },
    { name: 'Toplam Soru', value: '1,284', icon: HelpCircle, color: 'text-success' },
    { name: 'Toplam Cevap', value: '4,592', icon: MessageSquare, color: 'text-indigo-400' },
    { name: 'Günlük Aktiflik', value: '%84', icon: Activity, color: 'text-orange-400' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-black tracking-tight">Hoş Geldin, Komutan.</h1>
        <p className="text-textSecondary">Platformun genel durumuna dair özet bilgiler burada.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-surface border border-border p-6 rounded-2xl space-y-4 shadow-sm hover:border-primary/30 transition-colors">
              <div className={`p-3 rounded-xl bg-surface2 w-fit ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-textSecondary">{stat.name}</p>
                <p className="text-2xl font-black mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Son Aktiviteler Mockup */}
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Sistem Uyarıları
          </h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-surface2 rounded-xl border border-border/50">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <div className="flex-1 text-sm">
                  <p className="font-semibold text-textPrimary">Yüksek Sunucu Yükü</p>
                  <p className="text-textSecondary">API isteklerinde %15 artış gözlemlendi.</p>
                </div>
                <span className="text-[10px] text-textSecondary uppercase font-bold">12 Dakika Önce</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hızlı Aksiyonlar */}
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-bold">Hızlı Yönetim</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-surface2 hover:bg-primary/10 hover:border-primary/50 border border-border rounded-xl text-sm font-medium transition-all text-left space-y-1">
              <p className="text-textPrimary">Yeni Rozet Tanımla</p>
              <p className="text-xs text-textSecondary">Sistem geneli yeni başarılar</p>
            </button>
            <button className="p-4 bg-surface2 hover:bg-success/10 hover:border-success/50 border border-border rounded-xl text-sm font-medium transition-all text-left space-y-1">
              <p className="text-textPrimary">Etiket Düzenle</p>
              <p className="text-xs text-textSecondary">Kategori ve tag yönetimi</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
