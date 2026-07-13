export type Role = 'admin' | 'employee';
export type EmployeeStatus = 'active' | 'inactive';
export type AttendanceStatus = 'present' | 'late' | 'absent' | 'leave';

export interface AuthUser {
  userId: string;
  email: string;
  username: string | null;
  role: Role;
  employeeId: string | null;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    username: string | null;
    role: Role;
    employeeId: string | null;
  };
  accessToken: string;
}

export interface Department {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  id: string;
  name: string;
  departmentId: string;
  department?: Department;
}

export interface WorkSchedule {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  lateAfterMinutes: number;
  isActive: boolean;
}

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  departmentId: string | null;
  department?: Department | null;
  position: string | null;
  positionId: string | null;
  positionRef?: Position | null;
  birthDate: string | null;
  hireDate: string | null;
  status: EmployeeStatus;
  workScheduleId: string | null;
  workSchedule?: WorkSchedule | null;
  createdAt: string;
}

export interface WifiNetwork {
  id: string;
  name: string;
  ssid: string;
  bssid: string;
  wifiCode: string | null;
  isActive: boolean;
}

export interface Attendance {
  id: string;
  employeeId: string;
  employee?: Employee;
  workDate: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  checkInLocation: string | null;
  checkOutLocation: string | null;
  status: AttendanceStatus;
  workHours: number | null;
  note: string | null;
}

export interface User {
  id: string;
  email: string;
  username: string | null;
  role: Role;
  employeeId: string | null;
  isActive: boolean;
  lastLogin: string | null;
}

export interface Birthday {
  id: string;
  firstName: string;
  lastName: string;
  department: string | null;
  birthDate: string;
  daysLeft: number;
  age: number;
}

export interface BirthdaysResponse {
  today: Birthday[];
  upcoming: Birthday[];
  withinDays: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
