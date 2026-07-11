import { useEffect, useState } from 'react';
import { awardTypeApi, studentAwardApi } from '../../services/api';
import { useData } from '../../contexts/DataContext';
import type { AwardType, StudentAward, StudentAwardCreate } from '../../types';
import Modal from '../../components/manager/Modal';

const inputCls = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none w-full';

function AwardTypeManager({
  types, onChange,
}: { types: AwardType[]; onChange: () => void }) {
  const [name, setName] = useState('');

  const add = async () => {
    if (!name.trim()) return;
    await awardTypeApi.create(name.trim());
    setName('');
    onChange();
  };

  const remove = async (t: AwardType) => {
    if (!confirm(`Xoá loại giải "${t.name}"? (sẽ xoá luôn các giải đã trao thuộc loại này)`)) return;
    await awardTypeApi.delete(t.id);
    onChange();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <h2 className="font-semibold text-slate-800 mb-3">Loại giải thưởng</h2>
      <div className="flex gap-2 mb-4">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Tên loại giải (vd: HSG Quốc gia)"
          className={inputCls}
        />
        <button onClick={add} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium whitespace-nowrap">
          + Thêm
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {types.map(t => (
          <span key={t.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm">
            {t.name}
            <button onClick={() => remove(t)} className="text-red-400 hover:text-red-600">✕</button>
          </span>
        ))}
        {types.length === 0 && <p className="text-slate-400 text-sm">Chưa có loại giải nào.</p>}
      </div>
    </div>
  );
}

function StudentAwardForm({
  types, onSave, onCancel,
}: {
  types: AwardType[];
  onSave: (data: StudentAwardCreate) => void;
  onCancel: () => void;
}) {
  const { getAllStudents } = useData();
  const [query, setQuery] = useState('');
  const [studentId, setStudentId] = useState<number | null>(null);
  const [awardTypeId, setAwardTypeId] = useState<number | null>(types[0]?.id ?? null);
  const [awardYear, setAwardYear] = useState('');
  const [description, setDescription] = useState('');

  const students = getAllStudents();
  const matches = query.trim()
    ? students.filter(s => s.full_name.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];
  const selected = students.find(s => s.id === studentId);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !awardTypeId) return;
    onSave({
      student_id: studentId,
      award_type_id: awardTypeId,
      award_year: awardYear ? Number(awardYear) : undefined,
      description: description.trim() || undefined,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="text-sm font-medium text-slate-600">Học sinh</label>
        {selected ? (
          <div className="flex items-center justify-between border rounded-lg px-3 py-2 bg-slate-50">
            <span>{selected.full_name} — {selected.class_name}</span>
            <button type="button" onClick={() => setStudentId(null)} className="text-slate-400 hover:text-slate-600 text-sm">
              Đổi
            </button>
          </div>
        ) : (
          <>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Gõ tên học sinh..."
              className={inputCls}
            />
            {matches.length > 0 && (
              <div className="border rounded-lg mt-1 divide-y max-h-40 overflow-y-auto">
                {matches.map(s => (
                  <div
                    key={s.id}
                    onClick={() => { setStudentId(s.id); setQuery(''); }}
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                  >
                    {s.full_name} — {s.class_name}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-600">Loại giải thưởng</label>
        <select
          value={awardTypeId ?? ''}
          onChange={e => setAwardTypeId(Number(e.target.value))}
          className={inputCls}
          required
        >
          {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-600">Năm học (để trống = năm học hiện tại)</label>
        <input
          value={awardYear}
          onChange={e => setAwardYear(e.target.value)}
          placeholder="vd: 2025"
          className={inputCls}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-600">Mô tả</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} className={inputCls} rows={3} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">
          Huỷ
        </button>
        <button type="submit" disabled={!studentId} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium disabled:bg-slate-300">
          Lưu
        </button>
      </div>
    </form>
  );
}

export default function Awards() {
  const [types, setTypes] = useState<AwardType[]>([]);
  const [awards, setAwards] = useState<StudentAward[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [filterYear, setFilterYear] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [t, a] = await Promise.all([
        awardTypeApi.list(),
        studentAwardApi.list(filterYear ? { award_year: Number(filterYear) } : undefined),
      ]);
      setTypes(t.data);
      setAwards(a.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterYear]);

  const handleSave = async (data: StudentAwardCreate) => {
    await studentAwardApi.create(data);
    setFormOpen(false);
    load();
  };

  const handleDelete = async (a: StudentAward) => {
    if (!confirm(`Xoá giải thưởng của ${a.student.full_name}?`)) return;
    await studentAwardApi.delete(a.id);
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Giải thưởng / Tấm gương tiêu biểu</h1>
        <button
          onClick={() => setFormOpen(true)}
          disabled={types.length === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-base font-medium disabled:bg-slate-300"
        >
          + Trao giải
        </button>
      </div>

      <div className="mb-6">
        <AwardTypeManager types={types} onChange={load} />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <input
          value={filterYear}
          onChange={e => setFilterYear(e.target.value)}
          placeholder="Lọc theo năm học (vd 2025)"
          className={`${inputCls} max-w-xs`}
        />
      </div>

      {loading ? <p className="text-slate-400">Đang tải...</p> : (
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="min-w-full text-base">
            <thead className="bg-slate-50 border-b text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Học sinh</th>
                <th className="px-4 py-3 text-left font-medium">Lớp</th>
                <th className="px-4 py-3 text-left font-medium">Loại giải</th>
                <th className="px-4 py-3 text-left font-medium">Năm học</th>
                <th className="px-4 py-3 text-left font-medium">Mô tả</th>
                <th className="px-4 py-3 text-left font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {awards.map(a => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{a.student.full_name}</td>
                  <td className="px-4 py-3">{a.student.class_name}</td>
                  <td className="px-4 py-3">{a.award_type.name}</td>
                  <td className="px-4 py-3">{a.award_year}</td>
                  <td className="px-4 py-3 text-slate-500">{a.description}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(a)} className="px-2.5 py-1 rounded-md bg-red-50 text-red-500 hover:bg-red-100 text-sm font-medium border border-red-200">
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
              {awards.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Chưa có giải thưởng nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Trao giải thưởng">
        <StudentAwardForm types={types} onSave={handleSave} onCancel={() => setFormOpen(false)} />
      </Modal>
    </div>
  );
}