export interface Student {
  id: number;
  name: string;
  sex: 'Nam' | 'Nữ';
  birthDate: string;
  class: string;
  hometown: string;
  phone: string;
  parentPhone: string;
  roomId: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  studentIds: number[];
}

export interface Floor {
  id: string;
  name: string;
  rooms: Room[];
}

export interface Building {
  id: string;
  name: string;
  floors: Floor[];
}

export interface DormitoryData {
  buildings: Building[];
  students: Student[];
}

export interface User {
  username: string;
  role: 'manager';
}

export interface SearchFilters {
  buildingId?: string;
  floorId?: string;
  roomId?: string;
  studentName?: string;
}