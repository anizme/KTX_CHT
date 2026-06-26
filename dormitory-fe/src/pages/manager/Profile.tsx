import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const inputCls =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none';

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');

    if (!form.old_password) {
      setError('Vui lòng nhập mật khẩu cũ');
      return;
    }

    if (!form.new_password) {
      setError('Vui lòng nhập mật khẩu mới');
      return;
    }

    if (form.new_password.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (form.new_password !== form.confirm_password) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
        setSaving(true);

        await userApi.changePassword(
            form.old_password,
            form.new_password
        );

        alert('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');

        logout();

        navigate('/login', { replace: true });
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { detail?: string } } })
          ?.response?.data?.detail ?? 'Không thể đổi mật khẩu'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto min-h-[calc(100vh-8rem)] flex flex-col justify-center">
        <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 text-3xl font-bold">
                {user?.username?.charAt(0).toUpperCase()}
            </div>

            <h1 className="text-3xl font-bold text-slate-800">
                Hồ sơ cá nhân
            </h1>

            <p className="text-slate-500 mt-2">
                Quản lý thông tin tài khoản và mật khẩu
            </p>
        </div>

      {/* Account Info */}
      <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Thông tin tài khoản
        </h2>

        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="text-xs text-slate-400 mb-1">
              Tên đăng nhập
            </div>

            <div className="font-medium text-slate-800">
              {user?.username}
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="text-xs text-slate-400 mb-1">
              Vai trò
            </div>

            <div className="font-medium text-slate-800 capitalize">
              {user?.role}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border shadow-sm p-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Đổi mật khẩu
        </h2>

        <div className="space-y-4 max-w-lg mx-auto">
          <div>
            <label className="block text-base text-slate-600 mb-1">
              Mật khẩu cũ
            </label>

            <input
              type="password"
              value={form.old_password}
              onChange={(e) =>
                setForm({
                  ...form,
                  old_password: e.target.value,
                })
              }
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-base text-slate-600 mb-1">
              Mật khẩu mới
            </label>

            <input
              type="password"
              value={form.new_password}
              onChange={(e) =>
                setForm({
                  ...form,
                  new_password: e.target.value,
                })
              }
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-base text-slate-600 mb-1">
              Xác nhận mật khẩu mới
            </label>

            <input
              type="password"
              value={form.confirm_password}
              onChange={(e) =>
                setForm({
                  ...form,
                  confirm_password: e.target.value,
                })
              }
              className={inputCls}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-base text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-base text-emerald-600">
              {success}
            </div>
          )}

          <div className="pt-2 flex justify-center">
            <button
              onClick={handleChangePassword}
              disabled={saving}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-base font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}