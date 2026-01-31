"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { useLogout } from "@/hooks/useAuth";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    ChevronsUpDown,
    LogOut,
    Settings,
    X,
} from "lucide-react";
import { getInitials, cn } from "@/lib/utils";
import { adminNavigation } from "./navigation-config";

export function AdminSidebar() {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const { sidebarOpen, setSidebarOpen } = useUIStore();
    const { mutate: logout } = useLogout();

    if (!user) return null;

    const isActiveLink = (href: string) => {
        if (!pathname) return false;
        if (href === "/dashboard/admin") {
            return pathname === href;
        }
        return pathname === href || pathname.startsWith(href + "/");
    };

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-hidden",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center gap-3 px-6 border-b shrink-0">
                        <div className="p-1">
                            <img src="/vu-logo.png" alt="VU Logo" className="h-10 w-10 object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-sm tracking-tight">
                                ResourceHub
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                {user.role} Portal
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Nav Items */}
                    <ScrollArea className="flex-1 px-3 py-4">
                        <nav className="space-y-6">
                            {adminNavigation.map((section, idx) => (
                                <div key={idx} className="space-y-1">
                                    {section.title && (
                                        <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                            {section.title}
                                        </h4>
                                    )}
                                    <div className="space-y-0.5">
                                        {section.items.map((item) => {
                                            const isActive = isActiveLink(item.href);
                                            return (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    onClick={() => setSidebarOpen(false)}
                                                    className={cn(
                                                        "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                                        isActive
                                                            ? "bg-primary/20 text-primary/90 shadow-sm"
                                                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                                    )}
                                                >
                                                    <item.icon className={cn(
                                                        "h-4 w-4 shrink-0 transition-transform duration-200",
                                                        isActive ? "scale-110" : "group-hover:scale-105"
                                                    )} />
                                                    <span className="truncate">{item.name}</span>
                                                    {item.badge && (
                                                        <span className={cn(
                                                            "ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-md",
                                                            isActive
                                                                ? "bg-primary-foreground/20 text-primary-foreground"
                                                                : "bg-primary/10 text-primary"
                                                        )}>
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </nav>
                    </ScrollArea>

                    {/* User Profile */}
                    <div className="p-1.5 shrink-0">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start h-auto p-2 hover:bg-accent rounded-lg group"
                                >
                                    <div className="flex items-center gap-3 w-full min-w-0">
                                        <Avatar className="h-9 w-9 border-2 border-background">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                                {getInitials(`${user.name}`)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0 text-left">
                                            <p className="text-sm font-semibold truncate">
                                                {user.firstName} {user.lastName}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                        <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
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
                    </div>
                </div>
            </aside>
        </>
    );
}
