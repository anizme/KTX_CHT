import { useEffect, useState } from 'react';
import { floorApi, roomApi, buildingApi } from '../../services/api';
import type { Building, Floor, Room, AutoAssignResult } from '../../services/api';
import { studentApi } from '../../services/api';
import Modal from './Modal';

interface Props {
  studentIds: number[];
  buildings: Building[];
  onClose: () => void;
  onDone: () => void;
}

export default function AutoAssignModal({ studentIds, buildings, onClose, onDone }: Props) {
  const [selBuilding, setSelBuilding] = useState('');
  const [selFloor, setSelFloor]       = useState('');
  const [floors, setFloors]           = useState<Floor[]>([]);
  const [rooms, setRooms]             = useState<Room[]>([]);

  // selectedRooms lưu cả object Room để hiển thị, không chỉ id
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([]);

  const [result, setResult]   = useState<AutoAssignResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selBuilding) {
      floorApi.list(Number(selBuilding)).then(r => {
        setFloors(r.data);
        setSelFloor('');
        setRooms([]);
      });
    } else {
      setFloors([]); setSelFloor(''); setRooms([]);
    }
  }, [selBuilding]);

  useEffect(() => {
    if (selFloor) {
      roomApi.list(Number(selFloor)).then(r =>
        setRooms(r.data.filter(room => room.available_slots > 0))
      );
    } else {
      setRooms([]);
    }
  }, [selFloor]);

  const isSelected = (id: number) => selectedRooms.some(r => r.id === id);

  const toggleRoom = (room: Room) =>
    setSelectedRooms(prev =>
      isSelected(room.id) ? prev.filter(r => r.id !== room.id) : [...prev, room]
    );

  const toggleAllRooms = () => {
    const allSelected = rooms.every(r => isSelected(r.id));
    if (allSelected) {
      setSelectedRooms(prev => prev.filter(r => !rooms.some(rm => rm.id === r.id)));
    } else {
      setSelectedRooms(prev => {
        const newOnes = rooms.filter(r => !isSelected(r.id));
        return [...prev, ...newOnes];
      });
    }
  };

  const removeSelected = (id: number) =>
    setSelectedRooms(prev => prev.filter(r => r.id !== id));

  const handleAssign = async () => {
    setLoading(true);
    try {
      const { data } = await studentApi.autoAssign(
        studentIds,
        selectedRooms.length > 0 ? selectedRooms.map(r => r.id) : undefined,
      );
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  const selCls = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 outline-none w-full';

  return (
    <Modal open title={`Tự động xếp phòng (${studentIds.length} học sinh)`} onClose={onClose}>
      {result ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">{result.assigned_students.length}</div>
              <div className="text-sm text-emerald-700 mt-1">Đã xếp thành công</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-500">{result.unassigned_students.length}</div>
              <div className="text-sm text-red-600 mt-1">Không xếp được</div>
            </div>
          </div>

          {result.unassigned_students.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
              <div className="font-medium mb-1">Học sinh chưa xếp được (mã):</div>
              <div className="text-sm">{result.unassigned_students.join(', ')}</div>
              <div className="text-sm mt-1 opacity-75">Có thể do không đủ phòng hoặc không phù hợp giới tính.</div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button onClick={onDone}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
              Xong
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Chọn phòng muốn xếp vào. Nếu không chọn phòng nào, hệ thống tự chọn tất cả phòng còn trống.
          </p>

          {/* Phòng đã chọn — hiển thị persistent dù đổi tầng */}
          {selectedRooms.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm font-medium text-blue-700 mb-2">
                Phòng đã chọn ({selectedRooms.length}):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedRooms.map(r => (
                  <span key={r.id}
                    className="inline-flex items-center gap-1 bg-white border border-blue-300 text-blue-700 text-sm rounded-full px-2 py-0.5">
                    <span className="font-mono font-semibold">{r.code ?? r.label}</span>
                    <span className="text-blue-400">({r.available_slots} chỗ)</span>
                    <button onClick={() => removeSelected(r.id)}
                      className="text-blue-400 hover:text-red-500 ml-0.5 leading-none">✕</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Chọn tòa / tầng */}
          <div className="grid grid-cols-2 gap-3">
            <select value={selBuilding} onChange={e => setSelBuilding(e.target.value)} className={selCls}>
              <option value="">Chọn tòa</option>
              {buildings.map(b => <option key={b.id} value={b.id}>{b.code}</option>)}
            </select>
            <select value={selFloor} onChange={e => setSelFloor(e.target.value)} className={selCls} disabled={!selBuilding}>
              <option value="">Chọn tầng</option>
              {floors.map(f => <option key={f.id} value={f.id}>Tầng {f.number}</option>)}
            </select>
          </div>

          {/* Danh sách phòng còn chỗ của tầng đang xem */}
          {rooms.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-500">
                  Phòng còn chỗ tầng này ({rooms.length})
                </span>
                <button onClick={toggleAllRooms} className="text-sm text-blue-600 hover:underline">
                  {rooms.every(r => isSelected(r.id)) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {rooms.map(r => (
                  <label key={r.id}
                    className={`flex items-center gap-2 border rounded-lg px-2 py-1.5 text-sm cursor-pointer transition ${
                      isSelected(r.id)
                        ? 'bg-blue-50 border-blue-400'
                        : 'hover:bg-slate-50 border-slate-200'
                    }`}>
                    <input type="checkbox" className="shrink-0"
                      checked={isSelected(r.id)}
                      onChange={() => toggleRoom(r)} />
                    <span>
                      <span className="font-mono font-semibold">{r.label}</span>
                      <span className="text-slate-400 ml-1">({r.available_slots} chỗ)</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {selFloor && rooms.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-2">Không có phòng còn chỗ ở tầng này</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm">Hủy</button>
            <button onClick={handleAssign} disabled={loading}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-50">
              {loading ? 'Đang xếp...' : 'Xếp phòng'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}