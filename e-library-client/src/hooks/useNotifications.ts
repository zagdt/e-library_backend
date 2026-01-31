import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api";
import { toast } from "sonner";

export const useNotifications = (params: { page?: number; limit?: number; unreadOnly?: boolean } = {}) => {
    return useQuery({
        queryKey: ["notifications", params],
        queryFn: () => notificationsApi.getAll(params),
        placeholderData: (previousData) => previousData,
    });
};

export const useUnreadCount = () => {
    return useQuery({
        // Refetch every minute
        refetchInterval: 60 * 1000,
        queryKey: ["notifications", "unread-count"],
        queryFn: notificationsApi.getUnreadCount,
    });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: notificationsApi.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
};

export const useMarkAllAsRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: notificationsApi.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            toast.success("All notifications marked as read");
        },
    });
};

export const useClearReadNotifications = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: notificationsApi.clearRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            toast.success("Read notifications cleared");
        },
    });
};

export const useDeleteNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: notificationsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
};
