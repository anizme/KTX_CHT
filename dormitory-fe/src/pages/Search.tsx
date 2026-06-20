import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import type { SearchFilters } from '../types';

export default function Search() {
  const { searchStudents, data } = useData();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState(data.students);

  const getRoomName = (roomId: string) => {
    for (const b of data.buildings) {
      for (const f of b.floors) {
        const room = f.rooms.find(r => r.id === roomId);
        if (room) return room.name;
      }
    }
    return roomId;
  };

  useEffect(() => {
    const buildingId = searchParams.get('buildingId') || undefined;
    const floorId = searchParams.get('floorId') || undefined;
    const roomId = searchParams.get('roomId') || undefined;
    const newFilters: SearchFilters = { buildingId, floorId, roomId };
    setFilters(newFilters);
    const result = searchStudents('', newFilters);
    setResults(result);
  }, [searchParams, searchStudents]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const result = searchStudents(keyword, filters);
    setResults(result);
  };

  const clearFilters = () => {
    setFilters({});
    setKeyword('');
    setResults(data.students);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tìm kiếm học sinh</h1>
      <form onSubmit={handleSearch} className="mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Nhập tên, mã, lớp, quê quán..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-1 min-w-[200px] rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
          Tìm kiếm
        </button>
        {Object.keys(filters).length > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
          >
            Xóa bộ lọc
          </button>
        )}
      </form>

      {results.length > 0 ? (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã HS</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lớp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quê quán</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng</th>
                {user && (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SĐT</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SĐT PH</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.map(student => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{student.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{student.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{student.class}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{student.hometown}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{getRoomName(student.roomId)}</td>
                  {user && (
                    <>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{student.phone || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{student.parentPhone || '-'}</td>
                    </>
                  )}
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