import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';
import type {
  DormitoryData, Student, Building, Floor, Room,
  SearchFilters, LocationInfo,
} from '../types';

interface DataContextType {
  data: DormitoryData;
  loading: boolean;
  getAllStudents: () => Student[];
  getStudentsByRoom: (roomId: number) => Student[];
  getRoomById: (roomId: number) => Room | undefined;
  getFloorById: (floorId: number) => Floor | undefined;
  getBuildingById: (buildingId: number) => Building | undefined;
  getLocationInfo: (roomId: number) => LocationInfo | undefined;
  searchStudents: (filters: SearchFilters) => Student[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<DormitoryData>({ buildings: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/data.json')
      .then(res => setData(res.data))
      .catch(err => console.error('Failed to load data:', err))
      .finally(() => setLoading(false));
  }, []);

  const getAllStudents = (): Student[] =>
    data.buildings.flatMap(b =>
      b.floors.flatMap(f =>
        f.rooms.flatMap(r => r.students ?? [])
      )
    );

  const getStudentsByRoom = (roomId: number): Student[] =>
    data.buildings
      .flatMap(b => b.floors.flatMap(f => f.rooms))
      .find(r => r.id === roomId)?.students ?? [];

  const getRoomById = (roomId: number): Room | undefined => {
    for (const b of data.buildings)
      for (const f of b.floors) {
        const room = f.rooms.find(r => r.id === roomId);
        if (room) return room;
      }
  };

  const getFloorById = (floorId: number): Floor | undefined => {
    for (const b of data.buildings) {
      const floor = b.floors.find(f => f.id === floorId);
      if (floor) return floor;
    }
  };

  const getBuildingById = (buildingId: number): Building | undefined =>
    data.buildings.find(b => b.id === buildingId);

  const getLocationInfo = (roomId: number): LocationInfo | undefined => {
    for (const building of data.buildings)
      for (const floor of building.floors) {
        const room = floor.rooms.find(r => r.id === roomId);
        if (room) return { building, floor, room };
      }
  };

  const searchStudents = (filters: SearchFilters): Student[] => {
    let students = getAllStudents();

    if (filters.id)
      students = students.filter(s =>
        String(s.id).startsWith(String(filters.id))
      );

    if (filters.full_name)
      students = students.filter(s =>
        s.full_name.toLowerCase().includes(filters.full_name!.toLowerCase())
      );

    if (filters.gender)
      students = students.filter(s => s.gender === filters.gender);

    if (filters.hometown)
      students = students.filter(s =>
        s.hometown.toLowerCase().includes(filters.hometown!.toLowerCase())
      );

    if (filters.class_name)
      students = students.filter(s =>
        s.class_name.toLowerCase().includes(filters.class_name!.toLowerCase())
      );

    if (filters.room_label)
      students = students.filter(s =>
        s.room_label.toLowerCase().includes(filters.room_label!.toLowerCase())
      );

    if (filters.building_id) {
      const building = getBuildingById(Number(filters.building_id));
      if (building) {
        const roomIds = new Set(building.floors.flatMap(f => f.rooms.map(r => r.id)));
        students = students.filter(s => s.room_id != null && roomIds.has(s.room_id));
      }
    }

    if (filters.floor_id) {
      const floor = getFloorById(Number(filters.floor_id));
      if (floor) {
        const roomIds = new Set(floor.rooms.map(r => r.id));
        students = students.filter(s => s.room_id != null && roomIds.has(s.room_id));
      }
    }

    if (filters.room_id)
      students = students.filter(s => s.room_id === Number(filters.room_id));

    if (filters.minViolation != null)
      students = students.filter(s => s.violation_count >= filters.minViolation!);

    if (filters.maxViolation != null)
      students = students.filter(s => s.violation_count <= filters.maxViolation!);

    return students;
  };

  return (
    <DataContext.Provider value={{
      data, loading,
      getAllStudents, getStudentsByRoom,
      getRoomById, getFloorById, getBuildingById,
      getLocationInfo, searchStudents,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
};