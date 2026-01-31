import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";
import { toast } from "sonner";
import type { CreateCourseData, ResourceFilters } from "@/types/api";

export function useCourses(filters?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: queryKeys.courses.list(filters),
    queryFn: () => coursesApi.list(filters),
    staleTime: 60 * 1000,
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: queryKeys.courses.detail(id),
    queryFn: async () => {
      const response = await coursesApi.get(id);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch course");
      }
      return response.data!;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCourseResources(courseId: string, filters?: ResourceFilters) {
  return useQuery({
    queryKey: queryKeys.courses.resources(courseId, filters as any),
    queryFn: () => coursesApi.getResources(courseId, filters),
    enabled: !!courseId,
    staleTime: 60 * 1000,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCourseData) => {
      const response = await coursesApi.create(data);
      if (!response.success) {
        throw new Error(response.message || "Failed to create course");
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
      toast.success("Course created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create course");
    },
  });
}

export function useUpdateCourse(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<CreateCourseData>) => {
      const response = await coursesApi.update(id, data);
      if (!response.success) {
        throw new Error(response.message || "Failed to update course");
      }
      return response.data!;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.courses.detail(id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
      toast.success("Course updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update course");
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await coursesApi.delete(id);
      if (!response.success) {
        throw new Error(response.message || "Failed to delete course");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
      toast.success("Course deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete course");
    },
  });
}
