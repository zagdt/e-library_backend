"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { NavItem, getNavigation } from "./navigation-config";
import { useRole } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";

export function StudentStaffTopbar() {
    const pathname = usePathname();
    const { user } = useAuthStore();

    if (!user) return null;

    const navigation = getNavigation(user.role);

    // Flatten navigation for topbar
    const flatNavigation = navigation.reduce<NavItem[]>((acc, section) => {
        return [...acc, ...section.items];
    }, []);

    const isActiveLink = (href: string) => {
        if (!pathname) return false;
        if (href === "/dashboard") {
            return pathname === href;
        }
        return pathname === href || pathname.startsWith(href + "/");
    };

    return (
        <div className="border-b bg-card/50 backdrop-blur-sm sticky top-16 z-20">
            <div className="container mx-auto px-4">
                <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
                    {flatNavigation.map((item) => {
                        const isActive = isActiveLink(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200",
                                    isActive
                                        ? "text-primary bg-primary/10"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                )}
                            >
                                <item.icon className="h-4 w-4 shrink-0" />
                                <span>{item.name}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="topbarActive"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                {item.badge && (
                                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-primary/10 text-primary">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
