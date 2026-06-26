import { useEffect, useState } from 'react';
import { violationApi } from '../../services/api';
import type { Student, Violation, ViolationCreate } from '../../services/api';
import Modal from './Modal';

interface Props {
  student: Student;
  onClose: () => void;
}

export default function ViolationModal({ student, onClose }: Props) {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [formOpen, setFormOpen]     = useState(false);
  const [editing, setEditing]       = useState<Violation | null>(null);
  const [form, setForm]             = useState<Omit<ViolationCreate, 'student_id'>>({
    title: '', description: '', violation_date: new Date().toISOString().slice(0, 10),
  });

  const load = () =>
    violationApi.list(student.id).then(r => setViolations(r.data));

  useEffect(() => { load(); }, [student.id]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '', violation_date: new Date().toISOString().slice(0, 10) });
    setFormOpen(true);
  };

  const openEdit = (v: Violation) => {
    setEditing(v);
    setForm({ title: v.title, description: v.description, violation_date: v.violation_date.slice(0, 10) });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (editing) await violationApi.update(editing.id, form);
    else         await violationApi.create({ ...form, student_id: student.id });
    setFormOpen(false);
    load();
  };

  const handleDelete = async (v: Violation) => {
    if (!confirm(`Xóa vi phạm "${v.title}"?`)) return;
    await violationApi.delete(v.id);
    load();
  };

  const inputCls = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 outline-none w-full';

  return (
    <Modal open title={`Vi phạm: ${student.full_name}`} onClose={onClose}>
      <div className="space-y-3">
        <button onClick={openCreate}
          className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
          + Thêm vi phạm
        </button>

        <div className="max-h-64 overflow-y-auto space-y-2">
          {violations.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-4">Không có vi phạm nào</p>
          )}
          {violations.map(v => (
            <div key={v.id} className="border rounded-lg p-3 text-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{v.title}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{v.violation_date?.slice(0, 10)}</div>
                  {v.description && <div className="text-slate-600 mt-1">{v.description}</div>}
                </div>
                <div className="flex gap-2 shrink-0 ml-2">
                  <button onClick={() => openEdit(v)} className="text-blue-500 hover:underline text-xs">Sửa</button>
                  <button onClick={() => handleDelete(v)} className="text-red-500 hover:underline text-xs">Xóa</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {formOpen && (
          <div className="border-t pt-3 space-y-2">
            <input placeholder="Tiêu đề *" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} />
            <textarea placeholder="Mô tả" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className={inputCls + ' resize-none'} rows={2} />
            <input type="date" value={form.violation_date}
              onChange={e => setForm({ ...form, violation_date: e.target.value })} className={inputCls} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setFormOpen(false)} className="px-3 py-1.5 rounded-lg border text-sm">Hủy</button>
              <button onClick={handleSave} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">Lưu</button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}