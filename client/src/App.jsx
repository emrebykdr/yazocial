import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './services/api';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import QuestionDetail from './pages/QuestionDetail';
import AskQuestion from './pages/AskQuestion';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import CreateArticle from './pages/CreateArticle';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import CreateProject from './pages/CreateProject';
import Notifications from './pages/Notifications';
import Popular from './pages/Popular';
import Explore from './pages/Explore';
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
  const { token, setAuth, logout } = useAuthStore();

  useEffect(() => {
    if (token) {
      api.get('/users/profile')
        .then(res => setAuth(res.data.data, token))
        .catch(() => logout());
    }
  }, [token, setAuth, logout]);

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
              <AskQuestion />
            </PrivateRoute>
          } />
          
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />

          <Route path="/users/:id" element={<Profile />} />
          
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:id" element={<ArticleDetail />} />
          <Route path="/articles/new" element={
            <PrivateRoute>
              <CreateArticle />
            </PrivateRoute>
          } />

          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/projects/new" element={
            <PrivateRoute>
              <CreateProject />
            </PrivateRoute>
          } />

          <Route path="/notifications" element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          } />

          <Route path="/popular" element={<Popular />} />
          <Route path="/explore" element={<Explore />} />
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
