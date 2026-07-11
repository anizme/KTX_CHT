import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import ManagerLayout from './components/ManagerLayout';
import Intro from './pages/Intro';
import Rules from './pages/Rules';
import Overview from './pages/Overview';
import Search from './pages/Search';
import Login from './pages/Login';
import Students from './pages/manager/Students';
import Rooms from './pages/manager/Rooms';
import Users from './pages/manager/Users';
import Profile from './pages/manager/Profile';
import PagesEditor from './pages/manager/PagesEditor';
import Awards from './pages/manager/Awards';
import Import from './pages/manager/Import';
import Academic from './pages/manager/Academic';

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
        <Router basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Intro />} />
              <Route path="/noi-quy" element={<Rules />} />
              <Route path="/tong-quan" element={<Overview />} />
              <Route path="/search" element={<Search />} />
              <Route path="/login" element={<Login />} />
            </Route>

            <Route path="/manager" element={<RequireAuth><ManagerLayout /></RequireAuth>}>
              <Route index element={<Navigate to="students" replace />} />
              <Route path="students" element={<Students />} />
              <Route path="rooms" element={<Rooms />} />
              <Route path="pages" element={<PagesEditor />} />
              <Route path="awards" element={<Awards />} />
              <Route path="import" element={<Import />} />
              <Route path="users" element={<RequireAdmin><Users /></RequireAdmin>} />
              <Route path="academic" element={<RequireAdmin><Academic /></RequireAdmin>} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}
export default App;