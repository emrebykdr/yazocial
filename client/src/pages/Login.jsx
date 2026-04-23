import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/auth.store';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { identifier, password });
      const { token, user } = response.data.data;
      
      setAuth(user, token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-textPrimary">Hoş Geldiniz</h1>
          <p className="text-textSecondary mt-2">Hesabınıza giriş yapın</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-textSecondary ml-1">Kullanıcı Adı veya E-posta</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary" />
              <input
                type="text"
                required
                className="w-full bg-surface2 border border-border rounded-xl py-3 pl-10 pr-4 text-textPrimary focus:border-primary outline-none transition-colors"
                placeholder="yazociol_user"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-textSecondary ml-1">Şifre</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary" />
              <input
                type="password"
                required
                className="w-full bg-surface2 border border-border rounded-xl py-3 pl-10 pr-4 text-textPrimary focus:border-primary outline-none transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primaryHover text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Giriş Yap'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-textSecondary">
          Henüz hesabınız yok mu?{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">Kayıt Ol</Link>
        </div>
      </div>
    </div>
  );
}
