import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import type { SearchFilters } from '../types';

export default function Search() {
  const { searchStudents, data } = useData();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [results, setResults] = useState(data.students);

  const [searchForm, setSearchForm] = useState({
    id: '',
    name: '',
    sex: '',
    birthDate: '',
    hometown: '',
    className: '',
    room: '',
    buildingId: '',
    floorId: '',
    roomId: '',
  });


  const getRoomName = (roomId: string) => {
    for (const b of data.buildings) {
      for (const f of b.floors) {
        const room = f.rooms.find(r => r.id === roomId);
        if (room) return room.name;
      }
    }
    return roomId;
  };

  const normalize = (s: string) => s.toLowerCase().trim();

  const getLocationInfo = (roomId: string) => {
    for (const building of data.buildings) {
      for (const floor of building.floors) {
        const room = floor.rooms.find(
          r => r.id === roomId
        );

        if (room) {
          return {
            buildingId: building.id,
            buildingName: building.name,
            floorId: floor.id,
            floorName: floor.name,
            roomName: room.name,
          };
        }
      }
    }

    return undefined;
  };

  useEffect(() => {
    let buildingId = searchParams.get('buildingId') || '';
    let floorId = searchParams.get('floorId') || '';
    let roomId = searchParams.get('roomId') || '';
    let roomName = '';

    // Nếu có floorId thì suy ra buildingId
    if (floorId && !buildingId) {
      const building = data.buildings.find(b =>
        b.floors.some(f => f.id === floorId)
      );

      if (building) {
        buildingId = building.id;
      }
    }

    // Nếu có roomId thì suy ra floorId + buildingId
    if (roomId) {
      for (const building of data.buildings) {
        for (const floor of building.floors) {
          const room = floor.rooms.find(
            r => r.id === roomId
          );

          if (room) {
            buildingId = building.id;
            floorId = floor.id;
            roomId = room.id;
            roomName = room.name;
            break;
          }
        }
      }
    }

    setSearchForm(prev => ({
        ...prev,
        buildingId,
        floorId,
        roomId,
        room: roomName,
    }));
  }, [searchParams, data.buildings]);

  useEffect(() => {
    const filtered = data.students.filter(student => {
      const location = getLocationInfo(student.roomId);

      return (
        (!searchForm.id ||
          String(student.id).startsWith(searchForm.id))

        &&

        (!searchForm.name ||
          normalize(student.name).startsWith(
            normalize(searchForm.name)
          ))

        &&

        (!searchForm.birthDate ||
          student.birthDate.startsWith(searchForm.birthDate))

        &&
        (!searchForm.sex ||
          student.sex === searchForm.sex)

        &&

        (!searchForm.hometown ||
          normalize(student.hometown).startsWith(
            normalize(searchForm.hometown)
          ))

        &&

        (!searchForm.className ||
          normalize(student.class).startsWith(
            normalize(searchForm.className)
          ))

        &&

        (!searchForm.room ||
          normalize(location?.roomName ?? '').startsWith(
            normalize(searchForm.room)
          ))

        &&

        (!searchForm.buildingId ||
          location?.buildingId === searchForm.buildingId)

        &&

        (!searchForm.floorId ||
          location?.floorId === searchForm.floorId)

        &&

        (!searchForm.roomId ||
          student.roomId === searchForm.roomId)
      );
    });

    setResults(filtered);
  }, [searchForm, data.students]);


  const clearFilters = () => {
    setSearchForm({
      id: '',
      name: '',
      sex: '',
      birthDate: '',
      hometown: '',
      className: '',
      room: '',
      buildingId: '',
      floorId: '',
      roomId: '',
    });

    setResults(data.students);
  };

  const selectedBuilding = data.buildings.find(
    b => b.id === searchForm.buildingId
  );

  const availableFloors = selectedBuilding?.floors ?? [];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tìm kiếm học sinh</h1>
      <div className="bg-white/85 backdrop-blur-sm rounded-xl shadow-md border border-white/40 p-5 mb-6">
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <input
              placeholder="Mã"
              value={searchForm.id}
              onChange={e =>
                setSearchForm({ ...searchForm, id: e.target.value })
              }
              className="rounded-lg border border-slate-200 bg-white/90 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />

            <input
              placeholder="Họ tên"
              value={searchForm.name}
              onChange={e =>
                setSearchForm({ ...searchForm, name: e.target.value })
              }
              className="rounded-lg border border-slate-200 bg-white/90 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />

            <input
              type="date"
              value={searchForm.birthDate}
              onChange={e =>
                setSearchForm({ ...searchForm, birthDate: e.target.value })
              }
              className="rounded-lg border border-slate-200 bg-white/90 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />

            <select
              value={searchForm.sex}
              onChange={e =>
                setSearchForm({
                  ...searchForm,
                  sex: e.target.value,
                })
              }
              className="rounded-lg border border-slate-200 bg-white/90 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"

            >
              <option value="">Tất cả giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>

            <input
              placeholder="Quê quán"
              value={searchForm.hometown}
              onChange={e =>
                setSearchForm({ ...searchForm, hometown: e.target.value })
              }
              className="rounded-lg border border-slate-200 bg-white/90 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />

            <input
              placeholder="Lớp"
              value={searchForm.className}
              onChange={e =>
                setSearchForm({ ...searchForm, className: e.target.value })
              }
              className="rounded-lg border border-slate-200 bg-white/90 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />

            <input
              placeholder="Phòng"
              value={searchForm.room}
              onChange={e =>
                setSearchForm({ ...searchForm, room: e.target.value })
              }
              className="rounded-lg border border-slate-200 bg-white/90 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />

            <select
              value={searchForm.buildingId}
              onChange={e =>
                setSearchForm({
                  ...searchForm,
                  buildingId: e.target.value,
                  floorId: '',
                })
              }
              className="rounded-lg border border-slate-200 bg-white/90 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            >
              <option value="">Tất cả tòa</option>

              {data.buildings.map(building => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>

            <select
              value={searchForm.floorId}
              onChange={e =>
                setSearchForm({
                  ...searchForm,
                  floorId: e.target.value,
                })
              }
              className="rounded-lg border border-slate-200 bg-white/90 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            >
              <option value="">Tất cả tầng</option>

              {availableFloors.map(floor => (
                <option key={floor.id} value={floor.id}>
                  {floor.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center mt-5">
            <button
              type="button"
              onClick={clearFilters}
              className="
                px-5 py-2
                rounded-lg
                bg-slate-200
                hover:bg-slate-300
                transition
                font-medium
              "
            >
              Xóa toàn bộ bộ lọc
            </button>
          </div>
        </div>
      </div>

      
      {results.length > 0 ? (
        <div className="overflow-x-auto bg-white/85 backdrop-blur-sm rounded-xl shadow-md border border-white/40">
          <table className="min-w-full">
            <thead className="bg-slate-50/80 border-b">
              <tr>
                <th className="px-4 py-3 text-left w-16">STT</th>
                <th className="px-4 py-3 text-left">Mã</th>
                <th className="px-4 py-3 text-left">Họ tên</th>
                <th className="px-4 py-3 text-left">Giới tính</th>
                <th className="px-4 py-3 text-left">Ngày sinh</th>
                <th className="px-4 py-3 text-left">Quê quán</th>
                <th className="px-4 py-3 text-left">Lớp</th>
                <th className="px-4 py-3 text-left">Phòng</th>
                <th className="px-4 py-3 text-left">Tòa - Tầng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {results.map((student, index) => (
                <tr key={student.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-medium text-slate-500">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3">{student.id}</td>
                  <td className="px-4 py-3 font-medium">{student.name}</td>
                  <td className="px-4 py-3">{student.sex}</td>
                  <td className="px-4 py-3">{student.birthDate}</td>
                  <td className="px-4 py-3">{student.hometown}</td>
                  <td className="px-4 py-3">{student.class}</td>
                  <td className="px-4 py-3">{getRoomName(student.roomId)}</td>
                  <td className="px-4 py-3">
                    {(() => {
                      const loc = getLocationInfo(student.roomId);

                      return (
                        <span>
                          {loc?.buildingName} - {loc?.floorName}
                        </span>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">Không tìm thấy học sinh nào.</p>
      )}
    </div>
  );
}