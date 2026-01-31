// import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
// import { useAuthStore, getRefreshToken } from "@/stores/authStore";
// import { toast } from "sonner";

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

// export const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   timeout: 30000,
// });

// let isRefreshing = false;
// let failedQueue: Array<{
//   resolve: (token: string) => void;
//   reject: (error: AxiosError) => void;
// }> = [];

// const processQueue = (error: AxiosError | null, token: string | null = null) => {
//   failedQueue.forEach((prom) => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token!);
//     }
//   });
//   failedQueue = [];
// };

// api.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     const accessToken = useAuthStore.getState().accessToken;
//     if (accessToken && config.headers) {
//       config.headers.Authorization = `Bearer ${accessToken}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// api.interceptors.response.use(
//   (response) => response,
//   async (error: AxiosError) => {
//     const originalRequest = error.config as InternalAxiosRequestConfig & {
//       _retry?: boolean;
//       _retryCount?: number;
//     };

//     if (!originalRequest) {
//       return Promise.reject(error);
//     }

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         })
//           .then((token) => {
//             if (originalRequest.headers) {
//               originalRequest.headers.Authorization = `Bearer ${token}`;
//             }
//             return api(originalRequest);
//           })
//           .catch((err) => Promise.reject(err));
//       }

//       originalRequest._retry = true;
//       originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

//       if (originalRequest._retryCount > 3) {
//         useAuthStore.getState().logout();
//         if (typeof window !== "undefined") {
//           window.location.href = "/login";
//         }
//         return Promise.reject(error);
//       }

//       isRefreshing = true;

//       const refreshToken = getRefreshToken();
//       if (!refreshToken) {
//         isRefreshing = false;
//         useAuthStore.getState().logout();
//         if (typeof window !== "undefined") {
//           window.location.href = "/login";
//         }
//         return Promise.reject(error);
//       }

//       try {
//         const response = await axios.post(
//           `${API_BASE_URL}/auth/refresh`,
//           { refreshToken },
//           {
//             headers: {
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         if (response.data.success && response.data.data) {
//           const { accessToken, refreshToken: newRefreshToken } = response.data.data;
//           useAuthStore.getState().setTokens(accessToken, newRefreshToken);
//           processQueue(null, accessToken);

//           if (originalRequest.headers) {
//             originalRequest.headers.Authorization = `Bearer ${accessToken}`;
//           }
//           return api(originalRequest);
//         } else {
//           throw new Error("Refresh failed");
//         }
//       } catch (refreshError) {
//         processQueue(refreshError as AxiosError, null);
//         useAuthStore.getState().logout();
//         if (typeof window !== "undefined") {
//           window.location.href = "/login";
//         }
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     if (error.response?.status === 403) {
//       toast.error("You do not have permission to perform this action");
//     }

//     if (error.response?.status === 422) {
//       const data = error.response.data as { errors?: Record<string, string[]> };
//       if (data?.errors) {
//         const firstError = Object.values(data.errors)[0]?.[0];
//         if (firstError) {
//           toast.error(firstError);
//         }
//       }
//     }

//     if (error.response?.status && error.response.status >= 500) {
//       toast.error("Server error. Please try again later.");
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;


// import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
// import { useAuthStore, getRefreshToken } from "@/stores/authStore";
// import { toast } from "sonner";

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

// export const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   timeout: 30000,
// });

// // Global state for token refresh
// let isRefreshing = false;
// let refreshSubscribers: Array<(error?: any) => void> = [];

// // Subscribe to token refresh completion
// function subscribeTokenRefresh(callback: (error?: any) => void) {
//   refreshSubscribers.push(callback);
// }

// // Notify all subscribers when refresh completes
// function onRefreshComplete(error?: any) {
//   refreshSubscribers.forEach((callback) => callback(error));
//   refreshSubscribers = [];
// }

// // Request interceptor - add access token
// api.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     const accessToken = useAuthStore.getState().accessToken;
//     if (accessToken && config.headers) {
//       config.headers.Authorization = `Bearer ${accessToken}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response interceptor - handle errors and token refresh
// api.interceptors.response.use(
//   (response) => response,
//   async (error: AxiosError) => {
//     const originalRequest = error.config as InternalAxiosRequestConfig & {
//       _retry?: boolean;
//     };

//     if (!originalRequest) {
//       return Promise.reject(error);
//     }

//     // Handle 401 Unauthorized - try to refresh token
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       // Don't retry for auth endpoints (would cause infinite loop)
//       const isAuthEndpoint =
//         originalRequest.url?.includes("/auth/login") ||
//         originalRequest.url?.includes("/auth/register") ||
//         originalRequest.url?.includes("/auth/refresh") ||
//         originalRequest.url?.includes("/auth/logout") ||
//         originalRequest.url?.includes("/auth/verify-email") ||
//         originalRequest.url?.includes("/auth/forgot-password") ||
//         originalRequest.url?.includes("/auth/reset-password");

//       if (isAuthEndpoint) {
//         console.log("[API] Auth endpoint failed (401) - Invalid credentials or token");
//         // For auth endpoints, just return the error
//         return Promise.reject(error);
//       }

//       originalRequest._retry = true;

//       // If not already refreshing, start refresh process
//       if (!isRefreshing) {
//         isRefreshing = true;
//         console.log("[API] Access token expired, attempting refresh...");

//         const refreshToken = getRefreshToken();
        
//         if (!refreshToken) {
//           console.log("[API] No refresh token found, logging out");
//           isRefreshing = false;
//           onRefreshComplete(error);
//           useAuthStore.getState().logout();
          
//           if (typeof window !== "undefined") {
//             window.location.href = "/login?session_expired=true";
//           }
//           return Promise.reject(error);
//         }

//         try {
//           // Attempt to refresh the token
//           const response = await axios.post(
//             `${API_BASE_URL}/auth/refresh`,
//             { refreshToken },
//             {
//               headers: {
//                 "Content-Type": "application/json",
//               },
//             }
//           );

//           if (response.data.success && response.data.data) {
//             const { accessToken, refreshToken: newRefreshToken, user } = response.data.data;
            
//             console.log("[API] Token refreshed successfully");
            
//             // Update store with new tokens
//             useAuthStore.getState().setTokens(accessToken, newRefreshToken);
            
//             // Update user if provided
//             if (user) {
//               useAuthStore.getState().setUser(user);
//             }
            
//             isRefreshing = false;
            
//             // Notify all waiting requests
//             onRefreshComplete();

//             // Retry original request with new token
//             if (originalRequest.headers) {
//               originalRequest.headers.Authorization = `Bearer ${accessToken}`;
//             }
//             return api(originalRequest);
//           } else {
//             throw new Error("Refresh response invalid");
//           }
//         } catch (refreshError) {
//           console.error("[API] Token refresh failed:", refreshError);
//           isRefreshing = false;
          
//           // Notify all waiting requests that refresh failed
//           onRefreshComplete(refreshError);
          
//           // Clear auth state and redirect
//           useAuthStore.getState().logout();
          
//           if (typeof window !== "undefined") {
//             window.location.href = "/login?session_expired=true";
//           }
          
//           return Promise.reject(refreshError);
//         }
//       }

//       // If already refreshing, queue this request
//       console.log("[API] Token refresh in progress, queuing request...");
//       return new Promise((resolve, reject) => {
//         subscribeTokenRefresh((error?: any) => {
//           if (error) {
//             reject(error);
//           } else {
//             // Retry the request with the new token
//             const accessToken = useAuthStore.getState().accessToken;
//             if (originalRequest.headers && accessToken) {
//               originalRequest.headers.Authorization = `Bearer ${accessToken}`;
//             }
//             resolve(api(originalRequest));
//           }
//         });
//       });
//     }

//     // Handle other error status codes
//     if (error.response?.status === 403) {
//       toast.error("You do not have permission to perform this action");
//     }

//     if (error.response?.status === 422) {
//       const data = error.response.data as { errors?: Record<string, string[]> };
//       if (data?.errors) {
//         const firstError = Object.values(data.errors)[0]?.[0];
//         if (firstError) {
//           toast.error(firstError);
//         }
//       }
//     }

//     if (error.response?.status && error.response.status >= 500) {
//       toast.error("Server error. Please try again later.");
//     }

//     // Preserve error structure for component handling
//     const apiError = error as any;
//     apiError.status = error.response?.status;
//     apiError.data = error.response?.data;

//     return Promise.reject(apiError);
//   }
// );

// export default api;

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore, getRefreshToken } from "@/stores/authStore";
import { toast } from "sonner";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
  withCredentials: true, // IMPORTANT: Enable credentials for cookies
});

// Global state for token refresh
let isRefreshing = false;
let refreshSubscribers: Array<(error?: any) => void> = [];

// Subscribe to token refresh completion
function subscribeTokenRefresh(callback: (error?: any) => void) {
  refreshSubscribers.push(callback);
}

// Notify all subscribers when refresh completes
function onRefreshComplete(error?: any) {
  refreshSubscribers.forEach((callback) => callback(error));
  refreshSubscribers = [];
}

// Request interceptor - add access token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry for auth endpoints (would cause infinite loop)
      const isAuthEndpoint =
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/register") ||
        originalRequest.url?.includes("/auth/refresh") ||
        originalRequest.url?.includes("/auth/logout") ||
        originalRequest.url?.includes("/auth/verify-email") ||
        originalRequest.url?.includes("/auth/forgot-password") ||
        originalRequest.url?.includes("/auth/reset-password");

      if (isAuthEndpoint) {
        console.log("[API] Auth endpoint failed (401) - Invalid credentials or token");
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // If not already refreshing, start refresh process
      if (!isRefreshing) {
        isRefreshing = true;
        console.log("[API] Access token expired, attempting refresh...");

        const refreshToken = getRefreshToken();

        // Debug logging
        console.log("[DEBUG] Refresh token check:");
        console.log("- Has refresh token:", !!refreshToken);
        console.log("- Token length:", refreshToken?.length);
        console.log("- Token preview:", refreshToken?.substring(0, 30) + "...");

        if (!refreshToken) {
          console.log("[API] No refresh token found, logging out");
          isRefreshing = false;
          onRefreshComplete(error);
          useAuthStore.getState().logout();

          if (typeof window !== "undefined") {
            window.location.href = "/login?session_expired=true";
          }
          return Promise.reject(error);
        }

        try {
          console.log("[DEBUG] Sending refresh request with token in body");
          
          // Attempt to refresh the token
          // Send token in body (as your Postman test does)
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken }, // Token in body
            {
              headers: {
                "Content-Type": "application/json",
              },
              withCredentials: true, // Also send cookies if backend uses them
            }
          );

          console.log("[DEBUG] Refresh response status:", response.status);
          console.log("[DEBUG] Response has data:", !!response.data);

          if (response.data.success && response.data.data) {
            const { accessToken, refreshToken: newRefreshToken, user } = response.data.data;

            console.log("[API] Token refreshed successfully");
            console.log("[DEBUG] Got new tokens:", {
              hasAccessToken: !!accessToken,
              hasRefreshToken: !!newRefreshToken,
              hasUser: !!user,
            });

            // Update store with new tokens
            useAuthStore.getState().setTokens(accessToken, newRefreshToken);

            // Update user if provided
            if (user) {
              useAuthStore.getState().setUser(user);
            }

            isRefreshing = false;

            // Notify all waiting requests
            onRefreshComplete();

            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return api(originalRequest);
          } else {
            throw new Error("Refresh response invalid");
          }
        } catch (refreshError: any) {
          console.error("[API] Token refresh failed:", refreshError);
          console.error("[DEBUG] Error details:", {
            status: refreshError.response?.status,
            data: refreshError.response?.data,
            message: refreshError.message,
          });
          
          isRefreshing = false;

          // Notify all waiting requests that refresh failed
          onRefreshComplete(refreshError);

          // Clear auth state and redirect
          useAuthStore.getState().logout();

          if (typeof window !== "undefined") {
            window.location.href = "/login?session_expired=true";
          }

          return Promise.reject(refreshError);
        }
      }

      // If already refreshing, queue this request
      console.log("[API] Token refresh in progress, queuing request...");
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((error?: any) => {
          if (error) {
            reject(error);
          } else {
            // Retry the request with the new token
            const accessToken = useAuthStore.getState().accessToken;
            if (originalRequest.headers && accessToken) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            resolve(api(originalRequest));
          }
        });
      });
    }

    // Handle other error status codes
    if (error.response?.status === 403) {
      toast.error("You do not have permission to perform this action");
    }

    if (error.response?.status === 422) {
      const data = error.response.data as { errors?: Record<string, string[]> };
      if (data?.errors) {
        const firstError = Object.values(data.errors)[0]?.[0];
        if (firstError) {
          toast.error(firstError);
        }
      }
    }

    if (error.response?.status && error.response.status >= 500) {
      toast.error("Server error. Please try again later.");
    }

    // Preserve error structure for component handling
    const apiError = error as any;
    apiError.status = error.response?.status;
    apiError.data = error.response?.data;

    return Promise.reject(apiError);
  }
);

export default api;