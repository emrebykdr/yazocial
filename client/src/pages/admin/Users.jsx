import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { 
  Search, 
  MoreVertical, 
  UserMinus, 
  UserCheck, 
  Shield, 
  Mail,
  Loader2,
  Trash2
} from 'lucide-react';

export default function AdminUsers() {
  const queryClient = useQueryClient();

  // Kullanıcı Listesini Çek
  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/users').then(res => res.data)
  });

  // Kullanıcı Silme
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['admin-users'])
  });

  if (isLoading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  const users = response?.data || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Kullanıcı Yönetimi</h1>
          <p className="text-textSecondary">Sistemdeki tüm kayıtlı üyeleri buradan yönetebilirsiniz.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
          <input 
            type="text" 
            placeholder="Kullanıcı ara..." 
            className="bg-surface border border-border rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:border-primary w-full md:w-64"
          />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-surface2/50 text-textSecondary uppercase text-[10px] tracking-widest border-b border-border">
              <th className="px-6 py-4 font-black">Kullanıcı</th>
              <th className="px-6 py-4 font-black">Rol</th>
              <th className="px-6 py-4 font-black">Durum</th>
              <th className="px-6 py-4 font-black">Kayıt Tarihi</th>
              <th className="px-6 py-4 font-black text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-surface2/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-surface2 rounded-full flex items-center justify-center text-primary font-bold">
                      {user.username?.[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-textPrimary">{user.username}</div>
                      <div className="text-xs text-textSecondary flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    user.role === 'admin' ? 'bg-danger/10 text-danger border border-danger/20' : 
                    user.role === 'moderator' ? 'bg-primary/10 text-primary border border-primary/20' : 
                    'bg-surface2 text-textSecondary border border-border'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-success' : 'bg-textSecondary'}`}></span>
                    <span className="text-xs">{user.isActive ? 'Aktif' : 'Pasif'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-textSecondary text-xs">
                  {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-surface2 rounded-lg text-textSecondary transition-colors" title="Düzenle">
                      <Shield className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if(window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
                          deleteMutation.mutate(user._id);
                        }
                      }}
                      className="p-2 hover:bg-danger/10 rounded-lg text-textSecondary hover:text-danger transition-colors" 
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-surface2 rounded-lg text-textSecondary transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
