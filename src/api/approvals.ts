import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ApproverInfo {
  userId: string;
  employeeId: string | null;
  name: string;
  phone: string | null;
  email: string;
}
export interface ChainStep {
  id: string;
  stepOrder: number;
  approverUserId: string;
  approver: ApproverInfo | null;
}
export interface TypeItem {
  id: string;
  name: string;
  isActive: boolean;
}
export interface EmergencyPoolItem {
  id: string;
  approverUserId: string;
  approver: ApproverInfo | null;
}

// ---- candidates (search) ----
export const useCandidates = (search: string) =>
  useQuery({
    queryKey: ['approver-candidates', search],
    queryFn: async () =>
      (await api.get<ApproverInfo[]>('/approvals/candidates', {
        params: { search: search || undefined },
      })).data,
  });

// ---- leave chain ----
export const useLeaveChain = () =>
  useQuery({
    queryKey: ['leave-chain'],
    queryFn: async () =>
      (await api.get<ChainStep[]>('/approvals/leave-chain')).data,
  });

export const useAddChain = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userIds: string[]) =>
      (await api.post('/approvals/leave-chain', { userIds })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leave-chain'] }),
  });
};

export const useReorderChain = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userIds: string[]) =>
      (await api.patch('/approvals/leave-chain/reorder', { userIds })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leave-chain'] }),
  });
};

export const useRemoveChainApprover = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      api.delete(`/approvals/leave-chain/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leave-chain'] }),
  });
};

// ---- leave types ----
export const useLeaveTypes = () =>
  useQuery({
    queryKey: ['leave-types'],
    queryFn: async () =>
      (await api.get<TypeItem[]>('/approvals/leave-types')).data,
  });

export const useSaveLeaveType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id?: string; name?: string; isActive?: boolean }) =>
      input.id
        ? (await api.patch(`/approvals/leave-types/${input.id}`, input)).data
        : (await api.post('/approvals/leave-types', { name: input.name })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leave-types'] }),
  });
};

export const useDeleteLeaveType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/approvals/leave-types/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leave-types'] }),
  });
};

// ---- emergency (ສຸກເສີນ) types ----
export const useEmergencyTypes = () =>
  useQuery({
    queryKey: ['emergency-types'],
    queryFn: async () =>
      (await api.get<TypeItem[]>('/approvals/emergency-types')).data,
  });

export const useSaveEmergencyType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id?: string; name?: string; isActive?: boolean }) =>
      input.id
        ? (await api.patch(`/approvals/emergency-types/${input.id}`, input)).data
        : (await api.post('/approvals/emergency-types', { name: input.name })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['emergency-types'] }),
  });
};

export const useDeleteEmergencyType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      api.delete(`/approvals/emergency-types/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['emergency-types'] }),
  });
};

// ---- emergency approver pool ----
export const useEmergencyPool = () =>
  useQuery({
    queryKey: ['emergency-pool'],
    queryFn: async () =>
      (await api.get<EmergencyPoolItem[]>('/approvals/emergency-pool')).data,
  });

export const useAddEmergencyPool = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userIds: string[]) =>
      (await api.post('/approvals/emergency-pool', { userIds })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['emergency-pool'] }),
  });
};

export const useRemoveEmergencyPool = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      api.delete(`/approvals/emergency-pool/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['emergency-pool'] }),
  });
};
