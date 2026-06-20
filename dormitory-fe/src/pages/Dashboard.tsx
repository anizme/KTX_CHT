import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { data, loading } = useData();
  const navigate = useNavigate();

  const [expandedBuildings, setExpandedBuildings] = useState<Record<string, boolean>>({});
  const [expandedFloors, setExpandedFloors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (data.buildings.length > 0) {
      setExpandedBuildings(
        data.buildings.reduce<Record<string, boolean>>(
          (acc, b) => ({ ...acc, [b.id]: true }),
          {}
        )
      );
    }
  }, [data.buildings]);

  const toggleBuilding = (id: string) =>
    setExpandedBuildings(prev => ({ ...prev, [id]: !prev[id] }));

  const toggleFloor = (id: string) =>
    setExpandedFloors(prev => ({ ...prev, [id]: !prev[id] }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Đang tải dữ liệu...
      </div>
    );
  }

  if (!data.buildings.length) {
    return (
      <div className="text-center text-gray-500 mt-20">
        Không có dữ liệu ký túc xá.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Tổng quan ký túc xá</h1>
      <p className="text-slate-500 mb-6">
        Tổng quan tình trạng phòng ở và học sinh trong ký túc xá
      </p>
      <div className="space-y-6">
          {data.buildings.map(building => {
          const totalStudents = building.floors.reduce(
            (sum, f) => sum + f.rooms.reduce((s, r) => s + (r.studentIds?.length ?? 0), 0),
            0
          );
          const totalRooms = building.floors.reduce((sum, f) => sum + f.rooms.length, 0);

          return (
            <div key={building.id} className="bg-white/85 rounded-lg shadow-md overflow-hidden">
              <div
                className="bg-blue-50 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-blue-100"
                onClick={() => toggleBuilding(building.id)}
              >
                <div>
                  <h2 className="text-xl font-semibold text-blue-800">{building.name}</h2>
                  <p className="text-sm text-gray-600">{totalRooms} phòng, {totalStudents} học sinh</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/search?buildingId=${building.id}`); }}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Xem tất cả
                  </button>
                  {expandedBuildings[building.id]
                    ? <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                    : <ChevronRightIcon className="w-5 h-5 text-gray-500" />}
                </div>
              </div>

              {expandedBuildings[building.id] && (
                <div className="p-4 space-y-2">
                  {building.floors.map(floor => {
                    const floorStudents = floor.rooms.reduce(
                      (s, r) => s + (r.studentIds?.length ?? 0), 0
                    );
                    return (
                      <div key={floor.id} className="border rounded-md">
                        <div
                          className="flex justify-between items-center px-3 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleFloor(floor.id)}
                        >
                          <span className="font-medium">
                            {floor.name} ({floor.rooms.length} phòng, {floorStudents} HS)
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={e => { e.stopPropagation(); navigate(`/search?floorId=${floor.id}`); }}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Xem
                            </button>
                            {expandedFloors[floor.id]
                              ? <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                              : <ChevronRightIcon className="w-4 h-4 text-gray-400" />}
                          </div>
                        </div>

                        {expandedFloors[floor.id] && (
                          <div className="p-3 grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-2">
                            {floor.rooms.map(room => (
                              <div
                                key={room.id}
                                className="border rounded-lg p-2 text-center cursor-pointer hover:bg-blue-50/80 transition"
                                onClick={() => navigate(`/search?roomId=${room.id}`)}
                              >
                                <div className="font-mono text-sm font-semibold">
                                  {room.name}
                                </div>

                                {room.type === 'Phòng ở' ? (
                                  <div className="text-xs text-slate-500">
                                    {room.studentIds?.length ?? 0}/{room.capacity}
                                  </div>
                                ) : (
                                  <div
                                    className={`text-xs font-medium ${
                                      room.type === 'Phòng tự học'
                                        ? 'text-emerald-600'
                                        : room.type === 'Canteen'
                                        ? 'text-orange-600'
                                        : 'text-slate-600'
                                    }`}
                                  >
                                    {room.type}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}