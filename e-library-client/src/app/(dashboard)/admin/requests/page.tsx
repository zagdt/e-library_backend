"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/useAuth";
import { useRequests, useUpdateRequest, useRespondToRequest } from "@/hooks/useRequests";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { ClipboardList, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { getInitials, formatDate } from "@/lib/utils";
import { statusOptions } from "@/schemas/requests";
import type { ResourceRequest, RequestStatus } from "@/types/api";

export default function AdminRequestsPage() {
    const router = useRouter();
    const { isStaffOrAdmin } = useRole();
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("__ALL_STATUSES__");
    const [selectedRequest, setSelectedRequest] = useState<ResourceRequest | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState<RequestStatus>("PENDING");
    const [adminReply, setAdminNotes] = useState("");
    const [accessInstructions, setAccessInstructions] = useState("");
    const [externalSourceUrl, setExternalSourceUrl] = useState("");
    const [fulfilledResourceId, setFulfilledResourceId] = useState("");

    const { data, isLoading } = useRequests({
        page,
        limit: 20,
        status: statusFilter === "__ALL_STATUSES__" ? undefined : statusFilter,
    });
    const { mutate: updateRequest, isPending: isUpdatePending } = useUpdateRequest(selectedRequest?.id || "");
    const { mutate: respondToRequest, isPending: isRespondPending } = useRespondToRequest(selectedRequest?.id || "");

    const isPending = isUpdatePending || isRespondPending;

    const requests = data?.data || [];
    const pagination = data?.pagination;

    useEffect(() => {
        if (!isStaffOrAdmin) {
            router.replace("/dashboard");
        }
    }, [isStaffOrAdmin, router]);

    if (!isStaffOrAdmin) {
        return null;
    }

    const handleUpdateRequest = () => {
        if (selectedRequest) {
            if (newStatus === "RESOLVED") {
                respondToRequest(
                    {
                        status: newStatus,
                        adminReply,
                        accessInstructions,
                        externalSourceUrl,
                        fulfilledResourceId: fulfilledResourceId || undefined,
                    },
                    {
                        onSuccess: () => {
                            setDialogOpen(false);
                            setSelectedRequest(null);
                        },
                    }
                );
            } else {
                updateRequest(
                    { status: newStatus, adminReply },
                    {
                        onSuccess: () => {
                            setDialogOpen(false);
                            setSelectedRequest(null);
                        },
                    }
                );
            }
        }
    };

    const openUpdateDialog = (request: ResourceRequest) => {
        setSelectedRequest(request);
        setNewStatus(request.status);
        setAdminNotes(request.adminReply || "");
        setAccessInstructions(request.accessInstructions || "");
        setExternalSourceUrl(request.externalSourceUrl || "");
        setFulfilledResourceId(request.fulfilledResourceId || "");
        setDialogOpen(true);
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "RESOLVED":
                return "success";
            case "REJECTED":
                return "destructive";
            case "IN_PROGRESS":
                return "warning";
            default:
                return "secondary";
        }
    };

    const getPriorityVariant = (priority: string) => {
        switch (priority) {
            case "URGENT":
                return "destructive";
            case "HIGH":
                return "warning";
            default:
                return "outline";
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">All Requests</h2>
                <p className="text-muted-foreground">
                    Manage and respond to resource requests
                </p>
            </div>
            <Card>
                <CardContent className="p-4">
                    <Select
                        value={statusFilter}
                        onValueChange={(value) => {
                            setStatusFilter(value);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__ALL_STATUSES__">All Statuses</SelectItem>
                            {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1">
                                        <Skeleton className="h-5 w-3/4 mb-2" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : requests.length > 0 ? (
                <>
                    <div className="space-y-4">
                        {requests.map((request, index) => (
                            <motion.div
                                key={request.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                            >
                                <Card className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col lg:flex-row gap-4">
                                            <div className="flex items-start gap-4 flex-1">
                                                <Avatar>
                                                    <AvatarImage src={request.user?.avatar} />
                                                    <AvatarFallback>
                                                        {getInitials(
                                                            `${request.user?.firstName} ${request.user?.lastName}`
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <h3 className="font-semibold">{request.title}</h3>
                                                        <Badge variant={getStatusVariant(request.status)}>
                                                            {request.status.replace("_", " ")}
                                                        </Badge>
                                                        <Badge variant={getPriorityVariant(request.priority)}>
                                                            {request.priority}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                                        {request.reason}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                                        <span>
                                                            By: {request.user?.firstName} {request.user?.lastName}
                                                        </span>
                                                        <span>{request.category}</span>
                                                        <span>{formatDate(request.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <Button onClick={() => openUpdateDialog(request)}>
                                                    Update Status
                                                </Button>
                                            </div>
                                        </div>
                                        {request.adminReply && (
                                            <div className="mt-4 p-3 bg-muted rounded-lg">
                                                <p className="text-sm font-medium mb-1">Admin Notes:</p>
                                                <p className="text-sm text-muted-foreground">{request.adminReply}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
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
                        <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No requests</h3>
                        <p className="text-muted-foreground text-center max-w-sm">
                            {statusFilter
                                ? "No requests found with this status."
                                : "There are no requests to review."}
                        </p>
                    </CardContent>
                </Card>
            )}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Update Request</DialogTitle>
                        <DialogDescription>
                            Change the status and add notes for this request
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={newStatus} onValueChange={(v) => setNewStatus(v as RequestStatus)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {newStatus === "RESOLVED" && (
                            <>
                                <div className="space-y-2">
                                    <Label>Access Instructions</Label>
                                    <Textarea
                                        placeholder="Provide instructions on how to access this resource..."
                                        value={accessInstructions}
                                        onChange={(e) => setAccessInstructions(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>External Source URL (Optional)</Label>
                                    <Input
                                        placeholder="https://..."
                                        value={externalSourceUrl}
                                        onChange={(e) => setExternalSourceUrl(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fulfilled Resource ID (Optional)</Label>
                                    <Input
                                        placeholder="UUID of the resource in the system"
                                        value={fulfilledResourceId}
                                        onChange={(e) => setFulfilledResourceId(e.target.value)}
                                    />
                                </div>
                            </>
                        )}
                        <div className="space-y-2">
                            <Label>Admin Notes</Label>
                            <Textarea
                                placeholder="Add notes for this request..."
                                value={adminReply}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateRequest} disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
