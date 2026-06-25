export type Gender = 'MALE' | 'FEMALE';

export const GENDER_LABELS: Record<Gender, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
};

export type RoomType =
  | 'DORM' | 'STUDY' | 'CANTEEN'
  | 'COMMON' | 'GUEST' | 'SUPERVISOR'
  | 'OFFICE' | 'OTHER';

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  DORM: 'Phòng ở',
  STUDY: 'Phòng tự học',
  CANTEEN: 'Nhà ăn',
  COMMON: 'Phòng sinh hoạt chung',
  GUEST: 'Phòng khách',
  SUPERVISOR: 'Phòng quản sinh',
  OFFICE: 'Phòng hành chính',
  OTHER: 'Khác',
};

export interface Building {
  id: number;
  code: string;
  occupancy: number;
  available_slots: number;
  floors: Floor[];
}

export interface Floor {
  id: number;
  building_id: number;
  number: number;
  code: string;
  occupancy: number;
  available_slots: number;
  rooms: Room[];
}

export interface Room {
  id: number;
  floor_id: number;
  building_id: number;
  label: string;
  code: string;
  floor_number: number;
  building_code: string;
  type: RoomType;
  capacity: number;
  occupancy: number;
  available_slots: number;
  students: Student[];
}

export interface Student {
  id: number;
  full_name: string;
  gender: Gender;
  hometown: string;
  class_name: string;
  note?: string;
  violation_count: number;
  room_id: number | null;
  room_label: string;
  floor_number: number;
  building_code: string;
  phone?: string;
  parentPhone?: string;
}

export interface Violation {
  id: number;
  student_id: number;
  title: string;
  description: string;
  violationDate: string;
}

export interface DormitoryData {
  buildings: Building[];
}

export interface StudentSearchForm {
  id: string;
  full_name: string;
  gender: Gender | '';
  hometown: string;
  class_name: string;
  room_label: string;
  building_code: string;
  floor_number: string;
}

export interface SearchFilters {
  id?: string | number;
  full_name?: string;
  hometown?: string;
  class_name?: string;
  room_label?: string;
  building_id?: string | number;
  floor_id?: string | number;
  room_id?: string | number;
  gender?: Gender;
  minViolation?: number;
  maxViolation?: number;
}

export interface LocationInfo {
  building: Building;
  floor: Floor;
  room: Room;
}