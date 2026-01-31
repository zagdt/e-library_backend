"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/useAuth";
import {
    useAnalyticsOverview,
    useDownloadTrends,
    useUserTrends,
    useTopResources,
    useTopSearchTerms,
    useUsersByRole,
    useResourcesByCategory,
    useRequestStats
} from "@/hooks/useAnalytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from "recharts";
import {
    Users,
    FileText,
    Download,
    Activity,
    Calendar,
    PieChart as PieChartIcon,
    TrendingUp,
    Search
} from "lucide-react";
import { format, subDays, endOfDay } from "date-fns";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AnalyticsPage() {
    const router = useRouter();
    const { isAdmin } = useRole();
    const [dateRange, setDateRange] = useState("30"); // days
    const [activeTab, setActiveTab] = useState("trends");

    // Compute date range with optimization to prevent unnecessary query key changes
    const dateParams = useMemo(() => {
        const now = new Date();
        const endDate = endOfDay(now);
        const startDate = subDays(endDate, parseInt(dateRange));
        return {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        };
    }, [dateRange]);

    // Always fetch overview and request stats as they are in the header/top cards
    const { data: overview, isLoading: isOverviewLoading } = useAnalyticsOverview();
    const { data: requestStats, isLoading: isRequestStatsLoading } = useRequestStats();

    // Conditional fetches based on active tab
    const { data: downloadTrends, isLoading: isDownloadTrendsLoading } = useDownloadTrends(
        dateParams.startDate,
        dateParams.endDate,
        { enabled: activeTab === "trends" }
    );
    const { data: userTrends, isLoading: isUserTrendsLoading } = useUserTrends(
        dateParams.startDate,
        dateParams.endDate,
        { enabled: activeTab === "trends" }
    );

    const { data: topResources, isLoading: isTopResourcesLoading } = useTopResources(10, { enabled: activeTab === "content" });
    const { data: topSearchTerms, isLoading: isTopSearchTermsLoading } = useTopSearchTerms(10, { enabled: activeTab === "content" });

    const { data: userRoles, isLoading: isUserRolesLoading } = useUsersByRole({ enabled: activeTab === "distribution" });
    const { data: resourceCategories, isLoading: isResourceCategoriesLoading } = useResourcesByCategory({ enabled: activeTab === "distribution" });

    useEffect(() => {
        if (!isAdmin) {
            router.replace("/dashboard");
        }
    }, [isAdmin, router]);

    if (!isAdmin) return null;

    const overviewData = overview?.data;

    // Transform trends for charts
    const downloadChartData = downloadTrends?.data?.map(d => ({
        date: format(new Date(d.date), 'MM/dd'),
        downloads: d.count
    })) || [];

    const userChartData = userTrends?.data?.map(d => ({
        date: format(new Date(d.date), 'MM/dd'),
        users: d.count
    })) || [];

    return (
        <div className="space-y-8 pb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
                    <p className="text-muted-foreground">
                        Deep dive into simplified platform usage metrics and patterns
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 Days</SelectItem>
                            <SelectItem value="30">Last 30 Days</SelectItem>
                            <SelectItem value="90">Last 3 Months</SelectItem>
                            <SelectItem value="365">Last Year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isOverviewLoading ? <Skeleton className="h-8 w-20" /> : (
                            <>
                                <div className="text-2xl font-bold">{(overviewData?.totalUsers || 0).toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">
                                    {(overviewData?.activeUsers || 0).toLocaleString()} active recently
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isOverviewLoading ? <Skeleton className="h-8 w-20" /> : (
                            <div className="text-2xl font-bold">{(overviewData?.totalResources || 0).toLocaleString()}</div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
                        <Download className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isOverviewLoading ? <Skeleton className="h-8 w-20" /> : (
                            <div className="text-2xl font-bold">{(overviewData?.totalDownloads || 0).toLocaleString()}</div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Requests Pending</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isRequestStatsLoading ? <Skeleton className="h-8 w-20" /> : (
                            <>
                                <div className="text-2xl font-bold">{requestStats?.data?.pending || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    {requestStats?.data?.resolved || 0} resolved
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="trends">
                        <TrendingUp className="h-4 w-4 mr-2" /> Trends
                    </TabsTrigger>
                    <TabsTrigger value="distribution">
                        <PieChartIcon className="h-4 w-4 mr-2" /> Distribution
                    </TabsTrigger>
                    <TabsTrigger value="content">
                        <FileText className="h-4 w-4 mr-2" /> Content
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="trends" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Download Activity</CardTitle>
                                <CardDescription>Downloads over time</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <div className="h-[300px]">
                                    {isDownloadTrendsLoading ? <Skeleton className="h-full w-full" /> : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={downloadChartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="downloads" stroke="#8884d8" strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>User Growth</CardTitle>
                                <CardDescription>New user registrations</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <div className="h-[300px]">
                                    {isUserTrendsLoading ? <Skeleton className="h-full w-full" /> : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={userChartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar dataKey="users" fill="#82ca9d" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="distribution" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>User Roles</CardTitle>
                                <CardDescription>Distribution of user roles</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    {isUserRolesLoading ? <Skeleton className="h-full w-full" /> : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={userRoles?.data}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="count"
                                                    nameKey="role"
                                                >
                                                    {userRoles?.data?.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Resource Categories</CardTitle>
                                <CardDescription>Distribution of resources by category</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    {isResourceCategoriesLoading ? <Skeleton className="h-full w-full" /> : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={resourceCategories?.data}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                                                    outerRadius={80}
                                                    fill="#82ca9d"
                                                    dataKey="count"
                                                    nameKey="category"
                                                >
                                                    {resourceCategories?.data?.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Resources</CardTitle>
                                <CardDescription>Most accessed resources</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {isTopResourcesLoading ? (
                                        <Skeleton className="h-40 w-full" />
                                    ) : (
                                        topResources?.data?.map((resource, i) => (
                                            <div key={resource.resourceId} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 max-w-[80%]">
                                                    <div className="font-bold w-6">{i + 1}.</div>
                                                    <div className="truncate" title={resource.title}>{resource.title}</div>
                                                </div>
                                                <div className="font-semibold">{resource.count}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Top Search Terms</CardTitle>
                                <CardDescription>What users are looking for</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {isTopSearchTermsLoading ? (
                                        <Skeleton className="h-40 w-full" />
                                    ) : (
                                        topSearchTerms?.data?.map((term, i) => (
                                            <div key={term.item} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Search className="h-4 w-4 text-muted-foreground" />
                                                    <div>{term.item}</div>
                                                </div>
                                                <div className="font-semibold">{term.count}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
