import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  UsersIcon,
  HomeModernIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  Bars3Icon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';

const nav = [
  { to: '/manager/students', label: 'Học sinh', icon: UsersIcon },
  { to: '/manager/rooms', label: 'Phòng', icon: HomeModernIcon },
];

const adminNav = [
  { to: '/manager/users', label: 'Tài khoản', icon: ShieldCheckIcon },
];

export default function ManagerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition ${
      isActive
        ? 'bg-blue-700 text-white'
        : 'text-blue-100 hover:bg-blue-700/60'
    }`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen bg-blue-800
          flex flex-col py-6 px-3
          transition-all duration-300 z-50
          ${collapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {!collapsed && (
            <NavLink
              to="/"
              className="text-white font-bold text-xl px-2"
            >
              Quản lý KTX
            </NavLink>
          )}

          <button
            onClick={() => setCollapsed(v => !v)}
            className="text-white p-2 rounded-lg hover:bg-blue-700"
          >
            {collapsed ? (
              <Bars3Icon className="w-5 h-5" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Menu */}
        <div className="space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkCls}>
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </div>

        {/* Admin */}
        {user?.role === 'admin' && (
          <>
            <div className="border-t border-blue-700 my-4" />

            <div className="space-y-1">
              {adminNav.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={linkCls}>
                  <Icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </NavLink>
              ))}
            </div>
          </>
        )}

        {/* Bottom */}
        <div className="mt-auto border-t border-blue-700 pt-4 space-y-1">
          <NavLink to="/manager/profile" className={linkCls}>
            <UserCircleIcon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{user?.username}</span>}
          </NavLink>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-blue-100 hover:bg-blue-700/60 w-full"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main
        className={`
          min-h-screen p-8
          transition-all duration-300
          ${collapsed ? 'ml-20' : 'ml-64'}
        `}
      >
        <Outlet />
      </main>
    </div>
  );
}