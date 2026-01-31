import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSearchResults, useSearchSuggestions } from "@/hooks/useSearch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  BookOpen,
  User,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
  Globe,
  Database,
  BookOpenIcon,
  Library,
} from "lucide-react";
import { debounce } from "@/lib/utils";
import { DiscoverySearchModal } from "./DiscoverySearchModal";
import { useDiscoverySources } from "@/hooks/useDiscovery";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"local" | "discovery">("local");
  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);

  const { data: sourcesData } = useDiscoverySources();
  const { data: suggestions, isLoading: loadingSuggestions } = useSearchSuggestions(
    debouncedQuery
  );
  const {
    data: results,
    isLoading: loadingResults,
    error: resultsError,
  } = useSearchResults(debouncedQuery, { page, limit: 9 });

  const debouncedSetQuery = useCallback(
    debounce((value: string) => {
      setDebouncedQuery(value);
      setPage(1);
    }, 300),
    []
  );

  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebouncedQuery("");
      setPage(1);
    }
  }, [open]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    debouncedSetQuery(value);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "resource":
        return FileText;
      case "course":
        return BookOpen;
      case "user":
        return User;
      default:
        return FileText;
    }
  };

  const handleResultClick = (resource: any) => {
    onOpenChange(false);
    router.push(`/resources/${resource.id}`);
  };

  const handleRequestResource = () => {
    onOpenChange(false);
    router.push("/requests");
  };

  const getSourceIcon = (sourceId: string) => {
    switch (sourceId) {
      case "openalex":
        return Globe;
      case "core":
        return Database;
      case "doaj":
        return FileText;
      case "eric":
        return BookOpenIcon;
      case "doab":
        return Library;
      default:
        return Database;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto rounded-3">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
            <DialogDescription>
              Search local resources or discover academic content worldwide
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mt-2">
            <TabsList className="grid w-full grid-cols-2 rounded-xl">
              <TabsTrigger value="local" className="flex items-center gap-2 rounded-xl">
                <FileText className="h-4 w-4" />
                Campus Resources
              </TabsTrigger>
              <TabsTrigger
                value="discovery"
                className="flex items-center gap-2 rounded-xl"
              >
                <Globe className="h-4 w-4" />
                Academic Discovery
              </TabsTrigger>
            </TabsList>

            {/* Local Resources Tab */}
            <TabsContent value="local" className="space-y-6 mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for courses, resources..."
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  className="pl-10 h-12 text-lg"
                  autoFocus
                />
                {query && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {debouncedQuery.length >= 2 && (
                <>
                  <AnimatePresence>
                    {!loadingSuggestions && suggestions && suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-muted-foreground">
                            Quick suggestions
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {suggestions.slice(0, 6).map((suggestion) => {
                              const Icon = getIconForType(suggestion.type);
                              return (
                                <Button
                                  key={suggestion.id}
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => {
                                    if (suggestion.type === "resource") {
                                      onOpenChange(false);
                                      router.push(`/resources/${suggestion.id}`);
                                    } else if (suggestion.type === "course") {
                                      onOpenChange(false);
                                      router.push(`/courses/${suggestion.id}`);
                                    }
                                  }}
                                >
                                  <Icon className="h-4 w-4" />
                                  <span className="truncate max-w-[200px]">
                                    {suggestion.title}
                                  </span>
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">
                        {loadingResults
                          ? "Searching..."
                          : results?.data?.length
                            ? `${results.pagination.total} result${results.pagination.total !== 1 ? "s" : ""
                            } found`
                            : "No results found"}
                      </h4>
                    </div>

                    {loadingResults && (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                          <Card key={i}>
                            <CardContent className="p-4">
                              <Skeleton className="h-20 w-full mb-3" />
                              <Skeleton className="h-5 w-3/4 mb-2" />
                              <Skeleton className="h-4 w-1/2" />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {resultsError && !loadingResults && (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-8">
                          <Search className="h-12 w-12 text-destructive mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Search Error</h3>
                          <p className="text-muted-foreground text-center max-w-sm mb-4">
                            Something went wrong while searching. Please try again.
                          </p>
                          <Button onClick={() => handleQueryChange(query)} variant="outline">
                            Retry Search
                          </Button>
                        </CardContent>
                      </Card>
                    )}

                    {!loadingResults &&
                      !resultsError &&
                      results?.data &&
                      results.data.length > 0 && (
                        <>
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {results.data.map((resource, index) => (
                              <motion.div
                                key={resource.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <Card
                                  className="h-full hover:shadow-md transition-shadow cursor-pointer group"
                                  onClick={() => handleResultClick(resource)}
                                >
                                  <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="p-2 bg-primary/10 rounded-lg">
                                        <FileText className="h-5 w-5 text-primary" />
                                      </div>
                                      <Badge variant="secondary" className="text-xs">
                                        {resource.type}
                                      </Badge>
                                    </div>
                                    <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                                      {resource.title}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 text-sm">
                                      {resource.description}
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent className="pt-0">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                      <span className="truncate">{resource.category}</span>
                                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>

                          {results.pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={!results.pagination.hasPrev}
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <span className="text-sm text-muted-foreground px-2">
                                Page {results.pagination.page} of {results.pagination.totalPages}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={!results.pagination.hasNext}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </>
                      )}

                    {!loadingResults &&
                      !resultsError &&
                      debouncedQuery.length >= 2 &&
                      results?.data &&
                      results.data.length === 0 && (
                        <Card>
                          <CardContent className="flex flex-col items-center justify-center py-12">
                            <Search className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No results found</h3>
                            <p className="text-muted-foreground text-center max-w-sm mb-6">
                              We couldn't find any resources matching "{debouncedQuery}". Try
                              different keywords or request this resource.
                            </p>
                            <div className="flex gap-4">
                              <Button onClick={handleRequestResource} className="gap-2">
                                <ExternalLink className="h-4 w-4" />
                                Request This Resource
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setActiveTab("discovery")}
                                className="gap-2"
                              >
                                <Globe className="h-4 w-4" />
                                Search Online
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                  </div>
                </>
              )}

              {query.length < 2 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Start searching</h3>
                    <p className="text-muted-foreground text-center max-w-sm">
                      Enter at least 2 characters to search local resources
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Discovery Tab */}
            <TabsContent value="discovery" className="mt-4">
              <div className="text-center py-8">
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Academic Discovery
                    </span>
                  </div>
                </div>

                <Globe className="h-16 w-16 text-primary mx-auto mb-6" />
                <h3 className="text-xl font-bold mb-3">Search Millions of Academic Resources</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Access millions of free academic papers, articles, and books from
                  open access repositories worldwide. All resources are completely free.
                </p>

                {/* Sources Overview */}
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-4">
                    Integrated Sources
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    {sourcesData?.data?.map((source) => {
                      const Icon = getSourceIcon(source.id);
                      return (
                        <div
                          key={source.id}
                          className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                        >
                          <Icon className="h-6 w-6 mb-2 text-primary" />
                          <span className="text-xs font-medium">{source.name}</span>
                          <span className="text-xs text-muted-foreground mt-1">
                            {source.free ? "Free" : "Premium"}
                          </span>
                        </div>
                      );
                    }) || (
                        <>
                          {["OpenAlex", "CORE", "DOAJ", "ERIC", "DOAB"].map((name) => (
                            <div
                              key={name}
                              className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                            >
                              <Skeleton className="h-6 w-6 mb-2 rounded-full" />
                              <Skeleton className="h-3 w-16 mb-2" />
                              <Skeleton className="h-2 w-12" />
                            </div>
                          ))}
                        </>
                      )}
                  </div>
                </div>

                {/* Quick Search Form */}
                <div className="max-w-md mx-auto space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="Enter research topic, keywords..."
                      className="pl-10 h-12 text-base"
                      onClick={() => setShowDiscoveryModal(true)}
                      readOnly
                    />
                  </div>
                  <Button
                    onClick={() => setShowDiscoveryModal(true)}
                    className="w-full h-12 text-lg"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Open Discovery Search
                  </Button>
                </div>

                <div className="mt-8 pt-6 border-t">
                  <h4 className="text-sm font-semibold mb-3">Why use Discovery Search?</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    <div className="space-y-2">
                      <Badge variant="outline" className="w-full justify-center">
                        <Globe className="mr-2 h-3 w-3" />
                        Global Access
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Access millions of resources from worldwide repositories
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Badge variant="outline" className="w-full justify-center">
                        <Database className="mr-2 h-3 w-3" />
                        Free Resources
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        All resources are open access and completely free to use
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Badge variant="outline" className="w-full justify-center">
                        <ExternalLink className="mr-2 h-3 w-3" />
                        Direct Links
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Get direct links to papers, books, and PDF downloads
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="text-xs text-muted-foreground mt-4 flex justify-between items-center">
            <div>
              {activeTab === "discovery" && sourcesData?.data && (
                <span className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  {sourcesData.data.length} sources available
                </span>
              )}
            </div>
            <div>
              <span className="flex items-center gap-1">
                Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">Esc</kbd> to close
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Discovery Modal */}
      <DiscoverySearchModal
        open={showDiscoveryModal}
        onOpenChange={(open) => {
          setShowDiscoveryModal(open);
          if (!open) {
            setActiveTab("discovery");
          }
        }}
      />
    </>
  );
}