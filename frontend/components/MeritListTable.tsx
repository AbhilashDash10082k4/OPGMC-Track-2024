"use client"

import { useState } from "react";
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

interface MeritListTableProps {
  data: MeritListCandidate[];
}

type SortField = "rank" | "percentile";
type SortOrder = "asc" | "desc";

export default function MeritListTable({ data }: MeritListTableProps) {
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortOrder === "asc") {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById('merit-list')?.scrollIntoView({ behavior: 'smooth' });
  };

  const getRankBadgeColor = (rank: number) => {
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
              <TableRow className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 hover:bg-gradient-to-r hover:from-primary/10 hover:via-secondary/10 hover:to-accent/10">
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
              {paginatedData.length === 0 ? (
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
                paginatedData.map((candidate, index) => (
                  <TableRow 
                    key={candidate.id} 
                    className="hover:bg-gradient-to-r hover:from-primary/5 hover:via-secondary/5 hover:to-accent/5 transition-all duration-200"
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
                        {candidate.percentile.toFixed(2)}%
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
      {paginatedData.length > 0 && (
        <Card className="p-4 border-2 shadow-md bg-card/80 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-foreground/70 order-2 sm:order-1">
              Showing <span className="font-semibold text-foreground">{startIndex + 1}</span> to{" "}
              <span className="font-semibold text-foreground">{Math.min(endIndex, sortedData.length)}</span> of{" "}
              <span className="font-semibold text-foreground">{sortedData.length}</span> results
            </div>
            
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
              >
                <ChevronLeft className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first page, last page, current page, and pages around current
                    return (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    );
                  })
                  .map((page, index, array) => {
                    // Add ellipsis
                    const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                    
                    return (
                      <div key={page} className="flex items-center">
                        {showEllipsisBefore && (
                          <span className="px-2 text-foreground/60">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={`w-9 h-9 p-0 border-2 transition-all ${
                            currentPage === page 
                              ? "bg-primary text-primary-foreground border-primary shadow-md" 
                              : "hover:bg-primary/10 hover:border-primary/50"
                          }`}
                        >
                          {page}
                        </Button>
                      </div>
                    );
                  })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
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