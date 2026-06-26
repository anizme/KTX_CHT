import { useEffect, useState } from 'react';
import { studentApi, buildingApi, floorApi } from '../../services/api';
import type { Student, StudentDetail, StudentCreate, Building, Floor } from '../../services/api';
import { GENDER_LABELS } from '../../types';
import Modal from '../../components/manager/Modal';
import StudentForm from '../../components/manager/StudentForm';
import AssignRoomModal from '../../components/manager/AssignRoomModal';
import ViolationModal from '../../components/manager/ViolationModal';
import StudentDetailModal from '../../components/manager/StudentDetailModal';
import AutoAssignModal from '../../components/manager/AutoAssignModal';

export default function Students() {
  const [students, setStudents]   = useState<Student[]>([]);
  const [loading, setLoading]     = useState(true);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors]       = useState<Floor[]>([]);

  const [filterName, setFilterName]         = useState('');
  const [filterGender, setFilterGender]     = useState('');
  const [filterClass, setFilterClass]       = useState('');
  const [filterHometown, setFilterHometown] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('');
  const [filterFloor, setFilterFloor]       = useState('');
  const [filterRoom, setFilterRoom]         = useState('');
  const [autoAssignOpen, setAutoAssignOpen] = useState(false);

  const [formOpen, setFormOpen]               = useState(false);
  const [editing, setEditing]                 = useState<StudentDetail | null>(null);
  const [assignTarget, setAssignTarget]       = useState<Student | null>(null);
  const [violationTarget, setViolationTarget] = useState<Student | null>(null);
  const [detailTarget, setDetailTarget] = useState<Student | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filterAssignStatus, setFilterAssignStatus] = useState('');


  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (filterGender)   params.gender       = filterGender;
      if (filterClass)    params.class_name   = filterClass;
      if (filterHometown) params.hometown     = filterHometown;
      if (filterBuilding) params.building_id  = filterBuilding;
      if (filterFloor)    params.floor_number = filterFloor;
      if (filterAssignStatus === 'UNASSIGNED') params.room_id = 'null';
      else if (filterAssignStatus === 'ASSIGNED') {
        // BE không hỗ trợ filter "có phòng" trực tiếp → lọc client-side
      }

      const { data } = await studentApi.list(params);
      let result = data;
      if (filterAssignStatus === 'ASSIGNED') result = result.filter(s => s.room_id !== null);
      if (filterName) result = result.filter(s => s.full_name.toLowerCase().includes(filterName.toLowerCase()));
      if (filterRoom) result = result.filter(s => s.room_label?.toLowerCase().includes(filterRoom.toLowerCase()));
      setStudents(result);
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (id: number) => {
    setSelectedIds(prev =>
        prev.includes(id)
            ? prev.filter(x => x !== id)
            : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === students.length) {
        setSelectedIds([]);
    } else {
        setSelectedIds(students.map(s => s.id));
    }
  };

  const handleAutoAssign = () => {
    const alreadyAssigned = students.filter(
      s => selectedIds.includes(s.id) && s.room_id !== null
    );

    if (alreadyAssigned.length > 0) {
      const names = alreadyAssigned.map(s => `• ${s.full_name}`).join('\n');
      alert(`Các học sinh sau đã có phòng, vui lòng bỏ chọn trước khi xếp tự động:\n\n${names}`);
      return;
    }

    setAutoAssignOpen(true);
  };

  useEffect(() => { buildingApi.list().then(r => setBuildings(r.data)); }, []);

  useEffect(() => {
    if (filterBuilding) {
      floorApi.list(Number(filterBuilding)).then(r => setFloors(r.data));
      setFilterFloor('');
    } else {
      setFloors([]);
      setFilterFloor('');
    }
  }, [filterBuilding]);

  useEffect(() => { load(); }, [filterGender, filterBuilding, filterFloor]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit   = async (s: Student) => {
    const { data } = await studentApi.get(s.id);
    setEditing(data);
    setFormOpen(true);
  };

  const handleDelete = async (s: Student) => {
    if (!confirm(`Xóa học sinh ${s.full_name}?`)) return;
    await studentApi.delete(s.id);
    load();
  };

  const handleBulkDelete = async () => {

    if (
        !confirm(
            `Xóa ${selectedIds.length} học sinh?`
        )
    ) return;

    await Promise.all(
        selectedIds.map(id => studentApi.delete(id))
    );

    alert("Đã xóa.");

    setSelectedIds([]);

    load();
  };

  const handleSave = async (payload: StudentCreate, id?: number) => {
    if (id) await studentApi.update(id, payload);
    else    await studentApi.create(payload);
    setFormOpen(false);
    load();
  };

  const clearFilters = () => {
    setFilterName('');
    setFilterGender('');
    setFilterClass('');
    setFilterHometown('');
    setFilterBuilding('');
    setFilterFloor('');
    setFilterRoom('');

    setFloors([]);
    load();
  };
  const inputCls = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Học sinh</h1>
        <button onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-base font-medium">
          + Thêm học sinh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            placeholder="Họ tên"
            value={filterName}
            onChange={e => setFilterName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
            className={inputCls}
          />

          <input
            placeholder="Lớp"
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
            className={inputCls}
          />

          <input
            placeholder="Quê quán"
            value={filterHometown}
            onChange={e => setFilterHometown(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
            className={inputCls}
          />

          <input
            placeholder="Phòng"
            value={filterRoom}
            onChange={e => setFilterRoom(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
            className={inputCls}
          />

          <select
            value={filterAssignStatus}
            onChange={e => setFilterAssignStatus(e.target.value)}
            className={inputCls}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ASSIGNED">Đã xếp phòng</option>
            <option value="UNASSIGNED">Chưa xếp phòng</option>
          </select>

          <select
            value={filterGender}
            onChange={e => setFilterGender(e.target.value)}
            className={inputCls}
          >
            <option value="">Tất cả giới tính</option>
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
          </select>

          <select
            value={filterBuilding}
            onChange={e => setFilterBuilding(e.target.value)}
            className={inputCls}
          >
            <option value="">Tất cả tòa</option>
            {buildings.map(b => (
              <option key={b.id} value={b.id}>
                {b.code}
              </option>
            ))}
          </select>

          <select
            value={filterFloor}
            onChange={e => setFilterFloor(e.target.value)}
            className={inputCls}
            disabled={!filterBuilding}
          >
            <option value="">Tất cả tầng</option>
            {floors.map(f => (
              <option key={f.id} value={f.number}>
                Tầng {f.number}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-3 mb-6">
        <button
          onClick={clearFilters}
          className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-base font-medium"
        >
          Xóa bộ lọc
        </button>

        <button
          onClick={load}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-base font-medium"
        >
          Tìm kiếm
        </button>
        
      </div>
      <div className="flex gap-3 mb-4">
        <button
            onClick={handleBulkDelete}
            disabled={selectedIds.length === 0}
            className="
                px-4 py-2 rounded-lg
                bg-red-600 text-white
                hover:bg-red-700
                disabled:bg-slate-300
                disabled:text-slate-500
                disabled:cursor-not-allowed
                text-base font-medium
            "
        >
            Xóa ({selectedIds.length})
        </button>

        <button
          onClick={() => selectedIds.length > 0 && handleAutoAssign()}
          disabled={selectedIds.length === 0}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700
            disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-base font-medium"
        >
          Tự động xếp phòng ({selectedIds.length})
        </button>
      </div>
      {loading ? <p className="text-slate-400">Đang tải...</p> : (
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="min-w-full text-base">
            <thead className="bg-slate-50 border-b text-slate-600">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={
                      students.length > 0 &&
                      selectedIds.length === students.length
                    }
                    onChange={toggleAll}
                  />
                </th>

                <th className="px-4 py-3 text-left font-medium">STT</th>
                <th className="px-4 py-3 text-left font-medium">Họ tên</th>
                <th className="px-4 py-3 text-left font-medium">Giới tính</th>
                <th className="px-4 py-3 text-left font-medium">Lớp</th>
                <th className="px-4 py-3 text-left font-medium">Quê quán</th>
                <th className="px-4 py-3 text-left font-medium">Phòng</th>
                <th className="px-4 py-3 text-left font-medium">Vi phạm</th>
                <th className="px-4 py-3 text-left font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map((s, i) => (
                <tr
                  key={s.id}
                  onClick={() => setDetailTarget(s)}
                  className="hover:bg-slate-100 cursor-pointer"
                >
                  <td
                      className="px-4 py-3"
                      onClick={e => e.stopPropagation()}
                  >
                      <input
                          type="checkbox"
                          checked={selectedIds.includes(s.id)}
                          onChange={() => toggleStudent(s.id)}
                      />
                  </td>
                  <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{s.full_name}</td>
                  <td className="px-4 py-3">{GENDER_LABELS[s.gender as 'MALE'|'FEMALE'] ?? s.gender}</td>
                  <td className="px-4 py-3">{s.class_name}</td>
                  <td className="px-4 py-3">{s.hometown}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {s.room_label
                      ? `${s.building_code} - T${s.floor_number} - P${s.room_label}`
                      : <span className="text-slate-400">Chưa xếp</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {s.violation_count > 0
                      ? <span className="text-red-600 font-semibold">{s.violation_count}</span>
                      : <span className="text-slate-300">0</span>}
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={e => { e.stopPropagation(); openEdit(s); }}
                        className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-medium border border-blue-200"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setAssignTarget(s); }}
                        className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs font-medium border border-emerald-200"
                      >
                        Xếp phòng
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setViolationTarget(s); }}
                        className="px-2.5 py-1 rounded-md bg-orange-50 text-orange-500 hover:bg-orange-100 text-xs font-medium border border-orange-200"
                      >
                        Vi phạm
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(s); }}
                        className="px-2.5 py-1 rounded-md bg-red-50 text-red-500 hover:bg-red-100 text-xs font-medium border border-red-200"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Không có học sinh nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {detailTarget && (
        <StudentDetailModal
          student={detailTarget}
          onClose={() => setDetailTarget(null)}
        />
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)}
        title={editing ? 'Cập nhật học sinh' : 'Thêm học sinh'}>
        <StudentForm initial={editing} onSave={handleSave} onCancel={() => setFormOpen(false)} />
      </Modal>

      {assignTarget && (
        <AssignRoomModal student={assignTarget} buildings={buildings}
          onClose={() => setAssignTarget(null)}
          onDone={() => { setAssignTarget(null); load(); }} />
      )}

      {violationTarget && (
        <ViolationModal student={violationTarget}
          onClose={() => { setViolationTarget(null); load(); }} />
      )}

      {autoAssignOpen && (
        <AutoAssignModal
          studentIds={selectedIds}
          buildings={buildings}
          onClose={() => setAutoAssignOpen(false)}
          onDone={() => { setAutoAssignOpen(false); setSelectedIds([]); load(); }}
        />
      )}
    </div>
  );
}