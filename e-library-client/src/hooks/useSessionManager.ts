"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuthStore, getRefreshToken } from "@/stores/authStore";
import { authApi } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";

// Configuration - adjust based on your token expiry times
const TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes (access token)
const REFRESH_BUFFER_MS = 2 * 60 * 1000; // Refresh 2 minutes before expiry
const REFRESH_INTERVAL_MS = TOKEN_EXPIRY_MS - REFRESH_BUFFER_MS; // 13 minutes
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 5000;

interface SessionState {
  lastRefreshTime: number;
  retryCount: number;
  isRefreshing: boolean;
}

export function useSessionManager() {
  const { user, accessToken, setUser, setTokens, logout, setLoading } = useAuthStore();
  const queryClient = useQueryClient();

  // Refs to track state
  const isInitialized = useRef(false);
  const userIdRef = useRef<string | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStateRef = useRef<SessionState>({
    lastRefreshTime: Date.now(),
    retryCount: 0,
    isRefreshing: false,
  });
  const isMountedRef = useRef(true);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
      console.log("[Session] Refresh interval cleared");
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
      console.log("[Session] Retry timeout cleared");
    }
  }, []);

  // Handle session expiry
  const handleSessionExpired = useCallback(() => {
    if (!isMountedRef.current) return;

    console.log("[Session] Session expired, logging out");
    logout();
    queryClient.clear();
    cleanup();

    if (typeof window !== "undefined") {
      window.location.href = "/login?session_expired=true";
    }
  }, [logout, queryClient, cleanup]);

  // Verify current session
  const verifySession = useCallback(async (): Promise<boolean> => {
    if (!accessToken || !isMountedRef.current) return false;

    try {
      console.log("[Session] Verifying session...");
      const response = await authApi.getMe();

      if (isMountedRef.current && response.success && response.data) {
        setUser(response.data);
        queryClient.setQueryData(queryKeys.auth.me, response.data);
        console.log("[Session] Session verified successfully");
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("[Session] Verification failed:", error);

      const isUnauthorized = error?.status === 401 || error?.response?.status === 401;

      if (isUnauthorized) {
        handleSessionExpired();
        return false;
      }

      // For network errors, assume session is still valid
      console.log("[Session] Verification failed (network error), assuming valid");
      return true;
    }
  }, [accessToken, setUser, queryClient, handleSessionExpired]);

  // Refresh token
  const refreshToken = useCallback(async (): Promise<boolean> => {
    // Prevent concurrent refresh attempts
    if (sessionStateRef.current.isRefreshing) {
      console.log("[Session] Refresh already in progress, skipping");
      return false;
    }

    // Only refresh if user is logged in
    const refreshTokenValue = getRefreshToken();
    if (!accessToken || !refreshTokenValue || !isMountedRef.current) {
      console.log("[Session] No tokens found, skipping refresh");
      return false;
    }

    sessionStateRef.current.isRefreshing = true;

    try {
      console.log("[Session] Refreshing access token...");
      const response = await authApi.refreshToken(refreshTokenValue);

      if (isMountedRef.current && response.success && response.data) {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken, user } = response.data;

        // Update tokens in store
        setTokens(newAccessToken, newRefreshToken);

        // Update user if provided
        if (user) {
          setUser(user);
          queryClient.setQueryData(queryKeys.auth.me, user);
        }

        sessionStateRef.current.lastRefreshTime = Date.now();
        sessionStateRef.current.retryCount = 0;
        console.log("[Session] Token refreshed successfully");
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("[Session] Token refresh failed:", error);

      const isUnauthorized = error?.status === 401 || error?.response?.status === 401;

      if (isUnauthorized) {
        handleSessionExpired();
        return false;
      }

      // Handle retry logic for network errors
      sessionStateRef.current.retryCount++;

      if (sessionStateRef.current.retryCount >= MAX_RETRY_ATTEMPTS) {
        console.error("[Session] Max refresh retry attempts reached");
        sessionStateRef.current.retryCount = 0;
      } else {
        console.log(
          `[Session] Retry ${sessionStateRef.current.retryCount}/${MAX_RETRY_ATTEMPTS} in ${RETRY_DELAY_MS / 1000}s`
        );
        retryTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            refreshToken();
          }
        }, RETRY_DELAY_MS);
      }

      return false;
    } finally {
      sessionStateRef.current.isRefreshing = false;
    }
  }, [accessToken, setTokens, setUser, queryClient, handleSessionExpired]);

  // Initialize session management
  useEffect(() => {
    isMountedRef.current = true;
    const currentUserId = user?.id || null;

    // If user hasn't changed, don't re-initialize
    if (isInitialized.current && userIdRef.current === currentUserId) {
      return;
    }

    // If user logged out, reset initialization
    if (!currentUserId && isInitialized.current) {
      console.log("[Session] User logged out, cleaning up");
      isInitialized.current = false;
      userIdRef.current = null;
      cleanup();
      setLoading(false);
      return;
    }

    // Initialize session for logged-in user
    const initializeSession = async () => {
      if (!user || !currentUserId || !accessToken) {
        setLoading(false);
        console.log("[Session] No user or token to initialize");
        return;
      }

      console.log(`[Session] Initializing for user: ${currentUserId}`);

      // First, verify the current session is valid
      const isValid = await verifySession();

      if (!isValid) {
        console.log("[Session] Initial verification failed");
        setLoading(false);
        return;
      }

      // Mark as initialized
      isInitialized.current = true;
      userIdRef.current = currentUserId;
      sessionStateRef.current.lastRefreshTime = Date.now();

      // Set up automatic token refresh
      refreshIntervalRef.current = setInterval(() => {
        console.log("[Session] Scheduled refresh triggered");
        refreshToken();
      }, REFRESH_INTERVAL_MS);

      console.log(`[Session] Auto-refresh every ${REFRESH_INTERVAL_MS / 1000 / 60} minutes`);
      setLoading(false);
    };

    initializeSession();

    // Cleanup on unmount or user change
    return () => {
      console.log("[Session] Cleaning up effect");
      isMountedRef.current = false;
      cleanup();
    };
  }, [user, accessToken, setLoading, verifySession, refreshToken, cleanup]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && user && accessToken) {
        const timeSinceLastRefresh = Date.now() - sessionStateRef.current.lastRefreshTime;

        // If it's been more than half the token lifetime, refresh proactively
        if (timeSinceLastRefresh > TOKEN_EXPIRY_MS / 2) {
          console.log("[Session] User returned after long absence, refreshing");
          refreshToken();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, accessToken, refreshToken]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (user && accessToken) {
        console.log("[Session] Connection restored, verifying session");
        verifySession();
      }
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [user, accessToken, verifySession]);
}