import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { statisticsApi, studentAwardApi } from '../services/api';
import type {
  OccupancyByBuildingItem, ViolationDistributionItem,
  AwardDistributionItem, GenderDistribution, GradeDistributionItem, StudentAward,
} from '../types';
import DonutChart from '../components/DonutChart';

function OccupancyBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-800">{value}/{max}</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Overview() {
  const { data, loading } = useData();
  const navigate = useNavigate();

  const [expandedBuildings, setExpandedBuildings] = useState<Record<number, boolean>>({});
  const [expandedFloors, setExpandedFloors] = useState<Record<number, boolean>>({});

  const [gender, setGender] = useState<GenderDistribution>({});
  const [grade, setGrade] = useState<GradeDistributionItem[]>([]);
  const [violation, setViolation] = useState<ViolationDistributionItem[]>([]);
  const [occupancy, setOccupancy] = useState<OccupancyByBuildingItem[]>([]);
  const [awards, setAwards] = useState<AwardDistributionItem[]>([]);
  const [featured, setFeatured] = useState<StudentAward[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (data.buildings.length > 0) {
      setExpandedBuildings(data.buildings.reduce<Record<number, boolean>>((acc, b) => ({ ...acc, [b.id]: true }), {}));
    }
  }, [data.buildings]);

  useEffect(() => {
    Promise.all([
      statisticsApi.genderDistribution(),
      statisticsApi.gradeDistribution(),
      statisticsApi.violationDistribution(),
      statisticsApi.occupancyByBuilding(),
      statisticsApi.awardDistribution(),
      studentAwardApi.list(),
    ]).then(([g, gr, v, o, a, f]) => {
      setGender(g.data);
      setGrade(gr.data);
      setViolation(v.data);
      setOccupancy(o.data);
      setAwards(a.data);
      setFeatured(f.data.slice(0, 9));
    }).finally(() => setStatsLoading(false));
  }, []);

  const toggleBuilding = (id: number) => setExpandedBuildings(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleFloor = (id: number) => setExpandedFloors(prev => ({ ...prev, [id]: !prev[id] }));

  const genderData = Object.entries(gender).map(([label, value]) => ({ label, value }));
  const gradeData = grade.map(g => ({ label: `Khối ${g.grade}`, value: g.count }));
  const totalViolationStudents = violation.reduce((s, v) => s + v.student_count, 0);
  const totalAwardStudents = awards.reduce((s, a) => s + a.student_count, 0);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Tổng quan ký túc xá</h1>
      <p className="text-slate-500 mb-6">Tình trạng phòng ở và số liệu thống kê</p>

      {loading ? (
        <div className="flex items-center justify-center h-32 text-gray-500">Đang tải dữ liệu...</div>
      ) : !data.buildings.length ? (
        <div className="text-center text-gray-500 py-10">Không có dữ liệu ký túc xá.</div>
      ) : (
        <div className="space-y-6 mb-10">
          {data.buildings.map(building => (
            <div key={building.id} className="bg-white/85 rounded-lg shadow-md overflow-hidden">
              <div
                className="bg-blue-50 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-blue-100"
                onClick={() => toggleBuilding(building.id)}
              >
                <div>
                  <h2 className="text-xl font-semibold text-blue-800">Tòa {building.code}</h2>
                  <p className="text-sm text-gray-600">
                    {building.floors.reduce((s, f) => s + f.rooms.length, 0)} phòng
                    - {building.occupancy} học sinh
                    - còn {building.available_slots} chỗ
                  </p>
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
                  {building.floors.map(floor => (
                    <div key={floor.id} className="border rounded-md">
                      <div
                        className="flex justify-between items-center px-3 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100"
                        onClick={() => toggleFloor(floor.id)}
                      >
                        <span className="font-medium">
                          Tầng {floor.number} ({floor.rooms.length} phòng - {floor.occupancy} HS - còn {floor.available_slots} chỗ)
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={e => { e.stopPropagation(); navigate(`/search?buildingId=${building.id}&floorId=${floor.id}`); }}
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
                              onClick={() => navigate(`/search?buildingId=${building.id}&floorId=${floor.id}&roomId=${room.id}`)}
                            >
                              <div className="font-mono text-sm font-semibold">{room.label}</div>
                              {room.type === 'Phòng ở' ? (
                                <div className="text-xs text-slate-500">
                                    {room.occupancy}/{room.capacity}
                                </div>
                                ) : (
                                <div className={`text-xs font-medium ${
                                    room.type === 'Phòng tự học' ? 'text-emerald-600' :
                                    room.type === 'Nhà ăn'       ? 'text-orange-600'  :
                                                                    'text-slate-600'
                                }`}>
                                    {room.type}
                                </div>
                                )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <h2 className="text-2xl font-bold text-slate-800 mb-4">Thống kê</h2>
      {statsLoading ? (
        <p className="text-slate-400">Đang tải thống kê...</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Phân bố giới tính</h3>
              <DonutChart data={genderData} />
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Học sinh theo khối</h3>
              <DonutChart data={gradeData} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Tỉ lệ lấp đầy theo tòa</h3>
            {occupancy.map(b => (
              <OccupancyBar key={b.building_id} label={`Tòa ${b.building_code}`} value={b.occupancy} max={b.capacity} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Phân bố số lần vi phạm</h3>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="text-left py-2 font-medium">Số lần vi phạm</th>
                    <th className="text-right py-2 font-medium">Số học sinh</th>
                    <th className="text-right py-2 font-medium">Tỉ lệ</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {violation.map(v => (
                    <tr key={v.violation_count}>
                      <td className="py-2">{v.violation_count === 0 ? 'Không vi phạm' : `${v.violation_count} lần`}</td>
                      <td className="py-2 text-right font-medium">{v.student_count}</td>
                      <td className="py-2 text-right text-slate-400">
                        {totalViolationStudents ? Math.round((v.student_count / totalViolationStudents) * 100) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Thống kê giải thưởng</h3>
              {awards.length === 0 ? (
                <p className="text-slate-400 text-sm">Chưa có dữ liệu giải thưởng.</p>
              ) : (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b text-slate-500">
                      <th className="text-left py-2 font-medium">Loại giải</th>
                      <th className="text-right py-2 font-medium">Số học sinh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {awards.map(a => (
                      <tr key={a.award_type_id}>
                        <td className="py-2">{a.award_name}</td>
                        <td className="py-2 text-right font-medium">{a.student_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Tấm gương tiêu biểu</h3>
            {featured.length === 0 ? (
              <p className="text-slate-400 text-sm">Chưa có dữ liệu.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {featured.map(f => (
                  <div key={f.id} className="border rounded-lg p-3">
                    <div className="font-medium text-slate-800">{f.student.full_name}</div>
                    <div className="text-sm text-blue-700">{f.award_type.name}</div>
                    <div className="text-xs text-slate-400">Năm học {f.award_year}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}