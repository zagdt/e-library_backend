import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";
import { toast } from "sonner";
import type { LoginCredentials, SignupData, User } from "@/types/api";

export function useUser() {
  const { accessToken, setUser, logout } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const response = await authApi.getMe();
      if (response.success && response.data) {
        setUser(response.data);
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch user");
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
    retry: false,
    meta: {
      onError: () => {
        logout();
      },
    },
  });
}

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { setUser, setTokens } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await authApi.login(credentials);
      if (!response.success) {
        throw new Error(response.message || "Login failed");
      }
      return response.data!;
    },
    onSuccess: (data) => {
      console.log("[Login] Success! Response data:", data);

      // Backend response structure: { user, tokens: { accessToken, refreshToken } }
      // Handle different possible structures
      let accessToken: string | null = null;
      let refreshToken: string | null = null;
      let user: User | undefined = undefined;

      // Check for tokens in response
      if (data.tokens) {
        // Structure: { tokens: { accessToken, refreshToken }, user }
        accessToken = data.tokens.accessToken;
        refreshToken = data.tokens.refreshToken;
        user = data.user;
      } else if (data.accessToken) {
        // Structure: { accessToken, refreshToken, user }
        accessToken = data.accessToken || data.access_token;
        refreshToken = data.refreshToken || data.refresh_token;
        user = data.user;
      } else if (data.data) {
        // Structure: { data: { tokens, user } }
        const responseData = data.data;
        if (responseData.tokens) {
          accessToken = responseData.tokens.accessToken;
          refreshToken = responseData.tokens.refreshToken;
        }
        user = responseData.user;
      }

      console.log("[Login] Extracted tokens:", {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasUser: !!user,
        accessTokenLength: accessToken?.length,
        refreshTokenLength: refreshToken?.length,
      });

      if (!accessToken || !refreshToken || !user) {
        console.error("[Login] Missing required data:", { accessToken: !!accessToken, refreshToken: !!refreshToken, user: !!user });
        toast.error("Login response did not contain valid authentication data.");
        return;
      }

      // Set tokens and user
      setTokens(accessToken, refreshToken);
      setUser(user);
      queryClient.setQueryData(queryKeys.auth.me, user);

      toast.success(`Welcome back, ${user.name || user.email}!`);

      // Redirect
      // In next/navigation, separate hook useSearchParams is needed for query params
      const redirect = searchParams?.get("redirect");
      const redirectTo = redirect || "/dashboard";
      console.log("[Login] Redirecting to:", redirectTo);
      router.push(redirectTo);
    },
    onError: (error: any) => {
      // Handle specific error cases
      if (error.status === 401) {
        toast.error("Invalid email or password");
      } else if (error.status === 429) {
        toast.error("Too many login attempts. Please try again later.");
      } else if (error.message?.includes("Network")) {
        toast.error("Unable to connect. Check your internet connection.");
      } else {
        toast.error(error.message || "Login failed. Please try again.");
      }

      console.error("[Login] Error:", error);
    },
  });
}

export function useSignup() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: SignupData) => {
      const response = await authApi.signup(data);
      if (!response.success) {
        throw new Error(response.message || "Signup failed");
      }
      return response;
    },
    onSuccess: () => {
      toast.success("Account created! Please check your email to verify your account.");
      router.push("/verify-email");
    },
    onError: (error: any) => {
      if (error.status === 409) {
        toast.error("An account with this email already exists");
      } else if (error.status === 422 && error.data?.errors) {
        // Handle validation errors
        const firstError = Object.values(error.data.errors)[0]?.[0];
        toast.error(firstError || "Please check your input");
      } else {
        toast.error(error.message || "Signup failed. Please try again.");
      }

      console.error("[Signup] Error:", error);
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } catch (error) {
        console.error("[Logout] API call failed:", error);
        // Continue with local logout even if API fails
      }
    },
    onSettled: () => {
      // Always clear local state, even if API call fails
      logout();
      queryClient.clear();

      // Redirect to login
      router.push("/login");
      toast.success("Logged out successfully");
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await authApi.forgotPassword({ email });
      if (!response.success) {
        throw new Error(response.message || "Failed to send reset email");
      }
      return response;
    },
    onSuccess: () => {
      toast.success("Password reset email sent! Please check your inbox.");
    },
    onError: (error: any) => {
      if (error.status === 404) {
        toast.error("No account found with this email address");
      } else if (error.status === 429) {
        toast.error("Too many requests. Please try again later.");
      } else {
        toast.error(error.message || "Failed to send reset email");
      }

      console.error("[ForgotPassword] Error:", error);
    },
  });
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      const response = await authApi.resetPassword(data);
      if (!response.success) {
        throw new Error(response.message || "Failed to reset password");
      }
      return response;
    },
    onSuccess: () => {
      toast.success("Password reset successfully! Please login with your new password.");
      router.push("/login");
    },
    onError: (error: any) => {
      if (error.status === 400) {
        toast.error("Invalid or expired reset token");
      } else if (error.status === 422) {
        toast.error("Password does not meet requirements");
      } else {
        toast.error(error.message || "Failed to reset password");
      }

      console.error("[ResetPassword] Error:", error);
    },
  });
}

export function useVerifyEmail() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (token: string) => {
      const response = await authApi.verifyEmail({ token });
      if (!response.success) {
        throw new Error(response.message || "Failed to verify email");
      }
      return response;
    },
    onSuccess: () => {
      toast.success("Email verified successfully! Please login.");
      router.push("/login");
    },
    onError: (error: any) => {
      if (error.status === 400) {
        toast.error("Invalid or expired verification token");
      } else {
        toast.error(error.message || "Failed to verify email");
      }

      console.error("[VerifyEmail] Error:", error);
    },
  });
}

export function useRole() {
  const { user } = useAuthStore();

  const isAdmin = user?.role === "ADMIN";
  const isStaff = user?.role === "STAFF";
  const isStudent = user?.role === "STUDENT";
  const isStaffOrAdmin = isAdmin || isStaff;

  const can = (action: string): boolean => {
    if (!user) return false;

    const permissions: Record<string, string[]> = {
      "upload-resource": ["ADMIN", "STAFF"],
      "manage-users": ["ADMIN"],
      "manage-courses": ["ADMIN", "STAFF"],
      "view-metrics": ["ADMIN"],
      "view-audit-logs": ["ADMIN"],
      "manage-requests": ["ADMIN", "STAFF"],
      "create-request": ["ADMIN", "STAFF", "STUDENT"],
      "view-resources": ["ADMIN", "STAFF", "STUDENT"],
      "download-resource": ["ADMIN", "STAFF", "STUDENT"],
    };

    return permissions[action]?.includes(user.role) || false;
  };

  return {
    user,
    isAdmin,
    isStaff,
    isStudent,
    isStaffOrAdmin,
    can,
    role: user?.role,
  };
}