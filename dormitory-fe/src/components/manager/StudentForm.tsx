import { useState } from 'react';
import type { StudentDetail, StudentCreate } from '../../services/api';

interface Props {
  initial: StudentDetail | null;
  onSave: (data: StudentCreate, id?: number) => Promise<void>;
  onCancel: () => void;
}

interface Field {
  key: keyof StudentCreate;
  label: string;
  type?: string;
  required?: boolean;
}

const FIELDS: Field[] = [
  { key: 'full_name',    label: 'Họ tên',           required: true },
  { key: 'class_name',   label: 'Lớp' },
  { key: 'hometown',     label: 'Quê quán' },
  { key: 'phone',        label: 'Số điện thoại',    required: true },
  { key: 'parent_phone', label: 'SĐT phụ huynh' },
  { key: 'note',         label: 'Ghi chú' },
];

export default function StudentForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState<StudentCreate>({
    full_name:    initial?.full_name    ?? '',
    gender:       initial?.gender       ?? 'MALE',
    hometown:     initial?.hometown     ?? '',
    class_name:   initial?.class_name   ?? '',
    phone:        initial?.phone        ?? '',
    parent_phone: initial?.parent_phone ?? '',
    note:         initial?.note         ?? '',
    room_id:      initial?.room_id      ?? null,
  });
  const [saving, setSaving] = useState(false);

  const handle = async () => {
    setSaving(true);
    try { await onSave(form, initial?.id); }
    finally { setSaving(false); }
  };

  const inputCls = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none w-full';

  return (
    <div className="space-y-3">
      {/* Giới tính — riêng vì là select */}
      <div>
        <label className="block text-sm font-medium text-slate-500 mb-1">
          Giới tính <span className="text-red-400">*</span>
        </label>
        <select value={form.gender}
          onChange={e => setForm({ ...form, gender: e.target.value })}
          className={inputCls}>
          <option value="MALE">Nam</option>
          <option value="FEMALE">Nữ</option>
        </select>
      </div>

      {FIELDS.map(({ key, label, type, required }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-slate-500 mb-1">
            {label} {required && <span className="text-red-400">*</span>}
          </label>
          {key === 'note' ? (
            <textarea
              value={(form[key] as string) ?? ''}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
              className={inputCls + ' resize-none'} rows={2} />
          ) : (
            <input
              type={type ?? 'text'}
              value={(form[key] as string) ?? ''}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
              className={inputCls} />
          )}
        </div>
      ))}

      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border text-sm">Hủy</button>
        <button onClick={handle} disabled={saving}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>
    </div>
  );
}