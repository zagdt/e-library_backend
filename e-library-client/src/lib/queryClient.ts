import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        if ((error as { response?: { status: number } })?.response?.status === 401) {
          return false;
        }
        if ((error as { response?: { status: number } })?.response?.status === 403) {
          return false;
        }
        if ((error as { response?: { status: number } })?.response?.status === 404) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  users: {
    all: ["users"] as const,
    list: (filters?: Record<string, unknown>) => ["users", "list", filters] as const,
    detail: (id: string) => ["users", id] as const,
  },
  resources: {
    all: ["resources"] as const,
    list: (filters?: Record<string, unknown>) => ["resources", "list", filters] as const,
    detail: (id: string) => ["resources", id] as const,
    trending: ["resources", "trending"] as const,
    latest: ["resources", "latest"] as const,
  },
  courses: {
    all: ["courses"] as const,
    list: (filters?: Record<string, unknown>) => ["courses", "list", filters] as const,
    detail: (id: string) => ["courses", id] as const,
    resources: (id: string, filters?: Record<string, unknown>) =>
      ["courses", id, "resources", filters] as const,
  },
  requests: {
    all: ["requests"] as const,
    list: (filters?: Record<string, unknown>) => ["requests", "list", filters] as const,
    detail: (id: string) => ["requests", id] as const,
    my: ["requests", "my"] as const,
  },
  admin: {
    metrics: ["admin", "metrics"] as const,
    auditLogs: (filters?: Record<string, unknown>) => ["admin", "auditLogs", filters] as const,
  },
  search: {
    suggestions: (query: string) => ["search", "suggestions", query] as const,
    results: (query: string, filters?: Record<string, unknown>) =>
      ["search", "results", query, filters] as const,
  },
};
