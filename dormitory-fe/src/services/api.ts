import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://ktx-cht-be.onrender.com',
  // baseURL: 'http://localhost:8000',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = `${import.meta.env.BASE_URL}login`;
    }
    return Promise.reject(err);
  }
);

import type { DormitoryData } from "../types";

export const overviewApi = {
  get: () => api.get<DormitoryData>("/overview"),
};

// Auth
export const authApi = {
  login: (username: string, password: string) => {
    const form = new URLSearchParams();
    form.append('username', username);
    form.append('password', password);
    return api.post<{ access_token: string }>('/auth/login', form);
  },
  me: () => api.get<ApiUser>('/auth/me'),
};

// Students
export const studentApi = {
  list: (filters?: Record<string, unknown>) => {
    const params = new URLSearchParams();
    if (filters) {
      for (const [k, v] of Object.entries(filters)) {
        if (v !== undefined) params.append(k, String(v));
      }
    }
    return api.get<Student[]>(`/students/public?${params.toString()}`);
  },
  get: (id: number) => api.get<StudentDetail>(`/students/${id}`),
  create: (data: StudentCreate) => api.post<Student>('/students', data),
  update: (id: number, data: Partial<StudentCreate>) =>
    api.patch<StudentDetail>(`/students/${id}`, data),
  delete: (id: number) => api.delete(`/students/${id}`),
  assignRoom: (studentId: number, roomId: number | null) =>
    api.post(`/students/${studentId}/assign-room`, null, {
      params: roomId ? { room_id: roomId } : {},
    }),
  autoAssign: (studentIds?: number[], roomIds?: number[]) =>
    api.post<AutoAssignResult>('/students/auto-assign', null, {
      params: {
        ...(studentIds?.length ? { student_ids: studentIds } : {}),
        ...(roomIds?.length   ? { room_ids: roomIds }     : {}),
      },
    }),
};

// Buildings
export const buildingApi = {
  list: () => api.get<Building[]>('/buildings'),
  create: (code: string) => api.post<Building>('/buildings', { code }),
  delete: (id: number) => api.delete(`/buildings/${id}`),
};

// Floors
export const floorApi = {
  list: (buildingId?: number) =>
    api.get<Floor[]>('/floors', { params: buildingId ? { building_id: buildingId } : {} }),
  create: (buildingId: number, number: number) =>
    api.post<Floor>('/floors', { building_id: buildingId, number }),
  delete: (id: number) => api.delete(`/floors/${id}`),
};

// Rooms

export const roomApi = {
  list: (floorId?: number) =>
    api.get<Room[]>('/rooms', { params: { ...(floorId ? { floor_id: floorId } : {}), type: 'Phòng ở' } }),
  listAll: (floorId?: number) =>
    api.get<Room[]>('/rooms', { params: floorId ? { floor_id: floorId } : {} }),
  get: (id: number) => api.get(`/rooms/${id}`),
  create: (data: RoomCreate) => api.post<Room>('/rooms', data),
  update: (id: number, data: Partial<RoomCreate>) => api.patch<Room>(`/rooms/${id}`, data),
  delete: (id: number) => api.delete(`/rooms/${id}`),
};

// Violations
export const violationApi = {
  list: (studentId?: number) =>
    api.get<Violation[]>('/violations', {
      params: studentId ? { student_id: studentId } : {},
    }),
  create: (data: ViolationCreate) => api.post<Violation>('/violations', data),
  update: (id: number, data: Partial<ViolationCreate>) =>
    api.patch<Violation>(`/violations/${id}`, data),
  delete: (id: number) => api.delete(`/violations/${id}`),
};

// Users (admin only)
export const userApi = {
  list: () => api.get<ApiUser[]>('/users'),
  create: (data: { username: string; password: string; role: string }) =>
    api.post<ApiUser>('/users', data),
  delete: (id: number) => api.delete(`/users/${id}`),
  changeRole: (id: number, role: string) =>
    api.patch<ApiUser>(`/users/${id}/role`, null, { params: { role } }),
  changePassword: (oldPassword: string, newPassword: string) =>
    api.patch('/users/me/password', { old_password: oldPassword, new_password: newPassword }),
};

import type {
  AwardType, StudentAward, StudentAwardCreate,
  AwardDistributionItem, OccupancyByBuildingItem,
  GradeDistributionItem, ViolationDistributionItem, GenderDistribution,
  SchoolYearStatisticOut, PromotionResult,
} from '../types';

import type { Page, PageType, PageUpdateInput } from '../types';

export const pageApi = {
  get: (pageType: PageType) => api.get<Page>(`/pages/${encodeURIComponent(pageType)}`),
  update: (pageType: PageType, data: PageUpdateInput) =>
    api.put<Page>(`/pages/${encodeURIComponent(pageType)}`, data),
};

// Award types (danh mục)
export const awardTypeApi = {
  list: () => api.get<AwardType[]>('/awards/types'),
  create: (name: string) => api.post<AwardType>('/awards/types', { name }),
  delete: (id: number) => api.delete(`/awards/types/${id}`),
};

// Student awards (tấm gương tiêu biểu)
export const studentAwardApi = {
  list: (filters?: { award_year?: number; award_type_id?: number }) =>
    api.get<StudentAward[]>('/awards/students', { params: filters || {} }),
  create: (data: StudentAwardCreate) => api.post<StudentAward>('/awards/students', data),
  update: (id: number, data: Partial<StudentAwardCreate>) =>
    api.patch<StudentAward>(`/awards/students/${id}`, data),
  delete: (id: number) => api.delete(`/awards/students/${id}`),
};

// Public statistics
export const statisticsApi = {
  awardDistribution: () => api.get<AwardDistributionItem[]>('/statistics/award-distribution'),
  occupancyByBuilding: () => api.get<OccupancyByBuildingItem[]>('/statistics/occupancy-by-building'),
  genderDistribution: () => api.get<GenderDistribution>('/statistics/gender-distribution'),
  gradeDistribution: () => api.get<GradeDistributionItem[]>('/statistics/grade-distribution'),
  violationDistribution: () => api.get<ViolationDistributionItem[]>('/statistics/violation-distribution'),
};

// Academic (năm học)
export const academicApi = {
  currentYear: () => api.get<{ school_year: number }>('/academic/current-year'),
  promote: () => api.post<PromotionResult>('/academic/promote'),
  yearStatistics: () => api.get<SchoolYearStatisticOut[]>('/academic/statistics'),
};

// Excel import
export const importApi = {
  preview: (file: File, columnMapping: Record<string, string>) => {
    const form = new FormData();
    form.append('file', file);
    form.append('column_mapping', JSON.stringify(columnMapping));
    return api.post('/import/students/preview', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  commit: (file: File, columnMapping: Record<string, string>) => {
    const form = new FormData();
    form.append('file', file);
    form.append('column_mapping', JSON.stringify(columnMapping));
    return api.post<{ created_count: number; created_ids: number[]; errors: { row: number; error: string }[] }>(
      '/import/students/commit', form, { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },
  exportStudents: () =>
    api.get('/students/export/excel', { responseType: 'blob' }),

};


// --- Local types for API layer ---
export interface ApiUser { id: number; username: string; role: string; }
export interface Building { id: number; code: string; occupancy: number; available_slots: number; }
export interface Floor { id: number; building_id: number; number: number; code: string; occupancy: number; available_slots: number; }
export interface Room { id: number; floor_id: number; building_id: number; label: string; code: string; type: string; capacity: number; occupancy: number; available_slots: number; }
export interface Student { id: number; full_name: string; gender: string; hometown: string; class_name: string; violation_count: number; room_id: number | null; room_label: string; floor_number: number; building_code: string; }
export interface StudentDetail extends Student { phone: string; parent_phone: string; note: string; violations: Violation[]; }
export interface StudentCreate { full_name: string; gender: string; hometown: string; class_name: string; phone: string; parent_phone: string; note?: string; room_id?: number | null; }
export interface Violation { id: number; student_id: number; title: string; description: string; violation_date: string; }
export interface ViolationCreate { student_id: number; title: string; description: string; violation_date: string; }
export interface RoomCreate { label: string; floor_id: number; type: string; capacity: number; }
export interface AutoAssignResult { assigned_students: number[]; unassigned_students: number[]; }
