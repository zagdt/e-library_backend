import {
    BarChart3,
    ClipboardList,
    FileText,
    FolderOpen,
    GraduationCap,
    Home,
    LayoutDashboard,
    ScrollText,
    Settings,
    Users,
} from "lucide-react";
import React from "react";

export interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
    match?: (pathname: string) => boolean;
}

export interface NavSection {
    title?: string;
    items: NavItem[];
}

export const studentNavigation: NavSection[] = [
    {
        items: [
            { name: "Dashboard", href: "/dashboard", icon: Home },
        ],
    },
    {
        title: "Learning",
        items: [
            { name: "Courses", href: "/courses", icon: GraduationCap },
            { name: "Resources", href: "/resources", icon: FileText },
        ],
    },
    {
        title: "Personal",
        items: [
            { name: "My Requests", href: "/requests", icon: ClipboardList },
        ],
    },
];

export const staffNavigation: NavSection[] = [
    {
        items: [
            { name: "Dashboard", href: "/dashboard", icon: Home },
        ],
    },
    {
        title: "Learning",
        items: [
            { name: "Courses", href: "/courses", icon: GraduationCap },
            { name: "Resources", href: "/resources", icon: FileText },
        ],
    },
    {
        title: "Staff Tools",
        items: [
            { name: "My Requests", href: "/requests", icon: ClipboardList },
        ],
    },
];

export const adminNavigation: NavSection[] = [
    {
        items: [
            { name: "Admin Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
        ],
    },
    {
        title: "Content Management",
        items: [
            { name: "Resources", href: "/resources", icon: FileText },
            { name: "Courses", href: "/courses", icon: GraduationCap },
        ],
    },
    {
        title: "User Management",
        items: [
            { name: "Users", href: "/admin/users", icon: Users },
            { name: "All Requests", href: "/admin/requests", icon: FolderOpen },
        ],
    },
    {
        title: "System",
        items: [
            { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
            { name: "Settings", href: "/admin/settings", icon: Settings },
            { name: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
        ],
    },
];

export function getNavigation(role: string): NavSection[] {
    if (role === "ADMIN") return adminNavigation;
    if (role === "STAFF") return staffNavigation;
    return studentNavigation;
}
