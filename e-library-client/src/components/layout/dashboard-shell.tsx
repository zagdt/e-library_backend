"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { useRole, useLogout, useUser } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
    BookOpen,
    BotIcon,
    LogOut,
    Menu,
    Moon,
    Settings,
    Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { getInitials, cn } from "@/lib/utils";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";
import { AdminSidebar } from "./admin-sidebar";
import { StudentStaffTopbar } from "./student-staff-topbar";

interface DashboardShellProps {
    children: ReactNode;
    title?: string; // Kept for compatibility, though sticking to Client Layout usually implies title is managed by page
}

export function DashboardShell({ children, title }: DashboardShellProps) {
    const router = useRouter();
    const { user, isAuthenticated, isHydrated } = useAuthStore();
    const { toggleSidebar } = useUIStore();
    const { isAdmin } = useRole();
    const { mutate: logout } = useLogout();
    const { theme, setTheme } = useTheme();
    const { isLoading: userLoading } = useUser();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && isHydrated && !isAuthenticated) {
            router.push(`/login`);
        }
    }, [isHydrated, isAuthenticated, router, mounted]);

    if (!mounted || !isHydrated || userLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="space-y-4 flex flex-col items-center">
                    <div className="relative">
                        <div className="h-16 w-16 rounded-2xl bg-primary/20 animate-pulse" />
                        <BookOpen className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background font-sans antialiased">
            {/* Admin Side: Sidebar */}
            {isAdmin && <AdminSidebar />}

            {/* Main Layout Area */}
            <div className={cn("min-h-screen flex flex-col transition-all duration-300", isAdmin && "lg:pl-64")}>

                {/* Universal Header */}
                <header className="sticky top-0 z-30 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                    <div className="flex h-full items-center gap-4 px-4 container mx-auto">

                        {/* Mobile Menu Trigger (Admin Only) */}
                        {isAdmin && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleSidebar}
                                className="lg:hidden"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        )}

                        {/* Logo (Non-Admin Only) - Admins have logo in sidebar */}
                        {!isAdmin && (
                            <Link href="/dashboard" className="flex items-center gap-2">
                                <img src="/vu-logo.png" alt="VU Logo" className="h-8 w-8 object-contain" />
                                <span className="font-bold text-lg hidden sm:inline-block">ResourceHub</span>
                            </Link>
                        )}

                        {/* Page Title / Welcome Message */}
                        <div className="flex flex-col gap-0.5 min-w-0">
                            {title ? (
                                <h1 className="text-base font-bold tracking-tight truncate">{title}</h1>
                            ) : (
                                <h1 className="text-base font-bold tracking-tight truncate hidden sm:block">
                                    Welcome, {user.firstName}
                                </h1>
                            )}
                        </div>

                        {/* Right Side Actions */}
                        <div className="ml-auto flex items-center gap-2">

                            {/* AI Assistant */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <BotIcon className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem disabled className="justify-center">
                                        <span className="text-muted-foreground text-sm">AI Assistant Coming Soon</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <NotificationsPopover />

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="rounded-full"
                            >
                                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                <span className="sr-only">Toggle theme</span>
                            </Button>

                            {/* User Menu (Non-Admin Only) - Admins have user menu in sidebar */}
                            {!isAdmin && (
                                <>
                                    <div className="h-6 w-px bg-border mx-1" />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="rounded-full">
                                                <Avatar className="h-8 w-8 border-2 border-background">
                                                    <AvatarImage src={user.avatar} />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                                        {getInitials(`${user.name}`)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            <DropdownMenuLabel>
                                                <div className="flex flex-col space-y-1">
                                                    <p className="text-sm font-semibold">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider w-fit mt-1">
                                                        {user.role}
                                                    </span>
                                                </div>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <Link href="/settings" className="cursor-pointer">
                                                    <Settings className="mr-2 h-4 w-4" />
                                                    Settings
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => logout()}
                                                className="cursor-pointer text-destructive focus:text-destructive"
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Log out
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Student/Staff Topbar */}
                {!isAdmin && <StudentStaffTopbar />}

                {/* Main Content Area */}
                <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8 max-w-[1600px]">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>

            <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
        </div>
    );
}
