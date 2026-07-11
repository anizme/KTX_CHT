import { NavLink } from 'react-router-dom';

export default function InfoTabs() {
  const tabCls = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-full text-sm font-medium transition ${
      isActive ? 'bg-blue-600 text-white' : 'bg-white border text-slate-600 hover:bg-slate-50'
    }`;
  return (
    <div className="flex gap-2 mb-6">
      <NavLink to="/" end className={tabCls}>Giới thiệu</NavLink>
      <NavLink to="/noi-quy" className={tabCls}>Nội quy</NavLink>
    </div>
  );
}