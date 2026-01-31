import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";
import { toast } from "sonner";
import type { UpdateUserRoleData } from "@/types/api";

export function useAdminUsers(filters?: { page?: number; limit?: number; role?: string; search?: string }) {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => adminApi.getUsers(filters),
    staleTime: 30 * 1000,
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: async () => {
      const response = await adminApi.getUser(id);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch user");
      }
      return response.data!;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserRoleData }) => {
      const response = await adminApi.updateUserRole(id, data);
      if (!response.success) {
        throw new Error(response.message || "Failed to update user role");
      }
      return response.data!;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.users.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("User role updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update user role");
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await adminApi.deleteUser(id);
      if (!response.success) {
        throw new Error(response.message || "Failed to delete user");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("User deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });
}

export function useAdminMetrics() {
  return useQuery({
    queryKey: queryKeys.admin.metrics,
    queryFn: async () => {
      const response = await adminApi.getMetrics();
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch metrics");
      }
      return response.data!;
    },
    staleTime: 30 * 1000,
  });
}

export function useAuditLogs(filters?: { page?: number; limit?: number; action?: string; userId?: string }) {
  return useQuery({
    queryKey: queryKeys.admin.auditLogs(filters),
    queryFn: () => adminApi.getAuditLogs(filters),
    staleTime: 30 * 1000,
  });
}
