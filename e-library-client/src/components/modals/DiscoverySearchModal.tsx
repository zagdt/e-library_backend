"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useDiscoverySearch, useDiscoverySources } from "@/hooks/useDiscovery";
import { useDiscoveryStore } from "@/stores/discoveryStore";
import {
  Search,
  X,
  ExternalLink,
  Download,
  BookOpen,
  User,
  Calendar,
  Filter,
  RefreshCw,
  Check,
  AlertCircle,
  Database,
  Globe,
  FileText,
  ChevronLeft,
  ChevronRight,
  Link,
  FileDown,
  Info,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface DiscoverySearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DiscoverySearchModal({ open, onOpenChange }: DiscoverySearchModalProps) {
  const [activeTab, setActiveTab] = useState<"results" | "sources" | "status">("results");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const {
    selectedSources,
    setQuery,
    setSelectedSources,
    toggleSource,
    setSourceStatus,
    sourceStatus,
  } = useDiscoveryStore();

  const { data: sourcesData, isLoading: sourcesLoading } = useDiscoverySources();

  // Setup debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setQuery(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, setQuery]);

  // Run search when debounced query changes
  const { data: searchData, isLoading: isSearching, error: searchError } = useDiscoverySearch({
    q: debouncedSearch,
    page,
    limit: 10,
    source: selectedSources.length > 0 ? selectedSources : undefined,
  });

  // Update source status based on search results
  useEffect(() => {
    if (searchData?.pagination?.sources) {
      // Simulate source status updates (in real app, this would come from API)
      const statuses = searchData.pagination.sources.reduce((acc, source) => {
        acc[source] = {
          status: "success",
          results: searchData.data.filter(r => r.source === source).length,
          total: Math.floor(Math.random() * 100000), // Mock total for demo
          timestamp: new Date().toISOString(),
        };
        return acc;
      }, {} as Record<string, any>);
      
      Object.entries(statuses).forEach(([source, status]) => {
        setSourceStatus(source, status);
      });
    }
  }, [searchData, setSourceStatus]);

  // Select all sources by default when sources are loaded
  useEffect(() => {
    if (sourcesData?.data && selectedSources.length === 0) {
      const sourceIds = sourcesData.data.map(s => s.id);
      setSelectedSources(sourceIds);
    }
  }, [sourcesData, selectedSources.length, setSelectedSources]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    toast.info("Searching academic repositories...");
  }, []);

  const handleSourceToggle = (sourceId: string) => {
    toggleSource(sourceId);
    setPage(1);
    toast.info(`Toggled ${sourceId.toUpperCase()} source`);
  };

  const handleDownload = (result: any) => {
    if (result.pdfUrl) {
      window.open(result.pdfUrl, "_blank");
      toast.success("Opening PDF...");
    } else if (result.url) {
      window.open(result.url, "_blank");
      toast.success("Opening resource...");
    } else {
      toast.error("No download link available");
    }
  };

  const handleViewDetails = (result: any) => {
    if (result.url) {
      window.open(result.url, "_blank");
      toast.success("Opening in new tab...");
    } else {
      toast.error("No URL available for this resource");
    }
  };

  const handleCopyCitation = (result: any) => {
    const citation = `${result.authors?.join(", ") || "Unknown"}. (${result.publishedDate || "n.d."}). ${result.title}. ${result.source.toUpperCase()}.`;
    navigator.clipboard.writeText(citation);
    toast.success("Citation copied to clipboard!");
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
      toast.info("Loading previous page...");
    }
  };

  const handleNextPage = () => {
    if (searchData?.pagination?.totalPages && page < searchData.pagination.totalPages) {
      setPage(page + 1);
      toast.info("Loading next page...");
    }
  };

  const getSourceIcon = (sourceId: string) => {
    switch (sourceId) {
      case "openalex":
        return <Globe className="h-4 w-4" />;
      case "core":
        return <Database className="h-4 w-4" />;
      case "doaj":
        return <FileText className="h-4 w-4" />;
      case "eric":
        return <BookOpen className="h-4 w-4" />;
      case "doab":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getSourceColor = (sourceId: string) => {
    switch (sourceId) {
      case "openalex":
        return "bg-blue-500 text-blue-500";
      case "core":
        return "bg-purple-500 text-purple-500";
      case "doaj":
        return "bg-green-500 text-green-500";
      case "eric":
        return "bg-orange-500 text-orange-500";
      case "doab":
        return "bg-red-500 text-red-500";
      default:
        return "bg-gray-500 text-gray-500";
    }
  };

  const renderSourceStatus = () => {
    const sources = (sourcesData?.data || []).map((source) => {
      const status = sourceStatus[source.id] || { status: "idle", results: 0, total: 0 };
      return {
        ...source,
        ...status,
      };
    });

    const getStatusIcon = (status: string) => {
      switch (status) {
        case "loading":
          return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
        case "error":
          return <XCircle className="h-4 w-4 text-red-500" />;
        case "success":
          return <CheckCircle className="h-4 w-4 text-green-500" />;
        default:
          return <Clock className="h-4 w-4 text-gray-500" />;
      }
    };

    return (
      <div className="space-y-3">
        {sources.map((source) => (
          <Card key={source.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getSourceColor(source.id).split(" ")[0]}/10`}>
                    {getSourceIcon(source.id)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{source.name}</p>
                      <Badge variant={source.free ? "success" : "secondary"} className="text-xs">
                        {source.free ? "Free" : "Premium"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{source.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(source.status)}
                      <span className="text-sm font-medium capitalize">{source.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {source.results} results • {source.total.toLocaleString()} total
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={selectedSources.includes(source.id) ? "default" : "outline"}
                    onClick={() => handleSourceToggle(source.id)}
                  >
                    {selectedSources.includes(source.id) ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Selected
                      </>
                    ) : (
                      "Select"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderStatusLogs = () => {
    const logs = Object.entries(sourceStatus).map(([source, status]) => ({
      source,
      ...status,
    }));

    return (
      <ScrollArea className="h-[500px]">
        <div className="space-y-3">
          {logs.map((log, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize",
                        log.status === "success" && "bg-green-500/10 text-green-700",
                        log.status === "error" && "bg-red-500/10 text-red-700",
                        log.status === "loading" && "bg-blue-500/10 text-blue-700"
                      )}
                    >
                      {log.status}
                    </Badge>
                    <div>
                      <p className="font-medium">{log.source.toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">
                        Found {log.results} results
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      Total: {log.total.toLocaleString()}
                    </p>
                    {log.error && (
                      <p className="text-xs text-red-500 max-w-[200px] truncate">
                        {log.error}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Globe className="h-6 w-6" />
            Academic Discovery
          </DialogTitle>
          <DialogDescription>
            Search millions of free academic resources from open access repositories
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full px-6 pb-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search for research papers, articles, books (min. 2 characters)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 h-12 text-base"
                autoFocus
              />
              {searchInput && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchInput("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filter by source:</span>
                <div className="flex flex-wrap gap-2">
                  {sourcesData?.data?.map((source) => (
                    <Badge
                      key={source.id}
                      variant={selectedSources.includes(source.id) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-all hover:scale-105",
                        selectedSources.includes(source.id) && getSourceColor(source.id).split(" ")[0]
                      )}
                      onClick={() => handleSourceToggle(source.id)}
                    >
                      {getSourceIcon(source.id)}
                      <span className="ml-1">{source.name}</span>
                      {selectedSources.includes(source.id) && (
                        <Check className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  )) || (
                    <Skeleton className="h-8 w-20" />
                  )}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {searchData?.pagination ? (
                  <span className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    {searchData.pagination.total.toLocaleString()} resources across {searchData.pagination.sources.length} sources
                  </span>
                ) : (
                  <span>Enter search terms to begin</span>
                )}
              </div>
            </div>
          </form>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="results">Search Results</TabsTrigger>
              <TabsTrigger value="sources">Sources</TabsTrigger>
              <TabsTrigger value="status">Status Logs</TabsTrigger>
            </TabsList>

            {/* Results Tab */}
            <TabsContent value="results" className="flex-1 overflow-hidden flex flex-col mt-4">
              {isSearching ? (
                <div className="space-y-4 h-[400px] overflow-y-auto pr-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-20 w-full" />
                          <div className="flex gap-2">
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-8 w-24" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : searchError ? (
                <Card className="flex-1 flex flex-col items-center justify-center p-8">
                  <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Search Failed</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Unable to connect to academic repositories. Please try again.
                  </p>
                  <Button onClick={() => setPage(1)} variant="outline">
                    Retry Search
                  </Button>
                </Card>
              ) : searchData?.data && searchData.data.length > 0 ? (
                <>
                  <ScrollArea className="h-[400px] pr-4">
                    <AnimatePresence>
                      <div className="space-y-4">
                        {searchData.data.map((result, index) => (
                          <motion.div
                            key={`${result.id}-${index}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Card className="hover:shadow-lg transition-shadow border-l-4" 
                              style={{ borderLeftColor: getSourceColor(result.source).split(" ")[1] }}>
                              <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <CardTitle className="text-lg line-clamp-2 mb-2">
                                      {result.title}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-3 flex-wrap">
                                      {result.authors && result.authors.length > 0 && (
                                        <span className="flex items-center gap-1">
                                          <User className="h-3 w-3" />
                                          <span className="text-xs">
                                            {result.authors.slice(0, 2).join(", ")}
                                            {result.authors.length > 2 && " et al."}
                                          </span>
                                        </span>
                                      )}
                                      {result.publishedDate && (
                                        <span className="flex items-center gap-1">
                                          <Calendar className="h-3 w-3" />
                                          <span className="text-xs">{result.publishedDate}</span>
                                        </span>
                                      )}
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          "capitalize",
                                          getSourceColor(result.source).replace("text-", "border-")
                                        )}
                                      >
                                        {getSourceIcon(result.source)}
                                        <span className="ml-1">{result.source}</span>
                                      </Badge>
                                    </CardDescription>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="pb-3">
                                {result.abstract && (
                                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                                    {result.abstract}
                                  </p>
                                )}
                                {result.subjects && result.subjects.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {result.subjects.slice(0, 4).map((subject, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {subject}
                                      </Badge>
                                    ))}
                                    {result.subjects.length > 4 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{result.subjects.length - 4} more
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </CardContent>
                              <CardFooter className="pt-3 border-t flex justify-between">
                                <div className="text-sm text-muted-foreground">
                                  {result.doi && (
                                    <span className="flex items-center gap-1">
                                      <Link className="h-3 w-3" />
                                      DOI: {result.doi}
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleCopyCitation(result)}
                                  >
                                    <FileText className="h-4 w-4 mr-1" />
                                    Cite
                                  </Button>
                                  {result.pdfUrl && (
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => handleDownload(result)}
                                    >
                                      <Download className="h-4 w-4 mr-1" />
                                      PDF
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewDetails(result)}
                                  >
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                </div>
                              </CardFooter>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </AnimatePresence>
                  </ScrollArea>

                  {/* Pagination */}
                  {searchData.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 mt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Page {page} of {searchData.pagination.totalPages} • 
                        Showing {searchData.data.length} of {searchData.pagination.total.toLocaleString()} results
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePreviousPage}
                          disabled={page === 1}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextPage}
                          disabled={page === searchData.pagination.totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : debouncedSearch.length >= 2 ? (
                <Card className="flex-1 flex flex-col items-center justify-center p-8">
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground text-center mb-4 max-w-md">
                    No academic resources found for "{debouncedSearch}". Try different keywords or adjust your source filters.
                  </p>
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setSearchInput("")}>
                      Clear Search
                    </Button>
                    <Button onClick={() => setActiveTab("sources")}>
                      <Filter className="h-4 w-4 mr-1" />
                      Adjust Sources
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="flex-1 flex flex-col items-center justify-center p-8">
                  <Database className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Search Academic Resources</h3>
                  <p className="text-muted-foreground text-center mb-6 max-w-md">
                    Enter keywords (at least 2 characters) to discover millions of free academic resources from open access repositories worldwide.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    {["AI", "Climate", "Biology", "History", "Physics"].map((topic) => (
                      <Button
                        key={topic}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchInput(`${topic} research`);
                          setDebouncedSearch(`${topic} research`);
                          setPage(1);
                        }}
                      >
                        {topic}
                      </Button>
                    ))}
                  </div>
                </Card>
              )}
            </TabsContent>

            {/* Sources Tab */}
            <TabsContent value="sources" className="flex-1 overflow-hidden mt-4">
              <ScrollArea className="h-full pr-4">
                {sourcesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : (
                  renderSourceStatus()
                )}
              </ScrollArea>
            </TabsContent>

            {/* Status Logs Tab */}
            <TabsContent value="status" className="flex-1 overflow-hidden mt-4">
              {renderStatusLogs()}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}