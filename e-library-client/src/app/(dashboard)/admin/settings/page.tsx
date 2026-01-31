"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/useAuth";
import { useSystemSettings, useEmailSettings, useUpdateEmailProvider, useUpdateSetting, useInitializeSettings } from "@/hooks/useAdminSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, RotateCcw } from "lucide-react";

export default function AdminSettingsPage() {
    const router = useRouter();
    const { isAdmin } = useRole();

    const { data: systemSettings, isLoading: isSettingsLoading } = useSystemSettings();
    const { data: emailSettings, isLoading: isEmailLoading } = useEmailSettings();

    const updateEmailProvider = useUpdateEmailProvider();
    const updateSetting = useUpdateSetting();
    const initializeSettings = useInitializeSettings();

    useEffect(() => {
        if (!isAdmin) {
            router.replace("/dashboard");
        }
    }, [isAdmin, router]);

    if (!isAdmin) return null;

    const handleProviderChange = (value: string) => {
        updateEmailProvider.mutate(value);
    };

    const handleSettingUpdate = (key: string, value: any) => {
        updateSetting.mutate({ key, value });
    };

    const handleInitialize = () => {
        if (confirm("Are you sure you want to initialize/reset all settings? This will restore defaults.")) {
            initializeSettings.mutate();
        }
    };

    if (isSettingsLoading || isEmailLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    const emailData = emailSettings?.data;
    const settingsData = systemSettings?.data || {};

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
                    <p className="text-muted-foreground">
                        Manage global configuration and preferences
                    </p>
                </div>
                <Button variant="outline" onClick={handleInitialize} disabled={initializeSettings.isPending}>
                    {initializeSettings.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RotateCcw className="h-4 w-4 mr-2" />}
                    Reset Defaults
                </Button>
            </div>

            <Tabs defaultValue="email" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="email">Email Configuration</TabsTrigger>
                    <TabsTrigger value="general">General</TabsTrigger>
                </TabsList>

                <TabsContent value="email">
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Service Provider</CardTitle>
                            <CardDescription>
                                Configure how the system sends transactional emails.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Active Provider</Label>
                                <Select
                                    value={emailData?.provider}
                                    onValueChange={handleProviderChange}
                                    disabled={updateEmailProvider.isPending}
                                >
                                    <SelectTrigger className="w-[300px]">
                                        <SelectValue placeholder="Select provider" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="console">Console (Dev only)</SelectItem>
                                        <SelectItem value="resend">Resend (Recommended)</SelectItem>
                                        <SelectItem value="nodemailer">SMTP (Nodemailer)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground">
                                    Current status: <span className="font-medium capitalize">{emailData?.provider}</span>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Sender Email</Label>
                                <div className="flex gap-2 max-w-[400px]">
                                    <Input
                                        defaultValue={emailData?.fromEmail}
                                        disabled={true}
                                        placeholder="noreply@example.com"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">To change this, update the environment variable or use the general settings tab if exposed.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>Global Configuration</CardTitle>
                            <CardDescription>
                                Review and modify system-wide settings.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {Object.entries(settingsData).map(([key, setting]: [string, any]) => (
                                    <div key={key} className="flex flex-col space-y-2 border-b pb-4 last:border-0">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor={key} className="flex flex-col">
                                                <span className="font-medium">{key}</span>
                                                <span className="font-normal text-muted-foreground text-xs">{setting.description || 'System setting'}</span>
                                            </Label>

                                            {setting.type === 'BOOLEAN' ? (
                                                <Switch
                                                    id={key}
                                                    checked={setting.value}
                                                    onCheckedChange={(checked) => handleSettingUpdate(key, checked)}
                                                    disabled={updateSetting.isPending}
                                                />
                                            ) : (
                                                <div className="flex gap-2">
                                                    <Input
                                                        id={key}
                                                        defaultValue={String(setting.value)}
                                                        onBlur={(e) => {
                                                            if (String(setting.value) !== e.target.value) {
                                                                handleSettingUpdate(key, e.target.value);
                                                            }
                                                        }}
                                                        disabled={updateSetting.isPending}
                                                        className="w-[300px]"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {Object.keys(settingsData).length === 0 && (
                                    <div className="text-center text-muted-foreground py-8">
                                        No editable settings found.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
