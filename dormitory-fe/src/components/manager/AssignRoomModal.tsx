import { useEffect, useState } from 'react';
import { floorApi, roomApi, studentApi } from '../../services/api';
import type { Building, Floor, Room, Student } from '../../services/api';
import Modal from './Modal';

interface Props {
  student: Student;
  buildings: Building[];
  onClose: () => void;
  onDone: () => void;
}

export default function AssignRoomModal({ student, buildings, onClose, onDone }: Props) {
  const [floors, setFloors]   = useState<Floor[]>([]);
  const [rooms, setRooms]     = useState<Room[]>([]);
  const [selBuilding, setSelBuilding] = useState('');
  const [selFloor, setSelFloor]       = useState('');
  const [selRoom, setSelRoom]         = useState('');
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    if (selBuilding) floorApi.list(Number(selBuilding)).then(r => { setFloors(r.data); setSelFloor(''); setRooms([]); });
  }, [selBuilding]);

  useEffect(() => {
    if (selFloor) roomApi.list(Number(selFloor)).then(r => setRooms(r.data.filter(r => r.type === 'DORM')));
  }, [selFloor]);

  const handleAssign = async () => {
    setSaving(true);
    try {
      await studentApi.assignRoom(student.id, selRoom ? Number(selRoom) : null);
      onDone();
    } finally { setSaving(false); }
  };

  const selCls = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 outline-none w-full';

  return (
    <Modal open title={`Xếp phòng: ${student.full_name}`} onClose={onClose}>
      <div className="space-y-3">
        {student.room_id && (
          <div className="text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
            Phòng hiện tại: <span className="font-medium">{student.building_code} - T{student.floor_number} - {student.room_label}</span>
          </div>
        )}
        <select value={selBuilding} onChange={e => setSelBuilding(e.target.value)} className={selCls}>
          <option value="">Chọn tòa</option>
          {buildings.map(b => <option key={b.id} value={b.id}>{b.code}</option>)}
        </select>
        <select value={selFloor} onChange={e => setSelFloor(e.target.value)} className={selCls} disabled={!selBuilding}>
          <option value="">Chọn tầng</option>
          {floors.map(f => <option key={f.id} value={f.id}>Tầng {f.number}</option>)}
        </select>
        <select value={selRoom} onChange={e => setSelRoom(e.target.value)} className={selCls} disabled={!selFloor}>
          <option value="">Chọn phòng</option>
          {rooms.map(r => (
            <option key={r.id} value={r.id} disabled={r.available_slots <= 0}>
              {r.label} ({r.occupancy}/{r.capacity}){r.available_slots <= 0 ? ' - Đầy' : ''}
            </option>
          ))}
        </select>
        <div className="flex justify-between gap-2 pt-2">
          {student.room_id && (
            <button onClick={() => studentApi.assignRoom(student.id, null).then(onDone)}
              className="px-4 py-2 rounded-lg border border-red-300 text-red-600 text-sm hover:bg-red-50">
              Hủy xếp phòng
            </button>
          )}
          <div className="flex gap-2 ml-auto">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm">Hủy</button>
            <button onClick={handleAssign} disabled={!selRoom || saving}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Đang lưu...' : 'Xếp phòng'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}