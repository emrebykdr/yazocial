import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  // BUG 2 FIX: Başlangıçta false. App.jsx'teki profile isteği tamamlanana kadar
  // isAuthenticated=false kalır. Token süresi dolmuşsa App.jsx logout() çağırır.
  isAuthenticated: false,

  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
