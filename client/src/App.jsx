import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import QuestionDetail from './pages/QuestionDetail';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import { useAuthStore } from './store/auth.store';
import { useNotifications } from './hooks/useNotifications';

const NotificationListener = () => {
  useNotifications();
  return null;
};

// Standart Giriş Koruması
const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin Koruması
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/" />;
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <NotificationListener />
      <Routes>
        {/* Ana Uygulama Rotaları */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/questions/:id" element={<QuestionDetail />} />
          
          <Route path="/ask" element={
            <PrivateRoute>
              <div className="text-center py-20 text-textSecondary italic text-xl">Soru sorma modülü çok yakında...</div>
            </PrivateRoute>
          } />
          
          <Route path="/profile" element={
            <PrivateRoute>
              <div className="text-center py-20 text-textSecondary italic text-xl">Profil sayfası yakında...</div>
            </PrivateRoute>
          } />
        </Route>

        {/* Admin Paneli Rotaları */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<div className="p-8 text-2xl font-bold">Ayarlar Yakında...</div>} />
        </Route>

        <Route path="*" element={<div className="text-center py-20 text-2xl font-bold">404</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
