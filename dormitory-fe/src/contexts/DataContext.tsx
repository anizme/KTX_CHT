import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';
import type { DormitoryData, Student, Building, Floor, Room, SearchFilters } from '../types';

interface DataContextType {
  data: DormitoryData;
  loading: boolean;
  getStudentsByRoom: (roomId: string) => Student[];
  getRoomById: (roomId: string) => Room | undefined;
  getFloorById: (floorId: string) => Floor | undefined;
  getBuildingById: (buildingId: string) => Building | undefined;
  searchStudents: (keyword: string, filters?: SearchFilters) => Student[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<DormitoryData>({ buildings: [], students: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await axios.get('/data.json');
      setData(response.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStudentsByRoom = (roomId: string) => {
    return data.students.filter(s => s.roomId === roomId);
  };

  const getRoomById = (roomId: string) => {
    for (const building of data.buildings) {
      for (const floor of building.floors) {
        const room = floor.rooms.find(r => r.id === roomId);
        if (room) return room;
      }
    }
    return undefined;
  };

  const getFloorById = (floorId: string) => {
    for (const building of data.buildings) {
      const floor = building.floors.find(f => f.id === floorId);
      if (floor) return floor;
    }
    return undefined;
  };

  const getBuildingById = (buildingId: string) => {
    return data.buildings.find(b => b.id === buildingId);
  };

  const searchStudents = (keyword: string, filters: SearchFilters = {}) => {
    let result = data.students;
    if (keyword) {
      const lower = keyword.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(lower) ||
        s.id.toString().includes(lower) ||
        s.class.toLowerCase().includes(lower) ||
        s.hometown.toLowerCase().includes(lower)
      );
    }
    if (filters.buildingId) {
      const building = getBuildingById(filters.buildingId);
      if (building) {
        const roomIds = building.floors.flatMap(f => f.rooms.map(r => r.id));
        result = result.filter(s => roomIds.includes(s.roomId));
      }
    }
    if (filters.floorId) {
      const floor = getFloorById(filters.floorId);
      if (floor) {
        const roomIds = floor.rooms.map(r => r.id);
        result = result.filter(s => roomIds.includes(s.roomId));
      }
    }
    if (filters.roomId) {
      result = result.filter(s => s.roomId === filters.roomId);
    }
    return result;
  };

  return (
    <DataContext.Provider value={{
      data,
      loading,
      getStudentsByRoom,
      getRoomById,
      getFloorById,
      getBuildingById,
      searchStudents,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};