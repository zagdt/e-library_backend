export type UserRole = "ADMIN" | "STAFF" | "STUDENT";

export interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isVerified: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface VerifyEmailData {
  token: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export interface CreateResourceData {
  title: string;
  description?: string;
  category: 'BOOK' | 'JOURNAL' | 'PAPER' | 'MAGAZINE' | 'THESIS' | 'OTHER';
  department: string;
  authors: string[];
  publicationYear?: number;
  accessType: 'VIEW_ONLY' | 'DOWNLOADABLE' | 'CAMPUS_ONLY';
  physicalLocation?: string;
  shelfNumber?: string;
  availabilityNotes?: string;
  copies?: number;
  isbn?: string;
  issn?: string;
  tags?: string[];
  courseIds?: string[];
  file?: File;
}

export interface Resource {
  id: string;
  title: string;
  description?: string;
  category: 'BOOK' | 'JOURNAL' | 'PAPER' | 'MAGAZINE' | 'THESIS' | 'OTHER';
  department: string;
  authors: string[];
  publicationYear?: number;
  accessType: 'VIEW_ONLY' | 'DOWNLOADABLE' | 'CAMPUS_ONLY';
  physicalLocation?: string;
  shelfNumber?: string;
  availabilityNotes?: string;
  copies?: number;
  isbn?: string;
  issn?: string;
  tags: string[];
  type?: ResourceType; // Added
  fileType?: string;
  fileSize?: number;
  cloudinaryUrl?: string;
  cloudinaryId?: string;
  coverImageUrl?: string; // Added
  coverImageId?: string; // Added
  downloadCount: number;
  viewCount: number;
  uploadedById: string;
  uploadedBy: User;
  courses?: Array<{
    course: Course;
  }>;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}


export type ResourceType = "PDF" | "VIDEO" | "DOCUMENT" | "IMAGE" | "AUDIO" | "OTHER";

export interface ResourceFilters {
  search?: string;
  type?: ResourceType;
  category?: string;
  courseId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface RequestResponse {
  id: string;
  requestId: string;
  adminId: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

// --- Analytics Types ---

export interface AnalyticsOverview {
  totalUsers: number;
  totalResources: number;
  totalDownloads: number;
  activeUsers: number; // Last 30 days
}

export interface DateTrend {
  date: string;
  count: number;
}

export interface ResourceTrend {
  resourceId: string;
  title: string;
  count: number;
}

export interface ItemCount {
  item: string;
  count: number;
}

export interface UserRoleDistribution {
  role: string;
  count: number;
}

export interface ResourceCategoryDistribution {
  category: string;
  count: number;
}

export interface RequestStats {
  total: number;
  pending: number;
  resolved: number;
  rejected: number;
  avgResolutionTime: number; // hours
}

export interface AnalyticsReport {
  overview: AnalyticsOverview;
  downloads: DateTrend[];
  users: DateTrend[];
  topResources: ResourceTrend[];
  topSearchTerms: ItemCount[];
  requestStats: RequestStats;
}

// --- Notification Types ---

export interface Notification {
  id: string;
  userId: string;
  type: 'SYSTEM' | 'REQUEST_UPDATE' | 'RESOURCE_ADDED' | 'ACCOUNT';
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

export interface NotificationListResponse {
  data: Notification[];
  pagination: PaginationMeta;
  unreadCount: number;
}

// --- Admin Settings Types ---

export interface SystemSetting {
  key: string;
  value: any;
  description?: string;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  isPublic: boolean;
  updatedAt: string;
}

export interface EmailSettings {
  provider: 'resend' | 'nodemailer' | 'console';
  fromEmail: string;
  resendApiKey?: string; // Masked
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  department: string;
  instructor?: User;
  resourceCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseData {
  name: string;
  code: string;
  description: string;
  department: string;
}

export interface ResourceRequest {
  id: string;
  title: string;
  authors?: string; // Add this
  reason: string; // Changed from description
  category?: RequestCategory;
  priority: RequestPriority;
  dueDate?: string;
  status: string;
  adminReply?: string; // Changed from adminNotes
  accessInstructions?: string;
  externalSourceUrl?: string;
  fulfilledResourceId?: string;
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface CreateRequestData {
  title: string;
  authors?: string; // Add this
  reason: string; // Changed from description
  category?: RequestCategory;
  priority?: RequestPriority;
  dueDate?: string;
}

export interface UpdateRequestData {
  status?: string;
  adminReply?: string;
  accessInstructions?: string;
  externalSourceUrl?: string;
  fulfilledResourceId?: string;
}

export type RequestStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
export type RequestPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type RequestCategory = "BOOK" | "JOURNAL" | "PAPER" | "THESIS" | "EQUIPMENT" | "OTHER";

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  user: User;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface DashboardMetrics {
  totalUsers: number;
  totalResources: number;
  totalDownloads: number;
  totalRequests: number;
  pendingRequests: number;
  newUsersThisMonth: number;
  resourcesByType: Record<ResourceType, number>;
  recentActivity: AuditLog[];
}

export interface SearchSuggestion {
  id: string;
  title: string;
  type: "resource" | "course" | "user";
  description?: string;
}

export interface UpdateUserRoleData {
  role: UserRole;
}
