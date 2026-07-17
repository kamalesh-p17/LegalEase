import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Search, FileText, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CaseResult {
  id: string;
  title: string;
  court: string;
  date: string;
  snippet: string;
}

const Summarize = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState("general");
  const [cases, setCases] = useState<CaseResult[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseResult | null>(null);
  const [summary, setSummary] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryProgress, setSummaryProgress] = useState("");

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setSearchLoading(true);
    setCases([]);
    setSelectedCase(null);
    setSummary("");

    try {
      const { data, error } = await supabase.functions.invoke("search-cases", {
        body: { query: searchQuery },
      });

      if (error) throw error;

      if (data?.cases && data.cases.length > 0) {
        setCases(data.cases);
        toast.success(`Found ${data.cases.length} cases`);
      } else {
        toast.info("No cases found for your search");
      }
    } catch (error: any) {
      console.error("Error searching cases:", error);
      toast.error(error.message || "Failed to search cases");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectCase = async (caseData: CaseResult) => {
    setSelectedCase(caseData);
    setSummary("");
    setSummaryProgress("Fetching case document...");
    setSummaryLoading(true);

    try {
      // Show progress updates
      const progressInterval = setInterval(() => {
        const messages = [
          "Analyzing case structure...",
          "Processing legal text...",
          "Generating AI summary...",
          "Finalizing summary...",
        ];
        setSummaryProgress(messages[Math.floor(Math.random() * messages.length)]);
      }, 3000);

      const { data, error } = await supabase.functions.invoke("summarize-case", {
        body: { caseId: caseData.id, userRole },
      });

      clearInterval(progressInterval);

      if (error) throw error;

      if (data?.summary) {
        setSummary(data.summary);
        setSummaryProgress("");
        toast.success("Summary generated successfully!");
      } else {
        throw new Error("No summary returned");
      }
    } catch (error: any) {
      console.error("Error generating summary:", error);
      const errorMessage = error.message || "Failed to generate summary";
      
      if (errorMessage.includes("Rate limit")) {
        toast.error("Service is busy. Please try again in a few moments.", {
          duration: 5000,
        });
      } else if (errorMessage.includes("credits")) {
        toast.error("AI service credits exhausted. Please contact support.", {
          duration: 5000,
        });
      } else {
        toast.error(errorMessage);
      }
      
      setSelectedCase(null);
      setSummaryProgress("");
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              AI-Powered Legal Analysis
            </div>
            <h1 className="text-4xl font-bold mb-4 text-foreground">Case Summarization</h1>
            <p className="text-lg text-muted-foreground">
              Search Indian legal cases and get AI-generated summaries tailored to your needs
            </p>
          </div>

          {/* Search Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Search Legal Cases</CardTitle>
              <CardDescription>
                Enter keywords, case names, or legal topics from Indian Kanoon database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Right to Privacy, NEET, Article 21..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={searchLoading} size="lg">
                  <Search className="mr-2 h-4 w-4" />
                  {searchLoading ? "Searching..." : "Search"}
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Select Your Role</label>
                <Select value={userRole} onValueChange={setUserRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Public - Simple Terms</SelectItem>
                    <SelectItem value="student">Law Student - Educational</SelectItem>
                    <SelectItem value="lawyer">Practicing Lawyer - Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Case Results */}
          {cases.length > 0 && !selectedCase && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Select a Case to Summarize</CardTitle>
                <CardDescription>Click on any case to generate a summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cases.map((caseData) => (
                    <button
                      key={caseData.id}
                      onClick={() => handleSelectCase(caseData)}
                      className="w-full text-left p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4 text-primary" />
                            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                              {caseData.title}
                            </h3>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>Court: {caseData.court}</p>
                            <p>Date: {caseData.date}</p>
                            {caseData.snippet && (
                              <p className="line-clamp-2 mt-2">{caseData.snippet}</p>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary Display */}
          {selectedCase && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {selectedCase.title}
                </CardTitle>
                <CardDescription>
                  {selectedCase.court} • {selectedCase.date} • Tailored for:{" "}
                  {userRole === "general"
                    ? "General Public"
                    : userRole === "student"
                    ? "Law Student"
                    : "Practicing Lawyer"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summaryLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-pulse space-y-4">
                      <Sparkles className="h-10 w-10 mx-auto text-primary animate-spin" />
                      <div>
                        <p className="text-lg font-medium text-foreground mb-2">
                          {summaryProgress || "Analyzing case..."}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          This may take 1-2 minutes for lengthy cases
                        </p>
                      </div>
                      <div className="w-64 h-1 bg-muted rounded-full mx-auto overflow-hidden">
                        <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  </div>
                ) : summary ? (
                  <div className="space-y-6">
                    {/* Summary content with better formatting */}
                    <div className="prose prose-sm max-w-none">
                      <div className="text-foreground space-y-4">
                        {summary.split('\n\n').map((paragraph, idx) => {
                          // Check if it's a heading (starts with ##, **, or numbered)
                          if (paragraph.trim().startsWith('##') || paragraph.trim().match(/^\*\*[^*]+\*\*/)) {
                            return (
                              <h3 key={idx} className="text-lg font-semibold text-foreground mt-6 mb-3">
                                {paragraph.replace(/##|\*\*/g, '').trim()}
                              </h3>
                            );
                          }
                          // Check if it's a bullet point list
                          if (paragraph.includes('\n- ') || paragraph.includes('\n• ')) {
                            const items = paragraph.split('\n').filter(line => line.trim());
                            return (
                              <ul key={idx} className="list-disc list-inside space-y-2 bg-muted/30 p-4 rounded-lg">
                                {items.map((item, i) => (
                                  <li key={i} className="text-foreground">
                                    {item.replace(/^[-•]\s*/, '')}
                                  </li>
                                ))}
                              </ul>
                            );
                          }
                          // Regular paragraph
                          return (
                            <p key={idx} className="text-foreground leading-relaxed bg-muted/20 p-4 rounded-lg">
                              {paragraph}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(summary);
                          toast.success("Summary copied to clipboard!");
                        }}
                      >
                        Copy Summary
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedCase(null);
                          setSummary("");
                        }}
                      >
                        Back to Results
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCases([]);
                          setSelectedCase(null);
                          setSummary("");
                          setSearchQuery("");
                        }}
                      >
                        New Search
                      </Button>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

          {/* How It Works */}
          {!cases.length && !selectedCase && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      1
                    </span>
                    <span>
                      <strong>Search:</strong> Enter keywords to search Indian Kanoon's extensive
                      legal database
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      2
                    </span>
                    <span>
                      <strong>Select:</strong> Choose a case from the search results
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      3
                    </span>
                    <span>
                      <strong>Understand:</strong> Get an AI-generated summary tailored to your role
                      and understanding level
                    </span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Summarize;
