import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { resourcesApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";
import { toast } from "sonner";
import type { CreateResourceData, ResourceFilters, Resource } from "@/types/api";

export function useResources(filters?: ResourceFilters) {
  return useQuery({
    queryKey: queryKeys.resources.list(filters),
    queryFn: () => resourcesApi.list(filters),
    staleTime: 30 * 1000,
  });
}

export function useInfiniteResources(filters?: Omit<ResourceFilters, "page">) {
  return useInfiniteQuery({
    queryKey: queryKeys.resources.list(filters),
    queryFn: ({ pageParam = 1 }) => resourcesApi.list({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 30 * 1000,
  });
}

export function useResource(id: string) {
  return useQuery({
    queryKey: queryKeys.resources.detail(id),
    queryFn: async () => {
      const response = await resourcesApi.get(id);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch resource");
      }
      return response.data!;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTrendingResources() {
  return useQuery({
    queryKey: queryKeys.resources.trending,
    queryFn: async () => {
      const response = await resourcesApi.getTrending();
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch trending resources");
      }
      return response.data || [];
    },
    staleTime: 30 * 1000,
  });
}

export function useLatestResources() {
  return useQuery({
    queryKey: queryKeys.resources.latest,
    queryFn: async () => {
      const response = await resourcesApi.getLatest();
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch latest resources");
      }
      return response.data || [];
    },
    staleTime: 30 * 1000,
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await resourcesApi.create(data);
      if (!response.success) {
        throw new Error(response.message || "Failed to create resource");
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resources.all });
      toast.success("Resource uploaded successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload resource");
    },
  });
}

export function useUpdateResource(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<CreateResourceData>) => {
      const response = await resourcesApi.update(id, data);
      if (!response.success) {
        throw new Error(response.message || "Failed to update resource");
      }
      return response.data!;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.resources.detail(id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.resources.all });
      toast.success("Resource updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update resource");
    },
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await resourcesApi.delete(id);
      if (!response.success) {
        throw new Error(response.message || "Failed to delete resource");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resources.all });
      toast.success("Resource deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete resource");
    },
  });
}

export function useDownloadResource() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await resourcesApi.download(id);
      if (!response.success) {
        throw new Error(response.message || "Failed to download resource");
      }
      return response.data!;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
        toast.success("Download started!");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to download resource");
    },
  });
}
