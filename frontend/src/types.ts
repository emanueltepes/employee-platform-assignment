export interface User {
  username: string;
  email: string;
  role: 'MANAGER' | 'EMPLOYEE' | 'COWORKER';
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  role: 'MANAGER' | 'EMPLOYEE' | 'COWORKER';
  employeeId: number;
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  position?: string;
  department?: string;
  photoUrl?: string;
  phone?: string;
  officeLocation?: string;
  salary?: number;
  dateOfBirth?: string;
  socialSecurityNumber?: string;
  bankAccount?: string;
  address?: string;
  emergencyContact?: string;
  hireDate?: string;
  contractType?: string;
  absences?: Absence[];
  feedbacks?: Feedback[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Absence {
  id: number;
  employeeId: number;
  startDate: string;
  endDate: string;
  type: 'VACATION' | 'SICK_LEAVE' | 'PERSONAL_LEAVE' | 'MATERNITY_PATERNITY' | 'OTHER';
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approvedBy?: string;
  approvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Feedback {
  id: number;
  employeeId: number;
  authorName: string;
  originalContent: string;
  polishedContent?: string;
  isPolished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  role: 'MANAGER' | 'EMPLOYEE' | 'COWORKER';
  firstName: string;
  lastName: string;
}

export interface AbsenceRequest {
  startDate: string;
  endDate: string;
  type: 'VACATION' | 'SICK_LEAVE' | 'PERSONAL_LEAVE' | 'MATERNITY_PATERNITY' | 'OTHER';
  reason?: string;
}

export interface FeedbackRequest {
  content: string;
  useAiPolish: boolean;
}

export interface FeedbackSuggestionsRequest {
  content: string;
}

export interface FeedbackSuggestionsResponse {
  suggestions: string[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

