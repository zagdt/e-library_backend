import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  FileText,
  Clock,
  ChevronRight,
  GraduationCap,
  Calendar,
  User,
  ExternalLink,
} from "lucide-react";

// Mock dissertation data
const mockDissertations = [
  {
    id: 1,
    title: "Machine Learning Applications in Healthcare Diagnostics",
    author: "Dr. Sarah Mukasa",
    institution: "Makerere University",
    department: "Computer Science",
    year: 2024,
    pages: 245,
    abstract: "This dissertation explores the application of machine learning algorithms in early disease detection and diagnostic accuracy improvement.",
    keywords: ["Machine Learning", "Healthcare", "Diagnostics", "AI"],
    pdfUrl: "https://bitcoin.org/bitcoin.pdf",
  },
  {
    id: 2,
    title: "Sustainable Agriculture Practices in East African Communities",
    author: "Prof. James Omondi",
    institution: "University of Nairobi",
    department: "Agricultural Sciences",
    year: 2024,
    pages: 198,
    abstract: "An in-depth study of traditional and modern sustainable farming techniques and their impact on food security in rural East African communities.",
    keywords: ["Agriculture", "Sustainability", "East Africa", "Food Security"],
    pdfUrl: "https://bitcoin.org/bitcoin.pdf",
  },
  {
    id: 3,
    title: "Climate Change Impact on Biodiversity in African Ecosystems",
    author: "Dr. Amina Hassan",
    institution: "University of Dar es Salaam",
    department: "Environmental Science",
    year: 2023,
    pages: 312,
    abstract: "This research examines the effects of climate change on various ecosystems across Africa and proposes conservation strategies.",
    keywords: ["Climate Change", "Biodiversity", "Ecosystems", "Conservation"],
    pdfUrl: "https://bitcoin.org/bitcoin.pdf",
  },
  {
    id: 4,
    title: "Digital Financial Inclusion in Emerging Markets",
    author: "Dr. Peter Kamau",
    institution: "Strathmore University",
    department: "Business & Economics",
    year: 2024,
    pages: 176,
    abstract: "An analysis of mobile money platforms and their role in promoting financial inclusion among unbanked populations in developing countries.",
    keywords: ["Fintech", "Mobile Money", "Financial Inclusion", "Economics"],
    pdfUrl: "https://bitcoin.org/bitcoin.pdf",
  },
];

export default function LatestDissertationsSection() {
  const [selectedDissertation, setSelectedDissertation] = useState(null);

  return (
    <>
      <Card className="rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <GraduationCap className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-lg md:text-2xl">Latest Dissertations</CardTitle>
                <CardDescription>Recently published research</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="rounded-xl">
              View all
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {mockDissertations.map((dissertation) => (
              <button
                key={dissertation.id}
                onClick={() => setSelectedDissertation(dissertation)}
                className="flex items-start gap-3 p-4 rounded-xl bg-accent/50 hover:bg-accent transition-all group text-left w-full"
              >
                <div className="relative flex-shrink-0">
                  <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate group-hover:text-primary transition-colors mb-2">
                    {dissertation.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <User className="h-3 w-3" />
                    <span>{dissertation.author}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{dissertation.year}</span>
                    <span>•</span>
                    <Badge variant="secondary" className="text-xs">
                      {dissertation.pages} pages
                    </Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dissertation Detail Dialog */}
      <Dialog open={!!selectedDissertation} onOpenChange={() => setSelectedDissertation(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedDissertation && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-xl mb-2">
                      {selectedDissertation.title}
                    </DialogTitle>
                    <DialogDescription className="text-base">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{selectedDissertation.author}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span>{selectedDissertation.institution}</span>
                          <span>•</span>
                          <span>{selectedDissertation.department}</span>
                          <span>•</span>
                          <Badge variant="outline">{selectedDissertation.year}</Badge>
                        </div>
                      </div>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Abstract */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Abstract
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedDissertation.abstract}
                  </p>
                </div>

                {/* Keywords */}
                <div>
                  <h3 className="font-semibold mb-2">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDissertation.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-accent/50 rounded-xl">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Pages</p>
                    <p className="font-medium">{selectedDissertation.pages}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Year</p>
                    <p className="font-medium">{selectedDissertation.year}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Institution</p>
                    <p className="font-medium">{selectedDissertation.institution}</p>
                  </div>
                </div>

                {/* PDF Viewer */}
                <div className="border rounded-xl overflow-hidden">
                  <div className="bg-accent/50 p-3 flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Full Dissertation
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="rounded-lg"
                    >
                      <a
                        href={selectedDissertation.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open in New Tab
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                  <iframe
                    src={selectedDissertation.pdfUrl}
                    className="w-full h-[600px]"
                    title={selectedDissertation.title}
                  />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}