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
export interface SickTypeItem {
  id: string;
  name: string;
  isActive: boolean;
}
export interface SickPoolItem {
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

// ---- sick types ----
export const useSickTypes = () =>
  useQuery({
    queryKey: ['sick-types'],
    queryFn: async () =>
      (await api.get<SickTypeItem[]>('/approvals/sick-types')).data,
  });

export const useSaveSickType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id?: string; name?: string; isActive?: boolean }) =>
      input.id
        ? (await api.patch(`/approvals/sick-types/${input.id}`, input)).data
        : (await api.post('/approvals/sick-types', { name: input.name })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sick-types'] }),
  });
};

export const useDeleteSickType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/approvals/sick-types/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sick-types'] }),
  });
};

// ---- sick pool ----
export const useSickPool = () =>
  useQuery({
    queryKey: ['sick-pool'],
    queryFn: async () =>
      (await api.get<SickPoolItem[]>('/approvals/sick-pool')).data,
  });

export const useAddSickPool = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userIds: string[]) =>
      (await api.post('/approvals/sick-pool', { userIds })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sick-pool'] }),
  });
};

export const useRemoveSickPool = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/approvals/sick-pool/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sick-pool'] }),
  });
};
