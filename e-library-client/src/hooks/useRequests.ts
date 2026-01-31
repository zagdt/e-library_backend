import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { requestsApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";
import { toast } from "sonner";
import type { CreateRequestData, UpdateRequestData } from "@/types/api";

export function useRequests(filters?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: queryKeys.requests.list(filters),
    queryFn: () => requestsApi.list(filters),
    staleTime: 30 * 1000,
  });
}

export function useRequest(id: string) {
  return useQuery({
    queryKey: queryKeys.requests.detail(id),
    queryFn: async () => {
      const response = await requestsApi.get(id);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch request");
      }
      return response.data!;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyRequests() {
  return useQuery({
    queryKey: queryKeys.requests.my,
    queryFn: async () => {
      const response = await requestsApi.getMyRequests();
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch your requests");
      }
      return response.data || [];
    },
    staleTime: 30 * 1000,
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRequestData) => {
      const response = await requestsApi.create(data);
      if (!response.success) {
        throw new Error(response.message || "Failed to create request");
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
      toast.success("Request submitted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit request");
    },
  });
}

export function useUpdateRequest(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateRequestData) => {
      const response = await requestsApi.update(id, data);
      if (!response.success) {
        throw new Error(response.message || "Failed to update request");
      }
      return response.data!;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.requests.detail(id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
      toast.success("Request updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update request");
    },
  });
}

export function useRespondToRequest(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateRequestData) => {
      const response = await requestsApi.respond(id, data);
      if (!response.success) {
        throw new Error(response.message || "Failed to respond to request");
      }
      return response.data!;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.requests.detail(id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
      toast.success("Response sent successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send response");
    },
  });
}

export function useDeleteRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await requestsApi.delete(id);
      if (!response.success) {
        throw new Error(response.message || "Failed to delete request");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
      toast.success("Request deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete request");
    },
  });
}
