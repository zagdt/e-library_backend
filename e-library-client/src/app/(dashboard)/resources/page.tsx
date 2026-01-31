"use client";

import { useState } from "react";
import { useResources } from "@/hooks/useResources";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    FileText,
    Search,
    Filter,
    Download,
    ChevronLeft,
    ChevronRight,
    CloudUpload,
    Layers,
    GraduationCap,
    Building2,
} from "lucide-react";
import { useRole } from "@/hooks/useAuth";
import { resourceTypeOptions, categoryOptions } from "@/schemas/resources";
import type { ResourceType } from "@/types/api";

export default function ResourcesPage() {
    const { isStaffOrAdmin } = useRole();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [type, setType] = useState<ResourceType | "">("");
    const [category, setCategory] = useState("");

    const { data, isLoading } = useResources({
        page,
        limit: 12,
        search: search || undefined,
        type: type || undefined,
        category: category || undefined,
    });

    const resources = data?.data || [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-8 pb-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 rounded-3xl">
                <div className="space-y-2">
                    <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                        Resource Library
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        Access a vast collection of educational resources, including books, journals, papers, and more.
                    </p>
                </div>
                {isStaffOrAdmin && (
                    <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all duration-300">
                        <Link href="/resources/upload">
                            <CloudUpload className="mr-2 h-5 w-5" />
                            Upload Resource
                        </Link>
                    </Button>
                )}
            </div>

            {/* Filters Section */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search resources by title, author, or description..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="pl-12 h-12 text-lg rounded-2xl shadow-sm border-muted-foreground/20 focus-visible:ring-primary/20 transition-all"
                    />
                </div>
                <div className="flex gap-4">
                    <Select
                        value={type || "all-types"}
                        onValueChange={(value) => {
                            setType(value === "all-types" ? "" : (value as ResourceType));
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-48 h-12 rounded-2xl border-muted-foreground/20 shadow-sm">
                            <div className="flex items-center gap-2">
                                <Layers className="h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="All Types" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all-types">All Types</SelectItem>
                            {resourceTypeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={category || "all-categories"}
                        onValueChange={(value) => {
                            setCategory(value === "all-categories" ? "" : value);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-52 h-12 rounded-2xl border-muted-foreground/20 shadow-sm">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="All Categories" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all-categories">All Categories</SelectItem>
                            {categoryOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Resources Grid */}
            {isLoading ? (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    {[...Array(9)].map((_, i) => (
                        <div key={i} className="flex h-32 overflow-hidden rounded-xl border bg-card shadow-sm">
                            <Skeleton className="w-32 h-full" />
                            <div className="flex-1 p-4 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : resources.length > 0 ? (
                <>
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                        {resources.map((resource, index) => (
                            <motion.div
                                key={resource.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link href={`/resources/${resource.id}`}>
                                    <div className="group flex h-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-lg cursor-pointer hover:border-primary/20">
                                        {/* Left Image Section */}
                                        <div className="relative w-24 sm:w-32 shrink-0 bg-muted">
                                            {resource.coverImageUrl ? (
                                                <img
                                                    src={resource.coverImageUrl}
                                                    alt={resource.title}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary/40">
                                                    <FileText className="h-10 w-10" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Content Section */}
                                        <div className="flex flex-1 flex-col justify-between p-4">
                                            <div className="space-y-1">
                                                {/* Institution / Department */}
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10">
                                                        <Building2 className="h-3 w-3 text-primary" />
                                                    </div>
                                                    <span className="text-xs font-medium text-muted-foreground line-clamp-1">
                                                        {resource.department}
                                                    </span>
                                                </div>

                                                {/* Title */}
                                                <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                    {resource.title}
                                                </h3>
                                            </div>

                                            {/* Bottom Info */}
                                            <div className="mt-3 space-y-1">
                                                <div className="flex items-center gap-1.5 text-primary">
                                                    <GraduationCap className="h-3.5 w-3.5" />
                                                    <span className="text-xs font-semibold">
                                                        {resource.category}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {resource.accessType === "DOWNLOADABLE" ? "Downloadable Resource" : "View Only Resource"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-8">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={!pagination.hasPrev}
                                className="rounded-full px-6"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>
                            <span className="text-sm font-medium text-muted-foreground">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={!pagination.hasNext}
                                className="rounded-full px-6"
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                >
                    <div className="bg-muted/30 p-6 rounded-full mb-4">
                        <FileText className="h-16 w-16 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">No resources found</h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                        {search || type || category
                            ? "Try adjusting your filters to find what you're looking for."
                            : "There are no resources available at the moment."}
                    </p>
                    {(search || type || category) && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearch("");
                                setType("");
                                setCategory("");
                                setPage(1);
                            }}
                        >
                            Clear Filters
                        </Button>
                    )}
                </motion.div>
            )}
        </div>
    );
}
