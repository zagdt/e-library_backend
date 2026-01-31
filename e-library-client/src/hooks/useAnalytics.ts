import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";

type QueryOptions = {
    enabled?: boolean;
    staleTime?: number;
};

const DEFAULT_STALE_TIME = 1000 * 60 * 5; // 5 minutes

export const useAnalyticsOverview = (options?: QueryOptions) => {
    return useQuery({
        queryKey: ["analytics", "overview"],
        queryFn: analyticsApi.getOverview,
        enabled: options?.enabled,
        staleTime: options?.staleTime ?? DEFAULT_STALE_TIME,
    });
};

export const useDownloadTrends = (startDate?: string, endDate?: string, options?: QueryOptions) => {
    return useQuery({
        queryKey: ["analytics", "trends", "downloads", startDate, endDate],
        queryFn: () => analyticsApi.getDownloadTrends({ startDate, endDate }),
        enabled: options?.enabled,
        staleTime: options?.staleTime ?? DEFAULT_STALE_TIME,
    });
};

export const useUserTrends = (startDate?: string, endDate?: string, options?: QueryOptions) => {
    return useQuery({
        queryKey: ["analytics", "trends", "users", startDate, endDate],
        queryFn: () => analyticsApi.getUserTrends({ startDate, endDate }),
        enabled: options?.enabled,
        staleTime: options?.staleTime ?? DEFAULT_STALE_TIME,
    });
};

export const useTopResources = (limit = 10, options?: QueryOptions) => {
    return useQuery({
        queryKey: ["analytics", "top", "resources", limit],
        queryFn: () => analyticsApi.getTopResources(limit),
        enabled: options?.enabled,
        staleTime: options?.staleTime ?? DEFAULT_STALE_TIME,
    });
};

export const useTopSearchTerms = (limit = 20, options?: QueryOptions) => {
    return useQuery({
        queryKey: ["analytics", "top", "search-terms", limit],
        queryFn: () => analyticsApi.getTopSearchTerms(limit),
        enabled: options?.enabled,
        staleTime: options?.staleTime ?? DEFAULT_STALE_TIME,
    });
};

export const useUsersByRole = (options?: QueryOptions) => {
    return useQuery({
        queryKey: ["analytics", "distribution", "users"],
        queryFn: analyticsApi.getUsersByRole,
        enabled: options?.enabled,
        staleTime: options?.staleTime ?? DEFAULT_STALE_TIME,
    });
};

export const useResourcesByCategory = (options?: QueryOptions) => {
    return useQuery({
        queryKey: ["analytics", "distribution", "resources"],
        queryFn: analyticsApi.getResourcesByCategory,
        enabled: options?.enabled,
        staleTime: options?.staleTime ?? DEFAULT_STALE_TIME,
    });
};

export const useRequestStats = (options?: QueryOptions) => {
    return useQuery({
        queryKey: ["analytics", "requests"],
        queryFn: analyticsApi.getRequestStats,
        enabled: options?.enabled,
        staleTime: options?.staleTime ?? DEFAULT_STALE_TIME,
    });
};
