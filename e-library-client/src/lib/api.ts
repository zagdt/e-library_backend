import api from "./axios";
import type {
  ApiResponse,
  AuthTokens,
  Course,
  CreateCourseData,
  CreateRequestData,
  CreateResourceData,
  DashboardMetrics,
  ForgotPasswordData,
  LoginCredentials,
  PaginatedResponse,
  ResetPasswordData,
  Resource,
  ResourceFilters,
  ResourceRequest,
  SearchSuggestion,
  SignupData,
  UpdateRequestData,
  UpdateUserRoleData,
  User,
  VerifyEmailData,
  AuditLog,
  AnalyticsOverview,
  DateTrend,
  ResourceTrend,
  ItemCount,
  UserRoleDistribution,
  ResourceCategoryDistribution,
  RequestStats,
  AnalyticsReport,
  Notification,
  NotificationListResponse,
  SystemSetting,
  EmailSettings,
} from "@/types/api";

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<ApiResponse<AuthTokens & { user: User }>>("/auth/login", credentials);
    return response.data;
  },

  signup: async (data: SignupData) => {
    const response = await api.post<ApiResponse<{ user: User }>>("/auth/register", data);
    return response.data;
  },

  verifyEmail: async (data: VerifyEmailData) => {
    const response = await api.post<ApiResponse>("/auth/verify-email", data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordData) => {
    const response = await api.post<ApiResponse>("/auth/forgot-password", data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData) => {
    const response = await api.post<ApiResponse>("/auth/reset-password", data);
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post<ApiResponse<AuthTokens>>("/auth/refresh", { refreshToken });
    return response.data;
  },

  logout: async () => {
    const response = await api.post<ApiResponse>("/auth/logout");
    return response.data;
  },

  getMe: async () => {
    const response = await api.get<ApiResponse<User>>("/auth/me");
    return response.data;
  },
};

export const resourcesApi = {
  list: async (filters?: ResourceFilters) => {
    const response = await api.get<PaginatedResponse<Resource>>("/resources", { params: filters });
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get<ApiResponse<Resource>>(`/resources/${id}`);
    return response.data;
  },

  create: async (formData: FormData) => {
    const response = await api.post<ApiResponse<Resource>>("/resources", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  update: async (id: string, data: Partial<CreateResourceData>) => {
    const response = await api.put<ApiResponse<Resource>>(`/resources/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/resources/${id}`);
    return response.data;
  },

  download: async (id: string) => {
    const response = await api.post<ApiResponse<{ url: string }>>(`/resources/${id}/download`);
    return response.data;
  },

  getTrending: async () => {
    const response = await api.get<ApiResponse<Resource[]>>("/resources/trending");
    return response.data;
  },

  getLatest: async () => {
    const response = await api.get<ApiResponse<Resource[]>>("/resources/latest");
    return response.data;
  },
};

export const coursesApi = {
  list: async (filters?: { page?: number; limit?: number; search?: string }) => {
    const response = await api.get<PaginatedResponse<Course>>("/courses", { params: filters });
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get<ApiResponse<Course>>(`/courses/${id}`);
    return response.data;
  },

  create: async (data: CreateCourseData) => {
    const response = await api.post<ApiResponse<Course>>("/courses", data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateCourseData>) => {
    const response = await api.put<ApiResponse<Course>>(`/courses/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/courses/${id}`);
    return response.data;
  },

  getResources: async (id: string, filters?: ResourceFilters) => {
    const response = await api.get<PaginatedResponse<Resource>>(`/courses/${id}/resources`, {
      params: filters,
    });
    return response.data;
  },
};

export const requestsApi = {
  list: async (filters?: { page?: number; limit?: number; status?: string }) => {
    const response = await api.get<PaginatedResponse<ResourceRequest>>("/requests", { params: filters });
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get<ApiResponse<ResourceRequest>>(`/requests/${id}`);
    return response.data;
  },

  create: async (data: CreateRequestData) => {
    const response = await api.post<ApiResponse<ResourceRequest>>("/requests", data);
    return response.data;
  },

  update: async (id: string, data: UpdateRequestData) => {
    const response = await api.put<ApiResponse<ResourceRequest>>(`/requests/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/requests/${id}`);
    return response.data;
  },

  respond: async (id: string, data: UpdateRequestData) => {
    const response = await api.post<ApiResponse<ResourceRequest>>(`/requests/${id}/respond`, data);
    return response.data;
  },

  getMyRequests: async () => {
    const response = await api.get<ApiResponse<ResourceRequest[]>>("/requests/my");
    return response.data;
  },
};

export const searchApi = {
  suggestions: async (query: string) => {
    const response = await api.get<ApiResponse<SearchSuggestion[]>>("/search/suggestions", {
      params: { q: query },
    });
    return response.data;
  },

  search: async (query: string, filters?: ResourceFilters) => {
    const response = await api.get<PaginatedResponse<Resource>>("/search", {
      params: { q: query, ...filters },
    });
    return response.data;
  },
};

export const adminApi = {
  getUsers: async (filters?: { page?: number; limit?: number; role?: string; search?: string }) => {
    const response = await api.get<PaginatedResponse<User>>("/admin/users", { params: filters });
    return response.data;
  },

  getUser: async (id: string) => {
    const response = await api.get<ApiResponse<User>>(`/admin/users/${id}`);
    return response.data;
  },

  updateUserRole: async (id: string, data: UpdateUserRoleData) => {
    const response = await api.put<ApiResponse<User>>(`/admin/users/${id}/role`, data);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/admin/users/${id}`);
    return response.data;
  },

  getMetrics: async () => {
    const response = await api.get<ApiResponse<DashboardMetrics>>("/admin/metrics");
    return response.data;
  },

  getAuditLogs: async (filters?: { page?: number; limit?: number; action?: string; userId?: string }) => {
    const response = await api.get<PaginatedResponse<AuditLog>>("/admin/audit-logs", { params: filters });
    return response.data;
  },
};

export const analyticsApi = {
  getOverview: async () => {
    const response = await api.get<ApiResponse<AnalyticsOverview>>("/analytics/overview");
    return response.data;
  },
  getDownloadTrends: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await api.get<ApiResponse<DateTrend[]>>("/analytics/trends/downloads", { params });
    return response.data;
  },
  getUserTrends: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await api.get<ApiResponse<DateTrend[]>>("/analytics/trends/users", { params });
    return response.data;
  },
  getTopResources: async (limit = 10) => {
    const response = await api.get<ApiResponse<ResourceTrend[]>>("/analytics/top/resources", { params: { limit } });
    return response.data;
  },
  getTopSearchTerms: async (limit = 20) => {
    const response = await api.get<ApiResponse<ItemCount[]>>("/analytics/top/search-terms", { params: { limit } });
    return response.data;
  },
  getUsersByRole: async () => {
    const response = await api.get<ApiResponse<UserRoleDistribution[]>>("/analytics/distribution/users-by-role");
    return response.data;
  },
  getResourcesByCategory: async () => {
    const response = await api.get<ApiResponse<ResourceCategoryDistribution[]>>("/analytics/distribution/resources-by-category");
    return response.data;
  },
  getRequestStats: async () => {
    const response = await api.get<ApiResponse<RequestStats>>("/analytics/requests");
    return response.data;
  },
  generateReport: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await api.get<ApiResponse<AnalyticsReport>>("/analytics/report", { params });
    return response.data;
  },
};

export const notificationsApi = {
  getAll: async (params?: { page?: number; limit?: number; unreadOnly?: boolean }) => {
    const response = await api.get<NotificationListResponse>("/notifications", { params });
    return response.data;
  },
  getUnreadCount: async () => {
    const response = await api.get<ApiResponse<{ unreadCount: number }>>("/notifications/unread-count");
    return response.data;
  },
  markAsRead: async (id: string) => {
    const response = await api.put<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await api.put<ApiResponse<{ count: number }>>("/notifications/read-all");
    return response.data;
  },
  clearRead: async () => {
    const response = await api.delete<ApiResponse<{ count: number }>>("/notifications/clear-read");
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/notifications/${id}`);
    return response.data;
  },
};

export const adminSettingsApi = {
  getAll: async () => {
    const response = await api.get<ApiResponse<Record<string, any>>>("/admin/settings");
    return response.data;
  },
  getEmailSettings: async () => {
    const response = await api.get<ApiResponse<EmailSettings>>("/admin/settings/email");
    return response.data;
  },
  setEmailProvider: async (provider: string) => {
    const response = await api.put<ApiResponse<EmailSettings>>("/admin/settings/email/provider", { provider });
    return response.data;
  },
  getSetting: async (key: string) => {
    const response = await api.get<ApiResponse<SystemSetting>>(`/admin/settings/${key}`);
    return response.data;
  },
  updateSetting: async (key: string, value: any) => {
    const response = await api.put<ApiResponse<SystemSetting>>(`/admin/settings/${key}`, { value });
    return response.data;
  },
  initialize: async () => {
    const response = await api.post<ApiResponse<any>>("/admin/settings/initialize");
    return response.data;
  },
};