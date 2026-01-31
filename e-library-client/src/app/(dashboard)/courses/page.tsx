"use client";

import { useState } from "react";
import { useCourses, useCreateCourse } from "@/hooks/useCourses";
import { useRole } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, Loader2, Search, ChevronLeft, ChevronRight, BookOpen, ArrowRight, Clock, ShieldAlert, GitBranchPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCourseSchema, type CreateCourseFormData } from "@/schemas/courses";
import { formatDistanceToNow } from "date-fns";

export default function CoursesPage() {
    const { isStaffOrAdmin } = useRole();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const { data, isLoading } = useCourses({ page, limit: 12, search: search || undefined });
    const { mutate: createCourse, isPending } = useCreateCourse();
    const [dialogOpen, setDialogOpen] = useState(false);

    const courses = data?.data || [];
    const pagination = data?.pagination;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateCourseFormData>({
        resolver: zodResolver(createCourseSchema),
    });

    const onSubmit = (data: CreateCourseFormData) => {
        createCourse(data, {
            onSuccess: () => {
                setDialogOpen(false);
                reset();
            },
        });
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 rounded-3xl">
                <div className="space-y-2">
                    <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                        Explore Courses
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        Discover a wide range of courses and access their comprehensive resources to enhance your learning journey.
                    </p>
                </div>
                {isStaffOrAdmin && (
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg" className="shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl">
                                <GitBranchPlus className="mr-1 h-4 w-4" />
                                Create Course
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Create New Course</DialogTitle>
                                <DialogDescription>
                                    Add a new course to organize resources
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="code">Course Code</Label>
                                        <Input
                                            id="code"
                                            placeholder="CS101"
                                            {...register("code")}
                                            className={errors.code ? "border-destructive" : ""}
                                        />
                                        {errors.code && (
                                            <p className="text-sm text-destructive">{errors.code.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="department">Department</Label>
                                        <Input
                                            id="department"
                                            placeholder="Computer Science"
                                            {...register("department")}
                                            className={errors.department ? "border-destructive" : ""}
                                        />
                                        {errors.department && (
                                            <p className="text-sm text-destructive">{errors.department.message}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Course Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Introduction to Programming"
                                        {...register("name")}
                                        className={errors.name ? "border-destructive" : ""}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Course description..."
                                        rows={3}
                                        {...register("description")}
                                        className={errors.description ? "border-destructive" : ""}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-destructive">{errors.description.message}</p>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isPending}>
                                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create Course
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Search Section */}
            <div className="flex justify-center">
                <div className="relative w-full max-w-2xl">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input
                        placeholder="Search for courses by name, code, or department..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="pl-11 py-6 text-lg rounded-2xl shadow-sm border-muted-foreground/20 focus-visible:ring-primary/20 transition-all"
                    />
                </div>
            </div>

            {/* Content Section */}
            {isLoading ? (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm">
                            <Skeleton className="h-8 w-8 rounded-md mb-4" />
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2 mb-4" />
                            <Skeleton className="h-20 w-full rounded-lg" />
                        </div>
                    ))}
                </div>
            ) : courses.length > 0 ? (
                <>
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link href={`/courses/${course.id}`}>
                                    <div className="group relative flex flex-col h-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-lg cursor-pointer">
                                        {/* Top Accent Line */}
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />

                                        <div className="p-6 flex-1">
                                            {/* Header: Icon + Code */}
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="rounded-lg bg-muted p-2.5 transition-colors group-hover:bg-primary/10">
                                                    <BookOpen className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </div>
                                                <span className="text-xs font-mono text-muted-foreground/70 bg-muted/50 px-2 py-1 rounded-md">
                                                    {course.code}
                                                </span>
                                            </div>

                                            {/* Title & Department */}
                                            <div className="space-y-1 mb-4">
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                    {course.resourceCount} Resources
                                                </p>
                                                <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
                                                    {course.name}
                                                </h3>
                                            </div>

                                            {/* Dashed Badge (Department) */}
                                            <div className="inline-flex items-center rounded-md border border-dashed border-muted-foreground/30 bg-muted/10 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                                <ShieldAlert className="mr-1.5 h-3 w-3" />
                                                {course.department}
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="border-t bg-muted/5 px-6 py-3.5 text-xs text-muted-foreground transition-colors group-hover:bg-muted/20">
                                            <div className="flex items-center justify-between">
                                                <span className="group-hover:hidden flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    Updated {formatDistanceToNow(new Date(course.updatedAt), { addSuffix: true })}
                                                </span>
                                                <span className="hidden group-hover:flex items-center justify-end w-full gap-1.5 text-primary font-semibold animate-in fade-in slide-in-from-left-2 duration-300">
                                                    Go to this course
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
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
                        <GraduationCap className="h-16 w-16 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">No courses found</h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                        {search
                            ? `We couldn't find any courses matching "${search}". Try adjusting your search terms.`
                            : "There are no courses available at the moment. Check back later or create a new one."}
                    </p>
                    {search && (
                        <Button variant="outline" onClick={() => setSearch("")}>
                            Clear Search
                        </Button>
                    )}
                </motion.div>
            )}
        </div>
    );
}
