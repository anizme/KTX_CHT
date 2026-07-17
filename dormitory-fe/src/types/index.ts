export type Gender = 'Nam' | 'Nữ';

export type RoomType =
  | 'Phòng ở' | 'Phòng tự học' | 'Nhà ăn'
  | 'Phòng sinh hoạt chung' | 'Phòng khách' | 'Phòng quản sinh'
  | 'Phòng hành chính' | 'Khác';

  export const ROOM_TYPES: RoomType[] = [
  'Phòng ở',
  'Phòng tự học',
  'Nhà ăn',
  'Phòng sinh hoạt chung',
  'Phòng khách',
  'Phòng quản sinh',
  'Phòng hành chính',
  'Khác',
];

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

export type PageType = 'Giới thiệu' | 'Nội quy';
export const PAGE_TYPES: { INTRO: PageType; RULE: PageType } = {
  INTRO: 'Giới thiệu',
  RULE: 'Nội quy',
};
export interface Page {
  id: number;
  page_type: PageType;
  title: string;
  content: string;
  updated_at: string;
  updated_by: number | null;
}
export interface PageUpdateInput {
  title?: string;
  content?: string;
}
// Awards
export interface AwardType {
  id: number;
  name: string;
}
export interface StudentAward {
  id: number;
  student_id: number;
  award_type_id: number;
  award_year: number;
  description?: string;
  student: Student;
  award_type: AwardType;
}
export interface StudentAwardCreate {
  student_id: number;
  award_type_id: number;
  award_year?: number;
  description?: string;
}

// Statistics (public)
export interface AwardDistributionItem { award_type_id: number; award_name: string; student_count: number; }
export interface OccupancyByBuildingItem { building_id: number; building_code: string; occupancy: number; capacity: number; available_slots: number; }
export interface GradeDistributionItem { grade: number; count: number; }
export interface ViolationDistributionItem { violation_count: number; student_count: number; }
export type GenderDistribution = Record<string, number>;

// Academic
export interface SchoolYearStatisticAwardOut { award_type_id: number; quantity: number; award_type?: AwardType; }
export interface SchoolYearStatisticOut {
  id: number;
  school_year: number;
  school_year_display: string;
  total_students: number;
  special_note?: string;
  awards: SchoolYearStatisticAwardOut[];
}
export interface PromotionResult {
  school_year: number;
  graduated_student_ids: number[];
  promoted_count: number;
  new_school_year: number;
}