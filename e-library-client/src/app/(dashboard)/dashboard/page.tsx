"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchModal } from "@/components/modals/SearchModal";
import { useRole } from "@/hooks/useAuth";
import { useLatestResources, useTrendingResources } from "@/hooks/useResources";
import { useMyRequests } from "@/hooks/useRequests";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    FileText,
    TrendingUp,
    Clock,
    ArrowRight,
    Search,
    Globe,
    ClipboardList,
    Database,
    Users,
    Download,
    Sparkles,
    ChevronRight,
    Library,
    Award,
    BookOpen,
} from "lucide-react";
import LatestDissertationsSection from "@/components/LatestDissertationsSection";

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAdmin } = useRole();
    const [searchModalOpen, setSearchModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const { data: latestResources, isLoading: loadingLatest } = useLatestResources();
    const { data: trendingResources, isLoading: loadingTrending } = useTrendingResources();
    const { data: myRequests, isLoading: loadingRequests } = useMyRequests();

    useEffect(() => {
        if (isAdmin) {
            router.replace("/dashboard/admin");
        }
    }, [isAdmin, router]);

    const academicSources = [
        { name: "OpenAlex", icon: Globe, color: "bg-blue-500", count: "2.3M+" },
        { name: "CORE", icon: Database, color: "bg-purple-500", count: "1.8M+" },
        { name: "DOAJ", icon: FileText, color: "bg-green-500", count: "580K+" },
        { name: "ERIC", icon: BookOpen, color: "bg-orange-500", count: "460K+" },
        { name: "DOAB", icon: Library, color: "bg-red-500", count: "120K+" },
    ];

    const handleQuickSearch = (query: string) => {
        setSearchQuery(query);
        setSearchModalOpen(true);
    };

    return (
        <>
            {/* Hero Section - Enhanced */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background mb-8">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItMnptMC0ydjItMnptLTItMmgyLTJ6bTAtMmgyLTJ6bTItMmgyLTJ6bTAtMmgyLTJ6bS0yLTJoMi0yem0wLTJoMi0yem0yLTJoMi0yem0wLTJoMi0yem0tMi0yaDItMnptMC0yaDItMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
                <div className="relative px-6 py-8 md:px-8 md:py-12 lg:px-12 lg:py-16">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="flex items-center gap-2 mb-4 flex-wrap justify-center"
                        >
                            <Badge className="gap-1 px-2 py-0.5 bg-gray-500 hover:bg-white/30 border-white/30 backdrop-blur-sm text-[9px]">
                                <Sparkles className="h-3 w-3" />
                                Enhanced AI Discovery
                            </Badge>
                            <Badge className="gap-1 px-2 py-0.5 bg-gray-500 hover:bg-white/30 border-white/30 backdrop-blur-sm text-[9px]">
                                <Globe className="h-3 w-3" />
                                5+ Million Resources
                            </Badge>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
                        >
                            Welcome back, {user?.name}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-base md:text-lg mb-8 max-w-2xl"
                        >
                            Access millions of free academic resources from open access repositories worldwide.
                            Search, discover, and learn with our integrated academic discovery platform.
                        </motion.p>

                        {/* Enhanced Search Bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="max-w-3xl"
                        >
                            <Card className="border-0 overflow-hidden rounded-full bg-white dark:bg-slate-800">
                                <CardContent className="p-0">
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <Search className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <Input
                                            placeholder="Search resources, courses, or discover academic papers worldwide..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && searchQuery.trim().length >= 2) {
                                                    setSearchModalOpen(true);
                                                }
                                            }}
                                            onClick={() => setSearchModalOpen(true)}
                                            className="pl-14 pr-32 h-14 md:h-16 text-sm md:text-base border-0 shadow-none focus-visible:ring-0 rounded-2xl"
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                            <Button
                                                onClick={() => {
                                                    if (searchQuery.trim().length >= 2) {
                                                        setSearchModalOpen(true);
                                                    }
                                                }}
                                                disabled={searchQuery.trim().length < 2}
                                                className="h-12 md:h-14 px-4 md:px-6 rounded-full"
                                            >
                                                <Search className="h-5 w-5 mr-1 md:mr-2" />
                                                Search
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Search Tags */}
                            <div className="flex flex-wrap gap-2 mt-4 justify-center">
                                <span className="text-sm">Try:</span>
                                {["Machine Learning", "Climate Change", "African History", "Renewable Energy", "Public Health"].map((tag) => (
                                    <Badge
                                        key={tag}
                                        className="cursor-pointer hover:bg-black/50 border-white/20 backdrop-blur-sm transition-colors text-xs bg-primary/90"
                                        onClick={() => handleQuickSearch(tag)}
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column - Academic Sources */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Academic Sources */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                                    <Globe className="h-6 w-6 text-primary" />
                                    Academic Sources
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">Integrated open access repositories</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSearchModalOpen(true)}
                                className="rounded-xl"
                            >
                                <Search className="mr-2 h-4 w-4" />
                                Search All
                            </Button>
                        </div>

                        <Card className="rounded-2xl">
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {academicSources.map((source, index) => (
                                        <motion.div
                                            key={source.name}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex flex-col items-center p-4 rounded-2xl bg-gradient-to-b from-background to-accent/50 hover:to-accent transition-all duration-300 cursor-pointer group"
                                            onClick={() => setSearchModalOpen(true)}
                                        >
                                            <div className={`p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform`}>
                                                <source.icon className="h-6 w-6" />
                                            </div>
                                            <h4 className="font-semibold text-sm text-center mb-1">{source.name}</h4>
                                            <p className="text-xs text-muted-foreground text-center">{source.count} resources</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <LatestDissertationsSection />
                </div>

                {/* Right Column - Trending & Requests */}
                <div className="space-y-8">
                    {/* Trending Resources */}
                    <Card className="rounded-2xl">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-orange-500/10 rounded-xl">
                                        <TrendingUp className="h-6 w-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Trending</CardTitle>
                                        <CardDescription>Most popular this week</CardDescription>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" asChild className="h-8 rounded-xl">
                                    <Link href="/resources">
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loadingTrending ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <Skeleton className="h-10 w-10 rounded-xl" />
                                            <div className="flex-1">
                                                <Skeleton className="h-4 w-3/4 mb-2" />
                                                <Skeleton className="h-3 w-1/2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : trendingResources && trendingResources.length > 0 ? (
                                <div className="space-y-3">
                                    {trendingResources.slice(0, 4).map((resource, index) => (
                                        <Link
                                            key={resource.id}
                                            href={`/resources/${resource.id}`}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-all group"
                                        >
                                            <div className="relative flex-shrink-0">
                                                <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                                                    <FileText className="h-4 w-4 text-primary" />
                                                </div>
                                                {index < 3 && (
                                                    <div className="absolute -top-1 -right-1">
                                                        <Award className="h-4 w-4 text-yellow-500" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                                    {resource.title}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>{resource.category}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Download className="h-3 w-3" />
                                                        {resource.downloadCount}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-sm text-muted-foreground">No trending resources yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Requests */}
                    <Card className="rounded-2xl">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-purple-500/10 rounded-xl">
                                        <ClipboardList className="h-6 w-6 text-purple-500" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Recent Requests</CardTitle>
                                        <CardDescription>Track your requests</CardDescription>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" asChild className="rounded-xl">
                                    <Link href="/requests">
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loadingRequests ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <Skeleton className="h-10 w-10 rounded-xl" />
                                            <div className="flex-1">
                                                <Skeleton className="h-4 w-3/4 mb-2" />
                                                <Skeleton className="h-3 w-1/2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : myRequests && myRequests.length > 0 ? (
                                <div className="space-y-3">
                                    {myRequests.slice(0, 4).map((request) => (
                                        <div
                                            key={request.id}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-all group"
                                        >
                                            <div className={`p-2 rounded-xl ${request.status === "RESOLVED" ? "bg-green-500/10" :
                                                    request.status === "REJECTED" ? "bg-red-500/10" :
                                                        request.status === "IN_PROGRESS" ? "bg-yellow-500/10" :
                                                            "bg-gray-500/10"
                                                }`}>
                                                <ClipboardList className={`h-4 w-4 ${request.status === "RESOLVED" ? "text-green-500" :
                                                        request.status === "REJECTED" ? "text-red-500" :
                                                            request.status === "IN_PROGRESS" ? "text-yellow-500" :
                                                                "text-gray-500"
                                                    }`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{request.title}</p>
                                                <p className="text-xs text-muted-foreground">{request.category}</p>
                                            </div>
                                            <Badge
                                                variant={
                                                    request.status === "RESOLVED" ? "success" :
                                                        request.status === "REJECTED" ? "destructive" :
                                                            request.status === "IN_PROGRESS" ? "warning" :
                                                                "secondary"
                                                }
                                                className="text-xs"
                                            >
                                                {request.status.replace("_", " ")}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-muted-foreground mb-4 text-sm">
                                        You haven&apos;t made any requests yet
                                    </p>
                                    <Button asChild size="sm" className="rounded-xl">
                                        <Link href="/requests/new">Create Request</Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Search Modal */}
            <SearchModal open={searchModalOpen} onOpenChange={setSearchModalOpen} />
        </>
    );
}
