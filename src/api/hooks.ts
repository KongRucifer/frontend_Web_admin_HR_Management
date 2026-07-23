import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  ActorRef,
  AppNotification,
  Attendance,
  AttendanceStatus,
  BirthdaysResponse,
  Department,
  Employee,
  Paginated,
  Position,
  RequestKind,
  User,
  WifiNetwork,
  WorkSchedule,
} from '@/types';

// ---------- Departments ----------
export const useDepartments = () =>
  useQuery({
    queryKey: ['departments'],
    queryFn: async () => (await api.get<Department[]>('/departments')).data,
  });

export const useSaveDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id?: string; name: string }) =>
      input.id
        ? (await api.patch(`/departments/${input.id}`, { name: input.name })).data
        : (await api.post('/departments', { name: input.name })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  });
};

export const useDeleteDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/departments/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  });
};

// ---------- Positions ----------
export const usePositions = (departmentId?: string) =>
  useQuery({
    queryKey: ['positions', departmentId ?? 'all'],
    queryFn: async () =>
      (
        await api.get<Position[]>('/positions', {
          params: departmentId ? { departmentId } : undefined,
        })
      ).data,
  });

export const useSavePosition = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id?: string; name: string; departmentId: string }) =>
      input.id
        ? (await api.patch(`/positions/${input.id}`, { name: input.name, departmentId: input.departmentId })).data
        : (await api.post('/positions', { name: input.name, departmentId: input.departmentId })).data,
    // Also refresh ['departments'] so the summary tiles (position count) update.
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['positions'] });
      qc.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};

export const useDeletePosition = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/positions/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['positions'] });
      qc.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};

// ---------- Work schedules ----------
export const useSchedules = () =>
  useQuery({
    queryKey: ['schedules'],
    queryFn: async () => (await api.get<WorkSchedule[]>('/working/schedules')).data,
  });

export const useSaveSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<WorkSchedule> & { id?: string }) => {
      const body = {
        name: input.name,
        startTime: input.startTime,
        endTime: input.endTime,
        lateAfterMinutes: input.lateAfterMinutes ?? 0,
      };
      return input.id
        ? (await api.patch(`/working/schedules/${input.id}`, body)).data
        : (await api.post('/working/schedules', body)).data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedules'] }),
  });
};

export const useDeleteSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/working/schedules/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedules'] }),
  });
};

export const useActivateSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      (await api.patch(`/working/schedules/${id}/activate`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedules'] }),
  });
};

// ---------- WiFi ----------
export const useWifiNetworks = () =>
  useQuery({
    queryKey: ['wifi'],
    queryFn: async () => (await api.get<WifiNetwork[]>('/working/wifi')).data,
  });

export const useSaveWifi = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<WifiNetwork> & { id?: string }) => {
      const body = {
        name: input.name,
        ssid: input.ssid,
        bssid: input.bssid,
        wifiCode: input.wifiCode || undefined,
        isActive: input.isActive ?? true,
      };
      return input.id
        ? (await api.patch(`/working/wifi/${input.id}`, body)).data
        : (await api.post('/working/wifi', body)).data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wifi'] }),
  });
};

export const useDeleteWifi = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/working/wifi/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wifi'] }),
  });
};

// ---------- Office locations (GPS check-in geofences) ----------
export interface OfficeLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isActive: boolean;
  createdBy?: ActorRef | null;
  updatedBy?: ActorRef | null;
}

export const useOfficeLocations = () =>
  useQuery({
    queryKey: ['office-locations'],
    queryFn: async () =>
      (await api.get<OfficeLocation[]>('/working/office-locations')).data,
  });

export const useSaveOfficeLocation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<OfficeLocation> & { id?: string }) => {
      const body = {
        name: input.name,
        latitude: input.latitude,
        longitude: input.longitude,
        radiusMeters: input.radiusMeters,
        isActive: input.isActive ?? true,
      };
      return input.id
        ? (await api.patch(`/working/office-locations/${input.id}`, body)).data
        : (await api.post('/working/office-locations', body)).data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['office-locations'] }),
  });
};

export const useDeleteOfficeLocation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      api.delete(`/working/office-locations/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['office-locations'] }),
  });
};

// ---------- Employees ----------
export interface EmployeeQuery {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  status?: string;
  // '"true"' shows the soft-deleted bin instead of active employees.
  deleted?: string;
}

export const useEmployees = (query: EmployeeQuery) =>
  useQuery({
    queryKey: ['employees', query],
    queryFn: async () =>
      (await api.get<Paginated<Employee>>('/employees', { params: query })).data,
  });

/**
 * Paged employee fetch for infinite-scroll pickers: fetches one page at a time
 * and exposes fetchNextPage. `search` re-keys the query so typing resets it.
 */
export const useInfiniteEmployees = (search?: string, limit = 20) =>
  useInfiniteQuery({
    queryKey: ['employees-infinite', { search: search || '', limit }],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      (
        await api.get<Paginated<Employee>>('/employees', {
          params: { page: pageParam, limit, search: search || undefined },
        })
      ).data,
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
  });

export const useSaveEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: any) =>
      input.id
        ? (await api.patch(`/employees/${input.id}`, input.body)).data
        : (await api.post('/employees', input.body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
};

export const useDeleteEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/employees/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
};

/** Restore a soft-deleted employee (and its linked account). */
export const useRestoreEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.post(`/employees/${id}/restore`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
};

/** Permanently delete an employee (irreversible). */
export const useHardDeleteEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/employees/${id}/hard`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
};

// ---------- Attendance ----------
export interface AttendanceQuery {
  page?: number;
  limit?: number;
  employeeId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  // Typed against the enum so a rename fails to compile instead of 400ing.
  status?: AttendanceStatus;
  // Filters to days covered by an approved request (matched on the FK).
  // A partial-day emergency keeps status 'on_time', so status=emergency
  // would miss it — use `kind` for leave/emergency filtering.
  kind?: RequestKind;
  // Days checked out before the schedule's end time.
  leftEarly?: boolean;
}

export const useAttendance = (query: AttendanceQuery) =>
  useQuery({
    queryKey: ['attendance', query],
    queryFn: async () =>
      (
        await api.get<Paginated<Attendance>>('/working/attendance', {
          params: query,
        })
      ).data,
  });

// ---------- Birthdays ----------
export const useBirthdays = (withinDays = 2) =>
  useQuery({
    queryKey: ['birthdays', withinDays],
    queryFn: async () =>
      (
        await api.get<BirthdaysResponse>('/employees/birthdays', {
          params: { withinDays },
        })
      ).data,
    staleTime: 5 * 60 * 1000,
  });

// ---------- Users ----------
export interface UserQuery {
  deleted?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  /** true = active only, false = disabled only, undefined = both. */
  isActive?: boolean;
}

export const useUsers = (query: UserQuery = {}) =>
  useQuery({
    queryKey: ['users', query],
    queryFn: async () =>
      (
        await api.get<Paginated<User>>('/users', {
          params: {
            deleted: query.deleted ? 'true' : undefined,
            search: query.search || undefined,
            page: query.page,
            limit: query.limit,
            active:
              query.isActive === undefined
                ? undefined
                : query.isActive
                  ? 'true'
                  : 'false',
          },
        })
      ).data,
  });

export const useSaveUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: any) =>
      input.id
        ? (await api.patch(`/users/${input.id}`, input.body)).data
        : (await api.post('/users', input.body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
};

/** Restore a soft-deleted account (and its linked employee). */
export const useRestoreUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.post(`/users/${id}/restore`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
};

/** Permanently delete an account (irreversible). */
export const useHardDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/users/${id}/hard`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
};

// Live availability check for the create forms (debounce the input first).
export interface Availability {
  usernameAvailable: boolean | null;
  emailAvailable: boolean | null;
}

export const useCheckUsername = (username: string) =>
  useQuery({
    queryKey: ['username-availability', username],
    queryFn: async () =>
      (
        await api.get<Availability>('/users/availability', {
          params: { username },
        })
      ).data,
    // Backend requires a username of at least 3 chars; skip shorter queries.
    enabled: username.trim().length >= 3,
    staleTime: 10_000,
  });

export const useCheckEmail = (email: string) =>
  useQuery({
    queryKey: ['email-availability', email],
    queryFn: async () =>
      (
        await api.get<Availability>('/users/availability', {
          params: { email },
        })
      ).data,
    // Only query once it looks like a full email address.
    enabled: /^\S+@\S+\.\S+$/.test(email.trim()),
    staleTime: 10_000,
  });

// ---------- Notifications (admin) ----------
export interface NotificationQuery {
  page?: number;
  limit?: number;
  isRead?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export const useNotifications = (query: NotificationQuery) =>
  useQuery({
    queryKey: ['notifications', query],
    queryFn: async () =>
      (await api.get<Paginated<AppNotification>>('/notifications', { params: query }))
        .data,
  });

/** Initial unread count (the socket keeps it live afterwards). */
export const useUnreadCount = () =>
  useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const d = (await api.get<{ count: number }>('/notifications/unread-count')).data;
      return (d as { count?: number })?.count ?? 0;
    },
  });

export const useMarkNotifRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

export const useMarkAllNotifRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => api.patch('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

// ---------- Work-from-home (GPS bypass) grants ----------
export interface RemoteWorkItem {
  id: string;
  employeeId: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
  };
  createdAt: string;
}
export interface RemoteWorkList {
  date: string;
  items: RemoteWorkItem[];
}
export interface RemoteWorkAll {
  dates: RemoteWorkList[];
}

/** Every WFH day the admin has scheduled, grouped by date (newest first). */
export const useAllRemoteWork = () =>
  useQuery({
    queryKey: ['remote-work', 'all'],
    queryFn: async () =>
      (await api.get<RemoteWorkAll>('/working/attendance/remote-work/all')).data,
  });

/** The employees granted a WFH day on `date` (YYYY-MM-DD). */
export const useRemoteWork = (date: string) =>
  useQuery({
    queryKey: ['remote-work', date],
    queryFn: async () =>
      (
        await api.get<RemoteWorkList>('/working/attendance/remote-work', {
          params: { date },
        })
      ).data,
    enabled: !!date,
  });

export const useGrantRemoteWork = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { employeeIds: string[]; date: string }) =>
      (await api.post('/working/attendance/remote-work', input)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['remote-work'] }),
  });
};

export const useRevokeRemoteWork = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { employeeId: string; date: string }) =>
      api.delete('/working/attendance/remote-work', { params: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['remote-work'] }),
  });
};

// ---------- Summary tiles (head-counts) ----------
export interface CountSummary {
  total: number;
  active: number;
  inactive: number;
  deleted: number;
}
export interface DepartmentSummary {
  totalDepartments: number;
  totalPositions: number;
}

/** Employees head-count tiles. Keyed under ['employees'] so mutations refresh it. */
export const useEmployeeSummary = () =>
  useQuery({
    queryKey: ['employees', 'summary'],
    queryFn: async () =>
      (await api.get<CountSummary>('/employees/summary')).data,
  });

/** Users head-count tiles. Keyed under ['users'] so mutations refresh it. */
export const useUserSummary = () =>
  useQuery({
    queryKey: ['users', 'summary'],
    queryFn: async () => (await api.get<CountSummary>('/users/summary')).data,
  });

/** Departments + positions counts. Keyed under ['departments'] to auto-refresh. */
export const useDepartmentSummary = () =>
  useQuery({
    queryKey: ['departments', 'summary'],
    queryFn: async () =>
      (await api.get<DepartmentSummary>('/departments/summary')).data,
  });
