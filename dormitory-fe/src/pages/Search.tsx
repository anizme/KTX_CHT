import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import type { Gender, StudentSearchForm } from '../types';

const inputCls =
  'rounded-lg border border-slate-200 bg-white/90 px-3 py-2 shadow-sm ' +
  'focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none';

const EMPTY_FORM: StudentSearchForm = {
  id: '', full_name: '', gender: '' as Gender,
  hometown: '', class_name: '', room_label: '',
  building_code: '', floor_number: '',
};

const TABLE_HEADERS = [
  'STT', 'Họ tên', 'Giới tính', 'Quê quán',
  'Lớp', 'Phòng', 'Tòa - Tầng',
];

export default function Search() {
  const { data, searchStudents, getLocationInfo } = useData();
  const [searchParams] = useSearchParams();

  const [form, setForm]             = useState<StudentSearchForm>(EMPTY_FORM);
  const [buildingId, setBuildingId] = useState('');
  const [floorId, setFloorId]       = useState('');
  const [roomId, setRoomId]         = useState('');

  useEffect(() => {
    const bId = searchParams.get('buildingId') ?? '';
    const fId = searchParams.get('floorId')    ?? '';
    const rId = searchParams.get('roomId')     ?? '';

    setBuildingId(bId);
    setFloorId(fId);
    setRoomId(rId);

    // Sync hiển thị ngược lại vào form
    if (rId) {
      const room = data.buildings
        .flatMap(b => b.floors.flatMap(f => f.rooms))
        .find(r => String(r.id) === rId);
      if (room) set({ room_label: room.label });
    } else if (fId) {
      set({ room_label: '' });
    } else {
      set({ room_label: '' });
    }
  }, [searchParams, data.buildings]);

  const set = (patch: Partial<StudentSearchForm>) =>
    setForm(prev => ({ ...prev, ...patch }));

  const results = searchStudents({
    full_name:   form.full_name  || undefined,
    gender:      (form.gender as Gender) || undefined,
    hometown:    form.hometown   || undefined,
    class_name:  form.class_name || undefined,
    room_label:  form.room_label || undefined,
    building_id: buildingId      || undefined,
    floor_id:    floorId         || undefined,
    room_id:     roomId          || undefined,
  });

  const availableFloors =
    data.buildings.find(b => String(b.id) === buildingId)?.floors ?? [];

  const clearFilters = () => {
    setForm(EMPTY_FORM);
    setBuildingId('');
    setFloorId('');
    setRoomId('');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tìm kiếm học sinh</h1>

      <div className="bg-white/85 backdrop-blur-sm rounded-xl shadow-md border border-white/40 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="Họ tên"   value={form.full_name}
            onChange={e => set({ full_name: e.target.value })}  className={inputCls} />

          <input placeholder="Quê quán" value={form.hometown}
            onChange={e => set({ hometown: e.target.value })}   className={inputCls} />

          <input placeholder="Lớp"      value={form.class_name}
            onChange={e => set({ class_name: e.target.value })} className={inputCls} />

          <input placeholder="Phòng"    value={form.room_label}
            onChange={e => set({ room_label: e.target.value })} className={inputCls} />

          <select value={form.gender}
            onChange={e => set({ gender: e.target.value as Gender })}
            className={inputCls}>
            <option value="">Tất cả giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>

          <select value={buildingId}
            onChange={e => { setBuildingId(e.target.value); setFloorId(''); setRoomId(''); }}
            className={inputCls}>
            <option value="">Tất cả tòa</option>
            {data.buildings.map(b => (
              <option key={b.id} value={b.id}>{b.code}</option>
            ))}
          </select>

          <select value={floorId}
            onChange={e => { setFloorId(e.target.value); setRoomId(''); }}
            className={inputCls}>
            <option value="">Tất cả tầng</option>
            {availableFloors.map(f => (
              <option key={f.id} value={f.id}>Tầng {f.number} ({f.code})</option>
            ))}
          </select>
        </div>

        <div className="flex justify-center mt-5">
          <button onClick={clearFilters}
            className="px-5 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 transition font-medium">
            Xóa toàn bộ bộ lọc
          </button>
        </div>
      </div>

      {results.length > 0 ? (
        <div className="overflow-x-auto bg-white/85 backdrop-blur-sm rounded-xl shadow-md border border-white/40">
          <table className="min-w-full">
            <thead className="bg-slate-50/80 border-b">
              <tr>
                {TABLE_HEADERS.map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {results.map((student, i) => {
                const loc = student.room_id
                  ? getLocationInfo(student.room_id)
                  : undefined;
                return (
                  <tr key={student.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{student.full_name}</td>
                    <td className="px-4 py-3">{student.gender}</td>
                    <td className="px-4 py-3">{student.hometown}</td>
                    <td className="px-4 py-3">{student.class_name}</td>
                    <td className="px-4 py-3 font-mono">{student.room_label || '—'}</td>
                    <td className="px-4 py-3">
                      {loc ? `${loc.building.code} - Tầng ${loc.floor.number}` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">Không tìm thấy học sinh nào.</p>
      )}
    </div>
  );
}