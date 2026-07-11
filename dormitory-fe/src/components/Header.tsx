import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import coverImage from '../assets/ktx_cov.png';
import logoImage from '../assets/cht_logo.png';

const COVER_IMAGE_URL = coverImage;

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
  { to: '/', label: 'Giới thiệu', match: (p: string) => p === '/' || p.startsWith('/noi-quy') },
  { to: '/tong-quan', label: 'Tổng quan', match: (p: string) => p.startsWith('/tong-quan') },
  { to: '/search', label: 'Tìm kiếm', match: (p: string) => p.startsWith('/search') },
  ...(user
    ? [{ to: '/manager', label: 'Quản lý', match: (p: string) => p.startsWith('/manager') }]
    : []),
];

  return (
    // <header className="relative overflow-hidden">
    <header className="sticky top-0 z-50 overflow-hidden">
      {/* Ảnh nền + overlay gradient */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${COVER_IMAGE_URL})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/90 to-blue-800/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-5">
          {/* Logo / tên trường */}
          <Link to="/" className="flex items-center gap-3 group">

            <div className="w-11 h-12 rounded-full overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 shrink-0">
              <img
                src={logoImage}
                alt="CHT Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="leading-tight">
              <div className="text-white font-bold text-lg sm:text-2xl tracking-tight">
                Ký túc xá Chuyên Hà Tĩnh
              </div>
              <div className="text-blue-200/70 text-sm font-medium hidden sm:block">
                Hệ thống quản lý Ký túc xá trường THPT Chuyên Hà Tĩnh
              </div>
            </div>
          </Link>

          {/* Nav */}
          <div className="flex items-center gap-1.5">
            <nav className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full p-2 border border-white/10">
              {navItems.map(item => {
                const active = item.match(location.pathname);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-4 py-1.5 rounded-full text-base font-medium transition-all ${
                      active
                        ? 'bg-white text-blue-900 shadow-sm'
                        : 'text-blue-100/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="w-px h-6 bg-white/15 mx-1.5" />

            {user ? (
              <button
                onClick={handleLogout}
                className="px-4 py-1.5 rounded-full text-base font-medium text-blue-100/80 hover:text-white hover:bg-white/10 transition-all"
              >
                Đăng xuất
              </button>
            ) : (
              <Link
                to="/login"
                className={`px-4 py-1.5 rounded-full text-base font-medium transition-all ${
                  location.pathname === '/login'
                    ? 'bg-amber-400 text-blue-950 shadow-sm'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                }`}
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Viền dưới mảnh để tách khỏi nội dung */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent relative" />
    </header>
  );
}