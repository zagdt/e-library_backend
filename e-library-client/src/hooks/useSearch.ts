import { useQuery } from "@tanstack/react-query";
import { searchApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";
import type { ResourceFilters } from "@/types/api";

export function useSearchSuggestions(query: string) {
  return useQuery({
    queryKey: queryKeys.search.suggestions(query),
    queryFn: async () => {
      const response = await searchApi.suggestions(query);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch suggestions");
      }
      return response.data || [];
    },
    enabled: query.length >= 2,
    staleTime: 10 * 1000,
  });
}

export function useSearchResults(query: string, filters?: ResourceFilters) {
  return useQuery({
    queryKey: queryKeys.search.results(query, filters),
    queryFn: () => searchApi.search(query, filters),
    enabled: query.length >= 2,
    staleTime: 30 * 1000,
  });
}
