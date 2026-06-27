import axios from 'axios';

const baseURL = import.meta.env.NEXT_PUBLIC_API_URL ?? 'https://ktx-cht-be.onrender.com';

export const api = axios.create({
  baseURL,
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
    return api.get<StudentPublicResponse>(`/students/public?${params.toString()}`);
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
    api.get<Room[]>('/rooms', { params: { ...(floorId ? { floor_id: floorId } : {}), type: 'DORM' } }),
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



// --- Local types for API layer ---
export interface ApiUser { id: number; username: string; role: string; }
export interface Building { id: number; code: string; occupancy: number; available_slots: number; }
export interface Floor { id: number; building_id: number; number: number; code: string; occupancy: number; available_slots: number; }
export interface Room {
  id: number;
  floor_id: number;
  building_id: number;
  label: string;
  code: string;
  floor_number: number;
  building_code: string;
  type: string;
  capacity: number;
  occupancy: number;
  available_slots: number;
}
export interface Student { id: number; full_name: string; gender: string; hometown: string; class_name: string; violation_count: number; room_id: number | null; room_label: string; floor_number: number; building_code: string; }
export interface StudentDetail extends Student { phone: string; parent_phone: string; note: string; violations: Violation[]; }
export interface StudentCreate { full_name: string; gender: string; hometown: string; class_name: string; phone: string; parent_phone: string; note?: string; room_id?: number | null; }
export interface Violation { id: number; student_id: number; title: string; description: string; violation_date: string; }
export interface ViolationCreate { student_id: number; title: string; description: string; violation_date: string; }
export interface RoomCreate { label: string; floor_id: number; type: string; capacity: number; }
export interface AutoAssignResult { assigned_students: number[]; unassigned_students: number[]; }
export interface StudentPublicMetadata { class_names: string[]; hometowns: string[]; rooms: Room[]; }
export interface StudentPublicResponse { items: Student[]; metadata: StudentPublicMetadata; }
