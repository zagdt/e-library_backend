"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/useAuth";
import { useAdminMetrics } from "@/hooks/useAdmin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Users,
    FileText,
    Download,
    ClipboardList,
    TrendingUp,
    ArrowRight,
    UserPlus,
    Clock,
} from "lucide-react";

export default function AdminDashboardPage() {
    const router = useRouter();
    const { isAdmin } = useRole();
    const { data: metrics, isLoading } = useAdminMetrics();

    useEffect(() => {
        if (!isAdmin) {
            router.replace("/dashboard");
        }
    }, [isAdmin, router]);

    if (!isAdmin) {
        return null;
    }

    const stats = [
        {
            name: "Total Users",
            value: metrics?.totalUsers || 0,
            icon: Users,
            color: "bg-blue-500",
            href: "/admin/users",
        },
        {
            name: "Total Resources",
            value: metrics?.totalResources || 0,
            icon: FileText,
            color: "bg-green-500",
            href: "/resources",
        },
        {
            name: "Total Downloads",
            value: metrics?.totalDownloads || 0,
            icon: Download,
            color: "bg-purple-500",
            href: "/admin/metrics",
        },
        {
            name: "Pending Requests",
            value: metrics?.pendingRequests || 0,
            icon: ClipboardList,
            color: "bg-orange-500",
            href: "/admin/requests",
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">
                    Admin Dashboard
                </h2>
                <p className="text-muted-foreground mt-1">
                    Overview of your platform&apos;s performance and metrics.
                </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link href={stat.href}>
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                {stat.name}
                                            </p>
                                            {isLoading ? (
                                                <Skeleton className="h-8 w-16 mt-1" />
                                            ) : (
                                                <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                                            )}
                                        </div>
                                        <div className={`p-3 rounded-lg ${stat.color}`}>
                                            <stat.icon className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5 text-primary" />
                                New Users This Month
                            </CardTitle>
                            <CardDescription>User growth metrics</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/users">
                                View all
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-20 w-full" />
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-4xl font-bold text-primary">
                                    {metrics?.newUsersThisMonth || 0}
                                </p>
                                <p className="text-muted-foreground mt-1">new users</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Resources by Type
                            </CardTitle>
                            <CardDescription>Distribution of resources</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-20 w-full" />
                        ) : metrics?.resourcesByType ? (
                            <div className="grid grid-cols-3 gap-4">
                                {Object.entries(metrics.resourcesByType).map(([type, count]) => (
                                    <div key={type} className="text-center p-2 rounded-lg bg-muted">
                                        <p className="text-lg font-bold">{count}</p>
                                        <p className="text-xs text-muted-foreground">{type}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-4">
                                No data available
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Recent Activity
                        </CardTitle>
                        <CardDescription>Latest actions on the platform</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/admin/audit-logs">
                            View all
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1">
                                        <Skeleton className="h-4 w-3/4 mb-2" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : metrics?.recentActivity && metrics.recentActivity.length > 0 ? (
                        <div className="space-y-3">
                            {metrics.recentActivity.slice(0, 5).map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                                >
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <Clock className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm">
                                            <span className="font-medium">
                                                {activity.user?.firstName} {activity.user?.lastName}
                                            </span>{" "}
                                            {activity.action.toLowerCase().replace("_", " ")}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(activity.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">
                            No recent activity
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
