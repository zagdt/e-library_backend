"use client";

import { useRole, useLogout } from "@/hooks/useAuth";
import { useUIStore } from "@/stores/uiStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Moon, Sun, LogOut, Shield, Palette, Laptop, Bell, Lock, Mail } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default function SettingsPage() {
    const { user, role } = useRole();
    const { mutate: logout, isPending } = useLogout();
    const { reducedMotion, setReducedMotion } = useUIStore();
    const { theme, setTheme } = useTheme();

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 rounded-3xl">
                <div className="space-y-2">
                    <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                        Settings
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        Manage your account preferences and application settings.
                    </p>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid gap-8"
            >
                {/* Profile Section */}
                <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-muted"></div>
                    <CardContent className="relative pt-0 px-8 pb-8">
                        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-12 mb-6">
                            <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                                <AvatarImage src={user?.avatar} />
                                <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
                                    {user ? getInitials(`${user.firstName} ${user.lastName}`) : "?"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1 mb-2">
                                <h3 className="text-2xl font-bold">
                                    {user?.firstName} {user?.lastName}
                                </h3>
                                <p className="text-muted-foreground font-medium">{user?.email}</p>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant={role === "ADMIN" ? "destructive" : role === "STAFF" ? "default" : "secondary"} className="px-3 py-1 text-sm rounded-full">
                                    {role}
                                </Badge>
                                {user?.isVerified && (
                                    <Badge variant="outline" className="gap-1.5 px-3 py-1 text-sm rounded-full bg-green-500/10 text-green-600 border-green-200 dark:border-green-900 dark:text-green-400">
                                        <Shield className="h-3.5 w-3.5" />
                                        Verified
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4 p-6 bg-muted/30 rounded-2xl">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Mail className="h-5 w-5" />
                                    <span className="font-medium text-foreground">Email Address</span>
                                </div>
                                <p className="pl-8 text-sm text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                            <div className="space-y-4 p-6 bg-muted/30 rounded-2xl">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Lock className="h-5 w-5" />
                                    <span className="font-medium text-foreground">Account Security</span>
                                </div>
                                <p className="pl-8 text-sm text-muted-foreground">
                                    Password last changed 30 days ago
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Preferences Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Appearance */}
                    <Card className="rounded-3xl border-none shadow-sm h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <Palette className="h-5 w-5 text-primary" />
                                </div>
                                Appearance
                            </CardTitle>
                            <CardDescription>Customize how the application looks</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Dark Mode</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Switch between light and dark themes
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 bg-background p-1.5 rounded-full border shadow-sm">
                                    <Button
                                        variant={theme === "light" ? "secondary" : "ghost"}
                                        size="icon"
                                        className="rounded-full h-8 w-8"
                                        onClick={() => setTheme("light")}
                                    >
                                        <Sun className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={theme === "dark" ? "secondary" : "ghost"}
                                        size="icon"
                                        className="rounded-full h-8 w-8"
                                        onClick={() => setTheme("dark")}
                                    >
                                        <Moon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={theme === "system" ? "secondary" : "ghost"}
                                        size="icon"
                                        className="rounded-full h-8 w-8"
                                        onClick={() => setTheme("system")}
                                    >
                                        <Laptop className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Reduce Motion</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Minimize animations for accessibility
                                    </p>
                                </div>
                                <Switch
                                    checked={reducedMotion}
                                    onCheckedChange={setReducedMotion}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notifications & Session */}
                    <div className="space-y-8">
                        <Card className="rounded-3xl border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-xl">
                                    <div className="p-2 bg-primary/10 rounded-xl">
                                        <Bell className="h-5 w-5 text-primary" />
                                    </div>
                                    Notifications
                                </CardTitle>
                                <CardDescription>Manage your notification preferences</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl opacity-60 cursor-not-allowed">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Push Notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive updates about your requests
                                        </p>
                                    </div>
                                    <Switch disabled />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border-destructive/20 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-xl text-destructive">
                                    <div className="p-2 bg-destructive/10 rounded-xl">
                                        <LogOut className="h-5 w-5 text-destructive" />
                                    </div>
                                    Session
                                </CardTitle>
                                <CardDescription>Manage your current session</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    variant="destructive"
                                    onClick={() => logout()}
                                    disabled={isPending}
                                    className="w-full rounded-xl h-12 text-base shadow-md hover:shadow-lg transition-all"
                                >
                                    <LogOut className="mr-2 h-5 w-5" />
                                    Sign out
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
