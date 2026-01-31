"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/useAuth";
import { useAuditLogs } from "@/hooks/useAdmin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { ScrollText, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { getInitials, formatDateTime } from "@/lib/utils";

export default function AuditLogsPage() {
    const router = useRouter();
    const { isAdmin } = useRole();
    const [page, setPage] = useState(1);
    const [action, setAction] = useState("all");

    const { data, isLoading } = useAuditLogs({
        page,
        limit: 20,
        action: action === "all" ? undefined : action,
    });

    const logs = data?.data || [];
    const pagination = data?.pagination;

    useEffect(() => {
        if (!isAdmin) {
            router.replace("/dashboard");
        }
    }, [isAdmin, router]);

    if (!isAdmin) {
        return null;
    }

    const getActionBadgeVariant = (action: string) => {
        if (action.includes("DELETE")) return "destructive";
        if (action.includes("CREATE")) return "success";
        if (action.includes("UPDATE")) return "default";
        return "secondary";
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
                <p className="text-muted-foreground">
                    Track all actions and changes on the platform
                </p>
            </div>
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Select
                            value={action}
                            onValueChange={(value) => {
                                setAction(value);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="All Actions" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Actions</SelectItem>
                                <SelectItem value="CREATE">Create</SelectItem>
                                <SelectItem value="UPDATE">Update</SelectItem>
                                <SelectItem value="DELETE">Delete</SelectItem>
                                <SelectItem value="LOGIN">Login</SelectItem>
                                <SelectItem value="LOGOUT">Logout</SelectItem>
                                <SelectItem value="DOWNLOAD">Download</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
            {isLoading ? (
                <Card>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="flex items-start gap-4 p-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1">
                                        <Skeleton className="h-5 w-3/4 mb-2" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : logs.length > 0 ? (
                <>
                    <Card>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {logs.map((log, index) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="flex items-start gap-4 p-4 hover:bg-accent/50 transition-colors"
                                    >
                                        <Avatar className="mt-1">
                                            <AvatarImage src={log.user?.avatar} />
                                            <AvatarFallback>
                                                {log.user
                                                    ? getInitials(`${log.user.firstName} ${log.user.lastName}`)
                                                    : "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className="font-medium">
                                                    {log.user
                                                        ? `${log.user.firstName} ${log.user.lastName}`
                                                        : "Unknown User"}
                                                </span>
                                                <Badge variant={getActionBadgeVariant(log.action)}>
                                                    {log.action.replace("_", " ")}
                                                </Badge>
                                                <Badge variant="outline">{log.entityType}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-1">
                                                Entity ID: {log.entityId}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {formatDateTime(log.createdAt)}
                                                {log.ipAddress && (
                                                    <>
                                                        <span>|</span>
                                                        <span>IP: {log.ipAddress}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={!pagination.hasPrev}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground px-4">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={!pagination.hasNext}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <ScrollText className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No audit logs</h3>
                        <p className="text-muted-foreground text-center max-w-sm">
                            {action !== "all" ? "No logs found for this action type." : "No activity has been recorded yet."}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
