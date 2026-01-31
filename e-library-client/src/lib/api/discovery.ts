// src/lib/api/discovery.ts
import api from "@/lib/axios";
import type {
  DiscoverySearchParams,
  DiscoverySearchResponse,
  DiscoverySourcesResponse,
  DiscoverySource,
} from "@/types/discovery";

export const discoveryApi = {
  search: async (params: DiscoverySearchParams) => {
    const response = await api.get<DiscoverySearchResponse>("/discovery/search", {
      params: {
        q: params.q,
        page: params.page || 1,
        limit: params.limit || 20,
        ...(params.source && { source: params.source }),
      },
    });
    return response.data;
  },

  sources: async () => {
    const response = await api.get<DiscoverySourcesResponse>("/discovery/sources");
    return response.data;
  },
};

export const discoveryQueryKeys = {
  all: ["discovery"] as const,
  search: (params: DiscoverySearchParams) => 
    ["discovery", "search", params] as const,
  sources: ["discovery", "sources"] as const,
};