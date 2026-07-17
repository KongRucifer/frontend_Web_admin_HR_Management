export type Role = 'admin' | 'employee';
export type EmployeeStatus = 'active' | 'inactive';
export type AttendanceStatus =
  | 'on_time'
  | 'late'
  | 'absent'
  | 'leave'
  | 'emergency';

/** Which kind of approved request covers an attendance day, if any. */
export type RequestKind = 'leave' | 'emergency';

/** Who created / last updated a row (resolved to a username for display). */
export interface ActorRef {
  id: string;
  username: string | null;
  email: string;
}

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
  createdBy?: ActorRef | null;
  updatedBy?: ActorRef | null;
}

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  /** Email/username live on the linked login account, not on the employee. */
  account?: { username: string; email: string } | null;
  phone: string | null;
  departmentId: string | null;
  department?: Department | null;
  positionId: string | null;
  positionRef?: Position | null;
  birthDate: string | null;
  contractEndDate: string | null;
  status: EmployeeStatus;
  workScheduleId: string | null;
  workSchedule?: WorkSchedule | null;
  createdAt: string;
  createdBy?: ActorRef | null;
  updatedBy?: ActorRef | null;
  // Non-null once soft-deleted (sits in the "deleted" bin).
  deletedAt?: string | null;
}

export interface WifiNetwork {
  id: string;
  name: string;
  ssid: string;
  bssid: string;
  wifiCode: string | null;
  isActive: boolean;
  createdBy?: ActorRef | null;
  updatedBy?: ActorRef | null;
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
  // Checked out before the schedule's end time. Separate from status so a day
  // can be both "late" and "left early".
  leftEarly: boolean;
  workHours: number | null;
  note: string | null;
  // Set when the day is covered by an approved leave / emergency request.
  // NOTE: a partial-day emergency keeps status 'on_time' and only carries the
  // FK — so "is this day covered?" is answered by requestKind, never status.
  leaveRequestId: string | null;
  emergencyRequestId: string | null;
  requestKind: RequestKind | null;
  requestTypeName: string | null;
}

export interface User {
  id: string;
  email: string;
  username: string | null;
  role: Role;
  employeeId: string | null;
  isActive: boolean;
  lastLogin: string | null;
  createdBy?: ActorRef | null;
  updatedBy?: ActorRef | null;
  // Non-null once soft-deleted (sits in the "deleted" bin).
  deletedAt?: string | null;
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

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  refId: string | null;
  isRead: boolean;
  createdAt: string;
}
