// src/stores/discoveryStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { DiscoveryResult, DiscoverySource } from "@/types/discovery";

interface DiscoveryStore {
  // Search state
  query: string;
  selectedSources: string[];
  results: DiscoveryResult[];
  isLoading: boolean;
  error: string | null;
  sourceStatus: Record<string, { status: string; results: number; total: number; error?: string }>;
  
  // Sources
  availableSources: DiscoverySource[];
  sourcesLoading: boolean;
  
  // Actions
  setQuery: (query: string) => void;
  setSelectedSources: (sources: string[]) => void;
  toggleSource: (sourceId: string) => void;
  setResults: (results: DiscoveryResult[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSourceStatus: (source: string, status: { status: string; results: number; total: number; error?: string }) => void;
  setAvailableSources: (sources: DiscoverySource[]) => void;
  setSourcesLoading: (loading: boolean) => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  query: "",
  selectedSources: [],
  results: [],
  isLoading: false,
  error: null,
  sourceStatus: {},
  availableSources: [],
  sourcesLoading: false,
};

export const useDiscoveryStore = create<DiscoveryStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setQuery: (query) => set({ query }),

        setSelectedSources: (selectedSources) => set({ selectedSources }),

        toggleSource: (sourceId) =>
          set((state) => ({
            selectedSources: state.selectedSources.includes(sourceId)
              ? state.selectedSources.filter((id) => id !== sourceId)
              : [...state.selectedSources, sourceId],
          })),

        setResults: (results) => set({ results }),

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),

        setSourceStatus: (source, status) =>
          set((state) => ({
            sourceStatus: { ...state.sourceStatus, [source]: status },
          })),

        setAvailableSources: (availableSources) => set({ availableSources }),

        setSourcesLoading: (sourcesLoading) => set({ sourcesLoading }),

        reset: () => set(initialState),
      }),
      {
        name: "discovery-storage",
        partialize: (state) => ({
          selectedSources: state.selectedSources,
          availableSources: state.availableSources,
        }),
      }
    )
  )
);