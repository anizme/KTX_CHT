import { useEffect, useState } from 'react';
import { buildingApi, floorApi, roomApi } from '../../services/api';
import type { Building, Floor, Room } from '../../services/api';
import Modal from '../../components/manager/Modal';
import RoomDetailModal from '../../components/manager/RoomDetailModal';

import { ROOM_TYPE_LABELS } from '../../types/index';

const ROOM_TYPE_COLORS: Record<string, string> = {
  DORM: 'text-blue-600', STUDY: 'text-emerald-600', CANTEEN: 'text-orange-500',
  COMMON: 'text-purple-500', GUEST: 'text-cyan-500',
  SUPERVISOR: 'text-rose-500', OFFICE: 'text-slate-500', OTHER: 'text-slate-400',
};

export default function Rooms() {
  const [buildings, setBuildings]     = useState<Building[]>([]);
  const [floors, setFloors]           = useState<Floor[]>([]);
  const [rooms, setRooms]             = useState<Room[]>([]);
  const [selBuilding, setSelBuilding] = useState('');
  const [selFloor, setSelFloor]       = useState('');
  const [detailRoom, setDetailRoom]   = useState<Room | null>(null);

  const [addBuilding, setAddBuilding]   = useState(false);
  const [newBuildingCode, setNewBuildingCode] = useState('');
  const [addFloor, setAddFloor]         = useState(false);
  const [newFloorNum, setNewFloorNum]   = useState('');
  const [addRoom, setAddRoom]           = useState(false);
  const [newRoom, setNewRoom]           = useState({ label: '', type: 'DORM', capacity: 6 });
  const [editRoom, setEditRoom]         = useState<Room | null>(null);
  const [editRoomData, setEditRoomData] = useState({ type: 'DORM', capacity: 6 });

  const loadBuildings = () => buildingApi.list().then(r => setBuildings(r.data));
  const loadRooms     = (floorId: string) =>
    // Không truyền type filter → lấy tất cả loại phòng
    roomApi.listAll(Number(floorId)).then(r => setRooms(r.data));

  useEffect(() => { loadBuildings(); }, []);

  useEffect(() => {
    if (selBuilding) {
      floorApi.list(Number(selBuilding)).then(r => { setFloors(r.data); setSelFloor(''); setRooms([]); });
    } else { setFloors([]); setSelFloor(''); setRooms([]); }
  }, [selBuilding]);

  useEffect(() => {
    if (selFloor) loadRooms(selFloor);
    else setRooms([]);
  }, [selFloor]);

  const handleAddBuilding = async () => {
    if (!newBuildingCode.trim()) return;
    await buildingApi.create(newBuildingCode.trim());
    setNewBuildingCode(''); setAddBuilding(false); loadBuildings();
  };

  const handleDeleteBuilding = async (id: number, code: string) => {
    if (!confirm(`Xóa tòa ${code}? Tất cả tầng và phòng bên trong cũng sẽ bị xóa.`)) return;
    await buildingApi.delete(id);
    setSelBuilding(''); loadBuildings();
  };

  const handleAddFloor = async () => {
    if (!selBuilding || !newFloorNum) return;
    await floorApi.create(Number(selBuilding), Number(newFloorNum));
    setNewFloorNum(''); setAddFloor(false);
    floorApi.list(Number(selBuilding)).then(r => setFloors(r.data));
  };

  const handleDeleteFloor = async (id: number, num: number) => {
    if (!confirm(`Xóa tầng ${num}?`)) return;
    await floorApi.delete(id);
    floorApi.list(Number(selBuilding)).then(r => { setFloors(r.data); setSelFloor(''); setRooms([]); });
  };

  const handleAddRoom = async () => {
    if (!selFloor || !newRoom.label) return;
    await roomApi.create({ ...newRoom, floor_id: Number(selFloor) });
    setNewRoom({ label: '', type: 'DORM', capacity: 6 }); setAddRoom(false);
    loadRooms(selFloor);
  };

  const handleUpdateRoom = async () => {
    if (!editRoom) return;
    await roomApi.update(editRoom.id, editRoomData);
    setEditRoom(null); loadRooms(selFloor);
  };

  const handleDeleteRoom = async (r: Room) => {
    if (!confirm(`Xóa phòng ${r.label}?`)) return;
    await roomApi.delete(r.id); loadRooms(selFloor);
  };

  const inputCls = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none w-full';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Quản lý phòng</h1>

      {/* Buildings */}
      <div className="bg-white rounded-xl border shadow-sm p-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-slate-700">Tòa nhà</h2>
          <button onClick={() => setAddBuilding(true)}
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
            + Thêm tòa
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {buildings.map(b => (
            <div key={b.id} onClick={() => setSelBuilding(String(b.id))}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition ${
                selBuilding === String(b.id)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'hover:bg-slate-50 border-slate-200'
              }`}>
              <div>
                <span className="font-medium">{b.code}</span>
                <span className="text-xs opacity-70 ml-2">{b.occupancy} HS - còn {b.available_slots} chỗ</span>
              </div>
              <button onClick={e => { e.stopPropagation(); handleDeleteBuilding(b.id, b.code); }}
                className="ml-1 opacity-50 hover:opacity-100 text-red-400">✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* Floors */}
      {selBuilding && (
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-slate-700">Tầng</h2>
            <button onClick={() => setAddFloor(true)}
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
              + Thêm tầng
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {floors.map(f => (
              <div key={f.id} onClick={() => setSelFloor(String(f.id))}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition ${
                  selFloor === String(f.id)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'hover:bg-slate-50 border-slate-200'
                }`}>
                <div>
                  <span className="font-medium">Tầng {f.number}</span>
                  <span className="text-xs opacity-70 ml-2">{f.occupancy} HS - còn {f.available_slots} chỗ</span>
                </div>
                <button onClick={e => { e.stopPropagation(); handleDeleteFloor(f.id, f.number); }}
                  className="ml-1 opacity-50 hover:opacity-100 text-red-400">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rooms */}
      {selFloor && (
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-slate-700">
              Phòng <span className="text-slate-400 font-normal text-sm">({rooms.length})</span>
            </h2>
            <button onClick={() => setAddRoom(true)}
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
              + Thêm phòng
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {rooms.map(r => (
              <div key={r.id}
                onClick={() => setDetailRoom(r)}
                className="border rounded-lg p-3 text-center text-sm hover:bg-blue-50 cursor-pointer transition">
                <div className="font-mono font-semibold">{r.label}</div>
                <div className={`text-xs mt-0.5 font-medium ${ROOM_TYPE_COLORS[r.type] ?? 'text-slate-400'}`}>
                  {ROOM_TYPE_LABELS[r.type] ?? r.type}
                </div>
                {r.type === 'DORM' && (
                  <div className="text-xs text-slate-400 mt-0.5">
                    {r.occupancy}/{r.capacity} - còn {r.available_slots}
                  </div>
                )}
                <div className="flex justify-center gap-2 mt-2" onClick={e => e.stopPropagation()}>
                  <button onClick={() => { setEditRoom(r); setEditRoomData({ type: r.type, capacity: r.capacity }); }}
                    className="text-blue-500 hover:underline text-xs">Sửa</button>
                  <button onClick={() => handleDeleteRoom(r)}
                    className="text-red-500 hover:underline text-xs">Xóa</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals thêm tòa/tầng/phòng/sửa phòng — giữ nguyên như cũ */}
      <Modal open={addBuilding} onClose={() => setAddBuilding(false)} title="Thêm tòa nhà">
        <div className="space-y-4">
          <input placeholder="Mã tòa (VD: NT1)" value={newBuildingCode}
            onChange={e => setNewBuildingCode(e.target.value)} className={inputCls} />
          <div className="flex justify-end gap-2">
            <button onClick={() => setAddBuilding(false)} className="px-4 py-2 rounded-lg border text-sm">Hủy</button>
            <button onClick={handleAddBuilding} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">Thêm</button>
          </div>
        </div>
      </Modal>

      <Modal open={addFloor} onClose={() => setAddFloor(false)} title="Thêm tầng">
        <div className="space-y-4">
          <input type="number" placeholder="Số tầng" value={newFloorNum}
            onChange={e => setNewFloorNum(e.target.value)} className={inputCls} />
          <div className="flex justify-end gap-2">
            <button onClick={() => setAddFloor(false)} className="px-4 py-2 rounded-lg border text-sm">Hủy</button>
            <button onClick={handleAddFloor} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">Thêm</button>
          </div>
        </div>
      </Modal>

      <Modal open={addRoom} onClose={() => setAddRoom(false)} title="Thêm phòng">
        <div className="space-y-4">
          <input placeholder="Nhãn phòng (VD: 201)" value={newRoom.label}
            onChange={e => setNewRoom({ ...newRoom, label: e.target.value })} className={inputCls} />
          <select value={newRoom.type}
            onChange={e => setNewRoom({ ...newRoom, type: e.target.value })} className={inputCls}>
            {Object.entries(ROOM_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <input type="number" placeholder="Sức chứa" value={newRoom.capacity}
            onChange={e => setNewRoom({ ...newRoom, capacity: Number(e.target.value) })} className={inputCls} />
          <div className="flex justify-end gap-2">
            <button onClick={() => setAddRoom(false)} className="px-4 py-2 rounded-lg border text-sm">Hủy</button>
            <button onClick={handleAddRoom} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">Thêm</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!editRoom} onClose={() => setEditRoom(null)} title={`Sửa phòng ${editRoom?.label}`}>
        <div className="space-y-4">
          <select value={editRoomData.type}
            onChange={e => setEditRoomData({ ...editRoomData, type: e.target.value })} className={inputCls}>
            {Object.entries(ROOM_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <input type="number" placeholder="Sức chứa" value={editRoomData.capacity}
            onChange={e => setEditRoomData({ ...editRoomData, capacity: Number(e.target.value) })} className={inputCls} />
          <div className="flex justify-end gap-2">
            <button onClick={() => setEditRoom(null)} className="px-4 py-2 rounded-lg border text-sm">Hủy</button>
            <button onClick={handleUpdateRoom} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">Lưu</button>
          </div>
        </div>
      </Modal>

      {detailRoom && (
        <RoomDetailModal room={detailRoom} onClose={() => setDetailRoom(null)} />
      )}
    </div>
  );
}