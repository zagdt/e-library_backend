import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminSettingsApi } from "@/lib/api";
import { toast } from "sonner";

export const useSystemSettings = () => {
    return useQuery({
        queryKey: ["admin", "settings", "all"],
        queryFn: adminSettingsApi.getAll,
    });
};

export const useEmailSettings = () => {
    return useQuery({
        queryKey: ["admin", "settings", "email"],
        queryFn: adminSettingsApi.getEmailSettings,
    });
};

export const useUpdateEmailProvider = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: adminSettingsApi.setEmailProvider,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
            toast.success("Email provider updated successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update email provider");
        },
    });
};

export const useUpdateSetting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ key, value }: { key: string; value: any }) =>
            adminSettingsApi.updateSetting(key, value),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
            toast.success("Setting updated successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update setting");
        },
    });
};

export const useInitializeSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: adminSettingsApi.initialize,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
            toast.success("Settings initialized successfully");
        },
    });
};
