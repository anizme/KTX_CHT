import { useEffect, useState, useRef } from 'react';
import { violationApi, studentApi } from '../../services/api';
import type { Violation, Student } from '../../services/api';
import Modal from '../../components/manager/Modal';

export default function Violations() {
  const [violations, setViolations]   = useState<Violation[]>([]);
  const [loading, setLoading]         = useState(true);
  const [studentMap, setStudentMap]   = useState<Record<number, Student>>({});

  // filter
  const [filterName, setFilterName]   = useState('');
  const [filterStudentId, setFilterStudentId] = useState<number | undefined>();

  // search suggestions
  const [suggestions, setSuggestions] = useState<Student[]>([]);
  const [showSug, setShowSug]         = useState(false);
  const sugRef = useRef<HTMLDivElement>(null);

  // form
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing]   = useState<Violation | null>(null);
  const [form, setForm]         = useState({ student_id: '', title: '', description: '', violation_date: '' });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await violationApi.list(filterStudentId);
      setViolations(data);
      const unknownIds = [...new Set(data.map(v => v.student_id))].filter(id => !studentMap[id]);
      await Promise.all(unknownIds.map(id =>
        studentApi.get(id).then(r =>
          setStudentMap(prev => ({ ...prev, [id]: r.data }))
        ).catch(() => {})
      ));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterStudentId]);

  // Tìm học sinh theo tên để gợi ý
  const handleNameInput = async (val: string) => {
    setFilterName(val);
    if (!val.trim()) { setSuggestions([]); setFilterStudentId(undefined); return; }
    const { data } = await studentApi.list({ full_name: val });
    setSuggestions(data.slice(0, 8));
    setShowSug(true);
  };

  const selectStudent = (s: Student) => {
    setFilterName(s.full_name);
    setFilterStudentId(s.id);
    setSuggestions([]);
    setShowSug(false);
  };

  const clearFilter = () => {
    setFilterName('');
    setFilterStudentId(undefined);
    setSuggestions([]);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ student_id: '', title: '', description: '', violation_date: new Date().toISOString().slice(0, 10) });
    setFormOpen(true);
  };

  const openEdit = (v: Violation) => {
    setEditing(v);
    setForm({
      student_id:     String(v.student_id),
      title:          v.title,
      description:    v.description,
      violation_date: v.violation_date.slice(0, 10),
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      student_id:     Number(form.student_id),
      title:          form.title,
      description:    form.description,
      violation_date: form.violation_date,
    };
    if (editing) await violationApi.update(editing.id, payload);
    else         await violationApi.create(payload);
    setFormOpen(false);
    load();
  };

  const handleDelete = async (v: Violation) => {
    if (!confirm(`Xóa vi phạm "${v.title}"?`)) return;
    await violationApi.delete(v.id);
    load();
  };

  const inputCls = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none w-full';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Vi phạm</h1>
        <button onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
          + Thêm vi phạm
        </button>
      </div>

      {/* Filter theo tên học sinh */}
      <div className="bg-white rounded-xl border shadow-sm p-4 mb-6">
        <div className="relative w-72" ref={sugRef}>
          <input
            placeholder="Tìm theo tên học sinh..."
            value={filterName}
            onChange={e => handleNameInput(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSug(true)}
            className={inputCls}
          />
          {filterStudentId && (
            <button onClick={clearFilter}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">
              ✕
            </button>
          )}
          {showSug && suggestions.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white border rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
              {suggestions.map(s => (
                <div key={s.id}
                  onClick={() => selectStudent(s)}
                  className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer">
                  <span className="font-medium">{s.full_name}</span>
                  <span className="text-slate-400 text-xs ml-2">{s.class_name} - {s.room_label || 'Chưa xếp phòng'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? <p className="text-slate-400">Đang tải...</p> : (
        <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b text-slate-600">
              <tr>
                {['STT','Học sinh','Tiêu đề','Mô tả','Ngày',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {violations.map((v, i) => {
                const s = studentMap[v.student_id];
                return (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{s?.full_name ?? '...'}</div>
                      <div className="text-xs text-slate-400">{s?.class_name} - {s?.room_label || 'Chưa xếp'}</div>
                    </td>
                    <td className="px-4 py-3 font-medium">{v.title}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{v.description}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{v.violation_date?.slice(0, 10)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(v)} className="text-blue-500 hover:underline text-xs">Sửa</button>
                        <button onClick={() => handleDelete(v)} className="text-red-500 hover:underline text-xs">Xóa</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {violations.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Không có vi phạm nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Sửa vi phạm' : 'Thêm vi phạm'}>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Mã học sinh <span className="text-red-400">*</span></label>
            <input value={form.student_id}
              onChange={e => setForm({ ...form, student_id: e.target.value })}
              className={inputCls} disabled={!!editing} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Tiêu đề <span className="text-red-400">*</span></label>
            <input value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Mô tả</label>
            <textarea value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className={inputCls + ' resize-none'} rows={3} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Ngày vi phạm</label>
            <input type="date" value={form.violation_date}
              onChange={e => setForm({ ...form, violation_date: e.target.value })} className={inputCls} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setFormOpen(false)} className="px-4 py-2 rounded-lg border text-sm">Hủy</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">Lưu</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}