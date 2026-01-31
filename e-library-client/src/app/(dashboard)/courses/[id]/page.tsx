"use client";


import { useRouter } from "next/navigation";
import { useCourse, useCourseResources } from "@/hooks/useCourses";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    FileText,
    Download,
    Calendar,
    Clock,
    BookOpen,
    ArrowLeft,
    Search,
    Filter,
    GraduationCap
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { format } from "date-fns";

interface CourseDetailPageProps {
    params: { id: string };
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
    // Unwrap params directly (Next.js 14)
    const { id } = params;
    const [search, setSearch] = useState("");

    const { data: course, isLoading: loadingCourse } = useCourse(id);
    const { data: resourcesData, isLoading: loadingResources } = useCourseResources(id, {
        limit: 100,
        search: search || undefined,
    });

    const resources = resourcesData?.data || [];

    if (loadingCourse) {
        return (
            <div className="max-w-5xl mx-auto space-y-8 pb-8">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-48 w-full rounded-3xl" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <div className="grid gap-4">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-24 w-full rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="max-w-5xl mx-auto py-12">
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="bg-muted/30 p-6 rounded-full mb-4">
                            <GraduationCap className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Course not found</h3>
                        <p className="text-muted-foreground mb-6 text-center max-w-md">
                            The course you are looking for does not exist or has been removed.
                        </p>
                        <Button asChild>
                            <Link href="/courses">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Courses
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Back Button */}
            <Button variant="ghost" asChild className="gap-2 pl-0 hover:bg-transparent hover:text-primary transition-colors">
                <Link href="/courses">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Courses
                </Link>
            </Button>

            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 to-primary text-primary-foreground p-8 md:p-12 shadow-xl"
            >
                <div className="absolute top-0 right-0 -mt-16 -mr-16 opacity-10">
                    <BookOpen className="h-96 w-96" />
                </div>

                <div className="relative z-10 space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none px-3 py-1 text-sm backdrop-blur-sm">
                            {course.code}
                        </Badge>
                        <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-none px-3 py-1 text-sm backdrop-blur-sm">
                            {course.department}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-primary-foreground/80 text-sm ml-auto bg-black/10 px-3 py-1 rounded-full backdrop-blur-sm">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Updated {format(new Date(course.updatedAt), 'MMM d, yyyy')}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                            {course.name}
                        </h1>
                        <p className="text-primary-foreground/90 text-lg max-w-3xl leading-relaxed">
                            {course.description}
                        </p>
                    </div>

                    <div className="flex items-center gap-6 pt-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold leading-none">{course.resourceCount}</span>
                                <span className="text-xs text-primary-foreground/70 uppercase tracking-wider font-medium">Resources</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Resources Section */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        Course Resources
                        <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs">
                            {resources.length}
                        </Badge>
                    </h2>

                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search resources..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-background/50 backdrop-blur-sm"
                        />
                    </div>
                </div>

                {loadingResources ? (
                    <div className="grid gap-4">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-24 w-full rounded-xl" />
                        ))}
                    </div>
                ) : resources.length > 0 ? (
                    <div className="grid gap-4">
                        {resources.map((resource, index) => (
                            <motion.div
                                key={resource.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link href={`/resources/${resource.id}`}>
                                    <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group border-muted-foreground/10">
                                        <CardContent className="p-4 sm:p-6 flex items-start gap-4 sm:gap-6">
                                            <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                                                            {resource.title}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                                            {resource.description}
                                                        </p>
                                                    </div>
                                                    <Button size="icon" variant="ghost" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs text-muted-foreground">
                                                    <Badge variant="outline" className="text-xs font-normal bg-muted/50">
                                                        {resource.type || 'Resource'}
                                                    </Badge>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        <span>{format(new Date(resource.createdAt), 'MMM d, yyyy')}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Download className="h-3.5 w-3.5" />
                                                        <span>{resource.downloadCount} downloads</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <Card className="border-dashed bg-muted/10">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="bg-muted/30 p-4 rounded-full mb-4">
                                <Filter className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-lg font-semibold mb-1">No resources found</h3>
                            <p className="text-muted-foreground max-w-sm">
                                {search
                                    ? `No resources match "${search}".`
                                    : "This course doesn't have any resources yet."}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
