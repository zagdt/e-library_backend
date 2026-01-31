// import { create } from "zustand";
// import { persist, createJSONStorage } from "zustand/middleware";
// import type { User } from "@/types/api";
// import Cookies from "js-cookie";

// interface AuthState {
//   user: User | null;
//   accessToken: string | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   isHydrated: boolean;
//   setUser: (user: User | null) => void;
//   setAccessToken: (token: string | null) => void;
//   setTokens: (accessToken: string, refreshToken: string) => void;
//   logout: () => void;
//   setLoading: (loading: boolean) => void;
//   setHydrated: () => void;
// }

// export const useAuthStore = create<AuthState>()(
//   persist(
//     (set, get) => ({
//       user: null,
//       accessToken: null,
//       isAuthenticated: false,
//       isLoading: true,
//       isHydrated: false,

//       setUser: (user) =>
//         set({
//           user,
//           isAuthenticated: !!user,
//           isLoading: false,
//         }),

//       setAccessToken: (token) =>
//         set({
//           accessToken: token,
//           isAuthenticated: !!token,
//         }),

//       setTokens: (accessToken, refreshToken) => {
//         Cookies.set("refreshToken", refreshToken, {
//           expires: 7,
//           secure: process.env.NODE_ENV === "production",
//           sameSite: "lax",
//         });
//         set({
//           accessToken,
//           isAuthenticated: true,
//         });
//       },

//       logout: () => {
//         Cookies.remove("refreshToken");
//         set({
//           user: null,
//           accessToken: null,
//           isAuthenticated: false,
//           isLoading: false,
//         });
//       },

//       setLoading: (loading) => set({ isLoading: loading }),

//       setHydrated: () => set({ isHydrated: true }),
//     }),
//     {
//       name: "auth-storage",
//       storage: createJSONStorage(() => sessionStorage),
//       partialize: (state) => ({
//         accessToken: state.accessToken,
//         user: state.user,
//         isAuthenticated: state.isAuthenticated,
//       }),
//       onRehydrateStorage: () => (state) => {
//         if (state) {
//           state.setHydrated();
//           if (state.accessToken) {
//             state.setLoading(false);
//           } else {
//             state.setLoading(false);
//           }
//         }
//       },
//     }
//   )
// );

// export const getRefreshToken = (): string | undefined => {
//   return Cookies.get("refreshToken");
// };


// import { create } from "zustand";
// import { persist, createJSONStorage } from "zustand/middleware";
// import type { User } from "@/types/api";
// import Cookies from "js-cookie";

// interface AuthState {
//   user: User | null;
//   accessToken: string | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   isHydrated: boolean;
//   setUser: (user: User | null) => void;
//   setAccessToken: (token: string | null) => void;
//   setTokens: (accessToken: string, refreshToken: string) => void;
//   logout: () => void;
//   clearAuth: () => void;
//   setLoading: (loading: boolean) => void;
//   setHydrated: () => void;
// }

// export const useAuthStore = create<AuthState>()(
//   persist(
//     (set) => ({
//       user: null,
//       accessToken: null,
//       isAuthenticated: false,
//       isLoading: true,
//       isHydrated: false,

//       setUser: (user) =>
//         set({
//           user,
//           isAuthenticated: !!user,
//           isLoading: false,
//         }),

//       setAccessToken: (token) =>
//         set({
//           accessToken: token,
//           isAuthenticated: !!token,
//         }),

//       setTokens: (accessToken, refreshToken) => {
//         // Store refresh token in httpOnly-like cookie (more secure than sessionStorage)
//         Cookies.set("refreshToken", refreshToken, {
//           expires: 7, // 7 days
//           secure: process.env.NODE_ENV === "production",
//           sameSite: "strict", // Changed from 'lax' to 'strict' for better security
//           path: "/",
//         });

//         set({
//           accessToken,
//           isAuthenticated: true,
//           isLoading: false,
//         });
//       },

//       logout: () => {
//         // Clear refresh token cookie
//         Cookies.remove("refreshToken", { path: "/" });

//         // Clear sessionStorage
//         if (typeof window !== "undefined") {
//           sessionStorage.removeItem("auth-storage");
//         }

//         set({
//           user: null,
//           accessToken: null,
//           isAuthenticated: false,
//           isLoading: false,
//         });
//       },

//       clearAuth: () =>
//         set({
//           user: null,
//           accessToken: null,
//           isAuthenticated: false,
//           isLoading: false,
//         }),

//       setLoading: (loading) => set({ isLoading: loading }),

//       setHydrated: () => set({ isHydrated: true }),
//     }),
//     {
//       name: "auth-storage",
//       storage: createJSONStorage(() => sessionStorage),
//       partialize: (state) => ({
//         accessToken: state.accessToken,
//         user: state.user,
//         isAuthenticated: state.isAuthenticated,
//       }),
//       onRehydrateStorage: () => (state) => {
//         if (state) {
//           state.setHydrated();
//           state.setLoading(false);
//         }
//       },
//     }
//   )
// );

// // Helper to get refresh token from cookies
// export const getRefreshToken = (): string | undefined => {
//   return Cookies.get("refreshToken");
// };

// // Hook to wait for hydration before rendering auth-dependent UI
// export function useAuthHydration() {
//   const isHydrated = useAuthStore((state) => state.isHydrated);
//   return isHydrated;
// }

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/api";
import Cookies from "js-cookie";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      isHydrated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setAccessToken: (token) =>
        set({
          accessToken: token,
          isAuthenticated: !!token,
        }),

      setTokens: (accessToken, refreshToken) => {
        console.log("[Auth Store] Setting tokens...");
        console.log("- Access token length:", accessToken?.length);
        console.log("- Refresh token length:", refreshToken?.length);

        // Store refresh token in cookie
        Cookies.set("refreshToken", refreshToken, {
          expires: 7, // 7 days
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // lax for localhost
          path: "/",
        });

        // Verify cookie was set
        const storedToken = Cookies.get("refreshToken");
        console.log("[Auth Store] Cookie verification:");
        console.log("- Cookie set successfully:", storedToken === refreshToken);
        console.log("- Stored token length:", storedToken?.length);

        if (storedToken !== refreshToken) {
          console.error("[Auth Store] ⚠️ Cookie mismatch! Token not stored correctly");
        }

        set({
          accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        // Clear refresh token cookie
        Cookies.remove("refreshToken", { path: "/" });

        // Clear sessionStorage
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("auth-storage");
        }

        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated();
          state.setLoading(false);
        }
      },
    }
  )
);

// Helper to get refresh token from cookies
export const getRefreshToken = (): string | undefined => {
  return Cookies.get("refreshToken");
};

// Hook to wait for hydration before rendering auth-dependent UI
export function useAuthHydration() {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  return isHydrated;
}