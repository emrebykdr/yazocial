import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/auth.store';
import { Lock, Mail, User, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/register', formData);
      setSuccess(true);
      
      // Kayıttan sonra otomatik giriş yapabiliriz veya login'e yönlendirebiliriz
      // Burada 2 saniye bekleyip login'e yönlendirelim
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = err.response?.data?.details || err.response?.data?.error || 'Kayıt sırasında bir hata oluştu.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-textPrimary">Aramıza Katıl</h1>
          <p className="text-textSecondary mt-2">Yazılım dünyasının kalbinde yerini al</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-success/10 border border-success/20 text-success rounded-xl flex items-center gap-3 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-textSecondary ml-1">Ad</label>
              <input
                name="firstName"
                type="text"
                className="w-full bg-surface2 border border-border rounded-xl py-2.5 px-4 text-textPrimary focus:border-primary outline-none transition-colors"
                placeholder="Emre"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-textSecondary ml-1">Soyad</label>
              <input
                name="lastName"
                type="text"
                className="w-full bg-surface2 border border-border rounded-xl py-2.5 px-4 text-textPrimary focus:border-primary outline-none transition-colors"
                placeholder="Yazıcı"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-textSecondary ml-1">Kullanıcı Adı *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
              <input
                name="username"
                type="text"
                required
                className="w-full bg-surface2 border border-border rounded-xl py-2.5 pl-10 pr-4 text-textPrimary focus:border-primary outline-none transition-colors"
                placeholder="yazociol_dev"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-textSecondary ml-1">E-posta *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
              <input
                name="email"
                type="email"
                required
                className="w-full bg-surface2 border border-border rounded-xl py-2.5 pl-10 pr-4 text-textPrimary focus:border-primary outline-none transition-colors"
                placeholder="emre@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-textSecondary ml-1">Şifre *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
              <input
                name="password"
                type="password"
                required
                className="w-full bg-surface2 border border-border rounded-xl py-2.5 pl-10 pr-4 text-textPrimary focus:border-primary outline-none transition-colors"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-primary hover:bg-primaryHover text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Hesabımı Oluştur'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-textSecondary">
          Zaten hesabınız var mı?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
}
