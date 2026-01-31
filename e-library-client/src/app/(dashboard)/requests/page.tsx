"use client";

import { useState } from "react";
import { useMyRequests, useCreateRequest } from "@/hooks/useRequests";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import {
    ClipboardList,
    Loader2,
    GitPullRequest,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    MessageSquare,
    Calendar,
    User,
    FileText,
    Send,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRequestSchema, priorityEnum, type CreateRequestFormData } from "@/schemas/requests";
import { categoryOptions } from "@/schemas/resources";
import { formatDate } from "@/lib/utils";

export default function RequestsPage() {
    const { data: requestsData, isLoading } = useMyRequests();
    const { mutate: createRequest, isPending } = useCreateRequest();
    const [dialogOpen, setDialogOpen] = useState(false);

    const requests = requestsData || [];

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<CreateRequestFormData>({
        resolver: zodResolver(createRequestSchema),
        defaultValues: {
            priority: "LOW",
        }
    });

    const onSubmit = (data: CreateRequestFormData) => {
        const requestData = {
            title: data.title,
            authors: data.authors || undefined,
            reason: data.reason,
            category: data.category,
            priority: data.priority,
            dueDate: data.dueDate,
        };

        createRequest(requestData, {
            onSuccess: () => {
                setDialogOpen(false);
                reset();
            },
        });
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "RESOLVED":
                return {
                    variant: "default" as const,
                    icon: CheckCircle2,
                    className: "bg-green-500/15 text-green-700 dark:text-green-400 hover:bg-green-500/25 border-green-200 dark:border-green-900",
                    iconColor: "text-green-600 dark:text-green-400",
                };
            case "REJECTED":
                return {
                    variant: "destructive" as const,
                    icon: XCircle,
                    className: "bg-red-500/15 text-red-700 dark:text-red-400 hover:bg-red-500/25 border-red-200 dark:border-red-900",
                    iconColor: "text-red-600 dark:text-red-400",
                };
            case "IN_PROGRESS":
                return {
                    variant: "secondary" as const,
                    icon: Clock,
                    className: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/25 border-yellow-200 dark:border-yellow-900",
                    iconColor: "text-yellow-600 dark:text-yellow-400",
                };
            default:
                return {
                    variant: "outline" as const,
                    icon: AlertCircle,
                    className: "bg-blue-500/15 text-blue-700 dark:text-blue-400 hover:bg-blue-500/25 border-blue-200 dark:border-blue-900",
                    iconColor: "text-blue-600 dark:text-blue-400",
                };
        }
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 rounded-3xl">
                <div className="space-y-2">
                    <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                        My Requests
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        Track the status of your resource requests or submit a new one.
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="lg" className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                            <GitPullRequest className="mr-2 h-5 w-5" />
                            New Request
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl rounded-3xl p-0 overflow-hidden gap-0">
                        <DialogHeader className="p-6 pb-4 bg-muted/30">
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <GitPullRequest className="h-6 w-6 text-primary" />
                                Create New Request
                            </DialogTitle>
                            <DialogDescription className="text-base">
                                Request a resource that you need. Our team will review and fulfill it.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="p-6">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-base font-medium">
                                        Resource Title <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., Introduction to Algorithms, 4th Edition"
                                        {...register("title")}
                                        className={`h-12 rounded-xl text-base ${errors.title ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-destructive flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.title.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="authors" className="text-base font-medium">
                                        Authors <span className="text-muted-foreground font-normal text-sm">(Optional)</span>
                                    </Label>
                                    <Input
                                        id="authors"
                                        placeholder="e.g., Cormen, Leiserson, Rivest, Stein"
                                        {...register("authors")}
                                        className={`h-12 rounded-xl text-base ${errors.authors ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                    />
                                    {errors.authors && (
                                        <p className="text-sm text-destructive flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.authors.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-base font-medium">
                                        Category <span className="text-muted-foreground font-normal text-sm">(Optional)</span>
                                    </Label>
                                    <Select onValueChange={(value) => setValue("category", value as any)}>
                                        <SelectTrigger className="h-12 rounded-xl text-base">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categoryOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="priority" className="text-base font-medium">
                                            Priority
                                        </Label>
                                        <Select
                                            defaultValue="LOW"
                                            onValueChange={(value) => setValue("priority", value as any)}
                                        >
                                            <SelectTrigger className="h-12 rounded-xl text-base">
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {priorityEnum.options.map((priority) => (
                                                    <SelectItem key={priority} value={priority}>
                                                        {priority.charAt(0) + priority.slice(1).toLowerCase()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="dueDate" className="text-base font-medium">
                                            Needed By <span className="text-muted-foreground font-normal text-sm">(Optional)</span>
                                        </Label>
                                        <Input
                                            id="dueDate"
                                            type="date"
                                            {...register("dueDate")}
                                            className="h-12 rounded-xl text-base"
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reason" className="text-base font-medium">
                                        Reason / Description <span className="text-destructive">*</span>
                                    </Label>
                                    <Textarea
                                        id="reason"
                                        placeholder="Describe why you need this resource or provide additional details (ISBN, Edition, etc.)..."
                                        rows={4}
                                        {...register("reason")}
                                        className={`rounded-xl text-base resize-none ${errors.reason ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                    />
                                    {errors.reason && (
                                        <p className="text-sm text-destructive flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.reason.message}
                                        </p>
                                    )}
                                </div>

                                <div className="pt-4 flex gap-3 justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setDialogOpen(false)}
                                        className="rounded-xl h-11 px-6"
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isPending} className="rounded-xl h-11 px-6 shadow-md">
                                        {isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" />
                                                Submit Request
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Requests List */}
            {isLoading ? (
                <div className="grid gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="rounded-3xl border-none shadow-sm overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-6">
                                    <Skeleton className="h-16 w-16 rounded-2xl" />
                                    <div className="flex-1 space-y-4">
                                        <div className="space-y-2">
                                            <Skeleton className="h-6 w-1/3" />
                                            <Skeleton className="h-4 w-1/4" />
                                        </div>
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-2/3" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : requests && requests.length > 0 ? (
                <div className="grid gap-6">
                    {requests.map((request, index) => {
                        const statusConfig = getStatusConfig(request.status);
                        const StatusIcon = statusConfig.icon;

                        return (
                            <motion.div
                                key={request.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="group rounded-3xl border-muted-foreground/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                                    <CardContent className="p-0">
                                        <div className="flex flex-col md:flex-row">
                                            {/* Status Strip/Icon */}
                                            <div className={`p-6 md:w-24 flex items-center justify-center bg-muted/30 border-b md:border-b-0 md:border-r border-border/50`}>
                                                <div className={`p-3 rounded-2xl ${statusConfig.className} bg-opacity-10`}>
                                                    <StatusIcon className={`h-8 w-8 ${statusConfig.iconColor}`} />
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 p-6 md:p-8 space-y-6">
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-3 flex-wrap">
                                                            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                                                {request.title}
                                                            </h3>
                                                            <Badge
                                                                variant="outline"
                                                                className={`${statusConfig.className} border bg-transparent`}
                                                            >
                                                                {request.status.replace("_", " ")}
                                                            </Badge>
                                                            {request.priority && request.priority !== "LOW" && (
                                                                <Badge variant={request.priority === "URGENT" ? "destructive" : "secondary"} className="border">
                                                                    {request.priority}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {request.authors && (
                                                            <p className="text-muted-foreground flex items-center gap-2 text-sm">
                                                                <User className="h-3.5 w-3.5" />
                                                                {request.authors}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full w-fit">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        Requested {formatDate(request.createdAt)}
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="bg-muted/30 p-4 rounded-2xl space-y-2">
                                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                                            <FileText className="h-3.5 w-3.5" />
                                                            Reason
                                                        </p>
                                                        <p className="text-sm text-foreground/90 leading-relaxed">
                                                            {request.reason}
                                                        </p>
                                                    </div>

                                                    {/* Metadata Footer */}
                                                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                                        {request.category && (
                                                            <Badge variant="secondary" className="text-xs font-normal">
                                                                {request.category}
                                                            </Badge>
                                                        )}
                                                        {request.dueDate && (
                                                            <span className="flex items-center gap-1.5 font-medium">
                                                                <Clock className="h-3.5 w-3.5" />
                                                                Needed by {formatDate(request.dueDate)}
                                                            </span>
                                                        )}
                                                        {request.resolvedAt && (
                                                            <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium">
                                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                                Resolved {formatDate(request.resolvedAt)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Admin Response Section */}
                                                    {(request.accessInstructions || request.externalSourceUrl || request.fulfilledResourceId || request.adminReply) && (
                                                        <div className="mt-4 p-5 bg-primary/5 rounded-2xl border border-primary/10 space-y-3">
                                                            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                                                                <MessageSquare className="h-4 w-4" />
                                                                Admin Response
                                                            </div>

                                                            {request.adminReply && (
                                                                <div>
                                                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Message</span>
                                                                    <p className="text-sm text-foreground/90 mt-1">{request.adminReply}</p>
                                                                </div>
                                                            )}

                                                            {request.accessInstructions && (
                                                                <div>
                                                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Access Instructions</span>
                                                                    <p className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap">{request.accessInstructions}</p>
                                                                </div>
                                                            )}

                                                            {request.externalSourceUrl && (
                                                                <div className="pt-2">
                                                                    <Button size="sm" variant="outline" asChild className="gap-2">
                                                                        <a href={request.externalSourceUrl} target="_blank" rel="noopener noreferrer">
                                                                            <FileText className="h-3.5 w-3.5" />
                                                                            Access External Resource
                                                                        </a>
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                >
                    <div className="bg-muted/30 p-8 rounded-full mb-6">
                        <ClipboardList className="h-20 w-20 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">No requests yet</h3>
                    <p className="text-muted-foreground max-w-md mb-8 text-lg">
                        You haven&apos;t made any resource requests yet. Need something specific? Let us know!
                    </p>
                    <Button onClick={() => setDialogOpen(true)} size="lg" className="rounded-xl shadow-lg hover:shadow-xl transition-all px-8 h-12 text-base">
                        <GitPullRequest className="mr-2 h-5 w-5" />
                        Create Your First Request
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
