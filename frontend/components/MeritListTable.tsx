"use client"

// client-only component
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowUpDown, ChevronLeft, ChevronRight, Trophy, GraduationCap } from "lucide-react";
import { MeritListCandidate } from "@/lib/data/meritList";
import useServerPagination from "@/lib/hooks/useServerPagination";

interface MeritListTableProps {
  data?: MeritListCandidate[];
}

export default function MeritListTable({ data }: MeritListTableProps) {
  // Use server-side pagination by default. The hook queries /api/pagination
  const {
    data: paginatedData,
    total,
    totalPages,
    page,
    startIndex,
    endIndex,
    loading,
    error,
    setPage,
    setSortField,
    setSortOrder,
  } = useServerPagination<MeritListCandidate>({ initialPage: 1 });

  type SortField = "rank" | "percentile";
  type SortOrder = "asc" | "desc";

  const handleSort = (field: SortField) => {
    // Toggle sort order when clicking same field, otherwise set asc
    setSortField((prev) => {
      if (prev === field) {
        setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortOrder("asc");
      return field;
    });
    // Reset to first page on sort change
    setPage(1);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    document.getElementById('merit-list')?.scrollIntoView({ behavior: 'smooth' });
  };

  // If server returns no rows yet, allow a fallback to in-memory `data` prop when provided
  const effectiveData = (paginatedData && paginatedData.length > 0) ? paginatedData : (data ?? []);

  // Show server error (if any)
  const errorMessage = error ?? null;

  const getRankBadgeColor = (rank: number) => {
    console.log(rank);
    return "bg-primary text-primary-foreground";
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "UR": return "text-primary";
      case "OBC": return "text-secondary";
      case "SC": return "text-accent";
      case "ST": return "text-chart-1";
      default: return "text-foreground";
    }
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-2 shadow-lg bg-card/80 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-linear-to-r from-primary/5 via-secondary/5 to-accent/5 hover:bg-linear-to-r hover:from-primary/10 hover:via-secondary/10 hover:to-accent/10">
                <TableHead 
                  className="cursor-pointer hover:bg-primary/10 transition-colors font-bold text-foreground"
                  onClick={() => handleSort("rank")}
                >
                  <div className="flex items-center space-x-1">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span>Rank</span>
                    <ArrowUpDown className="h-4 w-4 text-primary" />
                  </div>
                </TableHead>
                <TableHead className="font-bold text-foreground">Name</TableHead>
                <TableHead className="font-bold hidden sm:table-cell text-foreground">NEET Roll No</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-secondary/10 transition-colors font-bold text-foreground"
                  onClick={() => handleSort("percentile")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Percentile</span>
                    <ArrowUpDown className="h-4 w-4 text-secondary" />
                  </div>
                </TableHead>
                <TableHead className="font-bold hidden md:table-cell text-foreground">Type</TableHead>
                <TableHead className="font-bold hidden lg:table-cell text-foreground">Category</TableHead>
                <TableHead className="font-bold hidden xl:table-cell min-w-[180px] text-foreground">
                  <div className="flex items-center space-x-1">
                    <GraduationCap className="h-4 w-4 text-accent" />
                    <span>Admitted College</span>
                  </div>
                </TableHead>
                <TableHead className="font-bold hidden xl:table-cell text-foreground">Subject</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errorMessage && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    <div className="text-sm text-destructive">{errorMessage}</div>
                  </TableCell>
                </TableRow>
              )}
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3 text-foreground/70">
                      <div className="h-8 w-8 rounded-full bg-muted/50 animate-pulse" />
                      <p className="text-lg font-medium text-foreground">Loading…</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : effectiveData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3 text-foreground/70">
                      <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
                        <Trophy className="h-8 w-8" />
                      </div>
                      <p className="text-lg font-medium text-foreground">No results found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                effectiveData.map((candidate) => (
                  <TableRow 
                    key={candidate.id} 
                    className="hover:bg-linear-to-r hover:from-primary/5 hover:via-secondary/5 hover:to-accent/5 transition-all duration-200"
                  >
                    <TableCell>
                      <span className={`inline-flex items-center justify-center px-2 py-1 rounded-md font-bold text-sm ${getRankBadgeColor(candidate.rank)}`}>
                        {candidate.rank}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{candidate.name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-foreground/70 font-mono text-xs">
                      {candidate.neetRollNo}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-secondary/10 text-secondary font-semibold text-sm">
                        {(candidate.percentile ?? 0).toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="inline-flex px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                        {candidate.typeOfCandidate}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className={`font-semibold ${getCategoryColor(candidate.category)}`}>
                        {candidate.category}
                      </span>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-sm text-foreground">
                      {candidate.admittedCollege}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <span className="inline-flex px-2 py-1 rounded-md bg-accent/10 text-accent text-xs font-medium">
                        {candidate.admittedSubject}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination Controls */}
            {(effectiveData.length > 0 || loading) && (
        <Card className="p-4 border-2 shadow-md bg-card/80 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-foreground/70 order-2 sm:order-1">
              Showing <span className="font-semibold text-foreground">{startIndex + 1}</span> to {" "}
              <span className="font-semibold text-foreground">{Math.min(endIndex + 1, total)}</span> of {" "}
              <span className="font-semibold text-foreground">{total}</span> results
            </div>
            
            <div className="flex items-center gap-2 order-1 sm:order-2">
                <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
              >
                <ChevronLeft className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((pg) => {
                    return (
                      pg === 1 ||
                      pg === totalPages ||
                      (pg >= page - 1 && pg <= page + 1)
                    );
                  })
                  .map((pg, index, array) => {
                    const showEllipsisBefore = index > 0 && pg - array[index - 1] > 1;
                    return (
                      <div key={pg} className="flex items-center">
                        {showEllipsisBefore && <span className="px-2 text-foreground/60">...</span>}
                        <Button
                          variant={page === pg ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pg)}
                          className={`w-9 h-9 p-0 border-2 transition-all ${
                            page === pg ? "bg-primary text-primary-foreground border-primary shadow-md" : "hover:bg-primary/10 hover:border-primary/50"
                          }`}
                        >
                          {pg}
                        </Button>
                      </div>
                    );
                  })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 sm:ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}