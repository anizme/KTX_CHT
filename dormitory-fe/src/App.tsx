import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { useAuth } from './contexts/AuthContext';

import Layout from './components/Layout';
import ManagerLayout from './components/ManagerLayout';

import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import Login from './pages/Login';

import Students from './pages/manager/Students';
import Rooms from './pages/manager/Rooms';
import Users from './pages/manager/Users';
import Profile from './pages/manager/Profile';

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  return user?.role === 'admin' ? children : <Navigate to="/manager/students" replace />;
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            {/* Public routes — có Layout chung */}
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/search" element={<Search />} />
              <Route path="/login" element={<Login />} />
            </Route>

            

            {/* Manager routes — layout riêng, cần đăng nhập */}
            <Route path="/manager" element={
              <RequireAuth>
                <ManagerLayout />
              </RequireAuth>
            }>
              <Route index element={<Navigate to="students" replace />} />
              <Route path="students"   element={<Students />} />
              <Route path="rooms"      element={<Rooms />} />
              <Route path="users"      element={
                <RequireAdmin>
                  <Users />
                </RequireAdmin>
              } />
              <Route path="profile" element={<Profile />} />
            </Route>
            

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;