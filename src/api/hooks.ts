import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  Attendance,
  BirthdaysResponse,
  Department,
  Employee,
  Paginated,
  Position,
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ['positions'] }),
  });
};

export const useDeletePosition = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/positions/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['positions'] }),
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

// ---------- Employees ----------
export interface EmployeeQuery {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  status?: string;
}

export const useEmployees = (query: EmployeeQuery) =>
  useQuery({
    queryKey: ['employees', query],
    queryFn: async () =>
      (await api.get<Paginated<Employee>>('/employees', { params: query })).data,
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

// ---------- Attendance ----------
export interface AttendanceQuery {
  page?: number;
  limit?: number;
  employeeId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
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
export const useUsers = () =>
  useQuery({
    queryKey: ['users'],
    queryFn: async () => (await api.get<User[]>('/users')).data,
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
