import axios from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Employee,
  Absence,
  AbsenceRequest,
  Feedback,
  FeedbackRequest,
} from './types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data),
  
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data),
};

// Employee APIs
export const employeeApi = {
  getAll: () =>
    api.get<Employee[]>('/employees'),
  
  getById: (id: number) =>
    api.get<Employee>(`/employees/${id}`),
  
  getMyProfile: () =>
    api.get<Employee>('/employees/me'),
  
  update: (id: number, data: Partial<Employee>) =>
    api.put<Employee>(`/employees/${id}`, data),
};

// Absence APIs
export const absenceApi = {
  create: (employeeId: number, data: AbsenceRequest) =>
    api.post<Absence>(`/absences/employee/${employeeId}`, data),
  
  getByEmployee: (employeeId: number) =>
    api.get<Absence[]>(`/absences/employee/${employeeId}`),
  
  getAll: () =>
    api.get<Absence[]>('/absences'),
  
  updateStatus: (absenceId: number, status: string) =>
    api.put<Absence>(`/absences/${absenceId}/status`, null, {
      params: { status },
    }),
};

// Feedback APIs
export const feedbackApi = {
  create: (employeeId: number, data: FeedbackRequest) =>
    api.post<Feedback>(`/feedbacks/employee/${employeeId}`, data),
  
  getByEmployee: (employeeId: number) =>
    api.get<Feedback[]>(`/feedbacks/employee/${employeeId}`),
  
  delete: (feedbackId: number) =>
    api.delete(`/feedbacks/${feedbackId}`),
};

export default api;

