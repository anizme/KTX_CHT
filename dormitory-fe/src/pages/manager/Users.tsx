import { useEffect, useState } from 'react';
import { userApi } from '../../services/api';
import type { ApiUser } from '../../services/api';
import Modal from '../../components/manager/Modal';

const ROLES = ['manager', 'admin'];

export default function Users() {
  const [users, setUsers]     = useState<ApiUser[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'manager' });

  const load = () => userApi.list().then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!newUser.username || !newUser.password) return;
    await userApi.create(newUser);
    setNewUser({ username: '', password: '', role: 'manager' });
    setFormOpen(false);
    load();
  };

  const handleDelete = async (u: ApiUser) => {
    if (!confirm(`Xóa tài khoản ${u.username}?`)) return;
    await userApi.delete(u.id);
    load();
  };

  const handleChangeRole = async (u: ApiUser, role: string) => {
    await userApi.changeRole(u.id, role);
    load();
  };

  const inputCls = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none w-full';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Tài khoản</h1>
        <div className="flex gap-2">
          <button onClick={() => setFormOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
            + Thêm tài khoản
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b text-slate-600">
            <tr>
              {['STT','Tên đăng nhập','Role',''].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u, i) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                <td className="px-4 py-3 font-medium">{u.username}</td>
                <td className="px-4 py-3">
                  <select value={u.role}
                    onChange={e => handleChangeRole(u, e.target.value)}
                    className="rounded border border-slate-200 px-2 py-1 text-xs bg-white">
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(u)}
                    className="text-red-500 hover:underline text-xs">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Thêm tài khoản">
        <div className="space-y-3">
          <input placeholder="Tên đăng nhập" value={newUser.username}
            onChange={e => setNewUser({ ...newUser, username: e.target.value })} className={inputCls} />
          <input type="password" placeholder="Mật khẩu" value={newUser.password}
            onChange={e => setNewUser({ ...newUser, password: e.target.value })} className={inputCls} />
          <select value={newUser.role}
            onChange={e => setNewUser({ ...newUser, role: e.target.value })} className={inputCls}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setFormOpen(false)} className="px-4 py-2 rounded-lg border text-sm">Hủy</button>
            <button onClick={handleCreate} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">Tạo</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}