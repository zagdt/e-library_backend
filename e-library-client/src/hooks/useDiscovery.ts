// src/hooks/useDiscovery.ts
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { discoveryApi, discoveryQueryKeys } from "@/lib/api/discovery";
import type { DiscoverySearchParams } from "@/types/discovery";

export const useDiscoverySearch = (params: DiscoverySearchParams) => {
  return useQuery({
    queryKey: discoveryQueryKeys.search(params),
    queryFn: () => discoveryApi.search(params),
    enabled: !!params.q && params.q.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useDiscoverySources = () => {
  return useQuery({
    queryKey: discoveryQueryKeys.sources,
    queryFn: () => discoveryApi.sources(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useInfiniteDiscoverySearch = (params: Omit<DiscoverySearchParams, "page">) => {
  return useInfiniteQuery({
    queryKey: discoveryQueryKeys.search({ ...params, page: 1 }),
    queryFn: ({ pageParam = 1 }) => 
      discoveryApi.search({ ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!params.q && params.q.length >= 2,
  });
};