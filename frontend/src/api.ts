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
  FeedbackSuggestionsRequest,
  FeedbackSuggestionsResponse,
  PageResponse,
} from './types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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
  
  getAllPaginated: (page: number, size: number, sortBy = 'lastName', sortDir = 'asc', search?: string) =>
    api.get<PageResponse<Employee>>('/employees', {
      params: { page, size, sortBy, sortDir, search }
    }),
  
  getById: (id: number) =>
    api.get<Employee>(`/employees/${id}`, {
      headers: { 
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      params: { _t: Date.now() } // Cache busting with timestamp
    }),
  
  getMyProfile: () =>
    api.get<Employee>('/employees/me'),
  
  update: (id: number, data: Partial<Employee>) =>
    api.put<Employee>(`/employees/${id}`, data),
};

// Absence APIs
export const absenceApi = {
  create: (employeeId: number, data: AbsenceRequest) =>
    api.post<Absence>(`/absences/employee/${employeeId}`, data),
  
  update: (absenceId: number, data: AbsenceRequest) =>
    api.put<Absence>(`/absences/${absenceId}`, data),
  
  delete: (absenceId: number) =>
    api.delete(`/absences/${absenceId}`),
  
  getByEmployee: (employeeId: number) =>
    api.get<Absence[]>(`/absences/employee/${employeeId}`, {
      headers: { 
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      params: { _t: Date.now() } // Cache busting with timestamp
    }),
  
  getAll: () =>
    api.get<Absence[]>('/absences', {
      headers: { 
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      params: { _t: Date.now() } // Cache busting with timestamp
    }),
  
  updateStatus: (absenceId: number, status: string) => {
    console.log(`[API] Updating absence ${absenceId} status to ${status}`);
    return api.put<Absence>(`/absences/${absenceId}/status`, null, {
      params: { status, _t: Date.now() },
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  },
  
  getPendingCount: () =>
    api.get<number>('/absences/pending/count', {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      params: { _t: Date.now() }
    })
};

// Feedback APIs
export const feedbackApi = {
  create: (employeeId: number, data: FeedbackRequest) =>
    api.post<Feedback>(`/feedbacks/employee/${employeeId}`, data),
  
  getByEmployee: (employeeId: number) =>
    api.get<Feedback[]>(`/feedbacks/employee/${employeeId}`),
  
  delete: (feedbackId: number) =>
    api.delete(`/feedbacks/${feedbackId}`),
  
  getSuggestions: (data: FeedbackSuggestionsRequest) =>
    api.post<FeedbackSuggestionsResponse>('/feedbacks/suggestions', data),
};

// Metrics & Monitoring API
export const metricsApi = {
  getHealth: () => 
    axios.get('/actuator/health', {
      headers: { 'Cache-Control': 'no-cache' }
    }),
  getCircuitBreakers: () =>
    axios.get('/actuator/circuitbreakers', {
      headers: { 'Cache-Control': 'no-cache' }
    }),
  getMetric: (metricName: string) =>
    axios.get(`/actuator/metrics/${metricName}`, {
      headers: { 'Cache-Control': 'no-cache' },
      params: { _t: Date.now() } // Cache busting
    }),
};

export default api;

