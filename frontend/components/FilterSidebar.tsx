"use client"

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, X, Filter } from "lucide-react";
import { getUniqueValues } from "@/lib/data/meritList"; 
import { handleCheckboxChange } from "./SideBarCheckBoxParentComponent";

interface FilterSidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  selectedSubjects: string[];
  onSubjectsChange: (subjects: string[]) => void;
}

export default function FilterSidebar({
  searchQuery,
  onSearchChange,
  selectedTypes,
  onTypesChange,
  selectedCategories,
  onCategoriesChange,
  selectedSubjects,
  onSubjectsChange,
}: FilterSidebarProps) {
  const types = getUniqueValues("typeOfCandidate");
  const categories = getUniqueValues("category");
  const subjects = getUniqueValues("admittedSubject");

  const hasActiveFilters = 
    selectedTypes.length > 0 ||
    selectedCategories.length > 0 ||
    selectedSubjects.length > 0 ||
    searchQuery !== "";

  const clearAllFilters = () => {
    onSearchChange("");
    onTypesChange([]);
    onCategoriesChange([]);
    onSubjectsChange([]);
  };

  return (
    <Card className="p-4 sm:p-6 space-y-6 h-fit border-2 shadow-lg bg-card/80 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Filters</h2>
        </div>
        {hasActiveFilters && (
          <span className="px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
            Active
          </span>
        )}
      </div>
      
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-sm font-medium flex items-center gap-2 text-foreground">
          <Search className="h-4 w-4 text-primary" />
          Search
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/60" />
          <Input
            id="search"
            type="text"
            placeholder="Name or NEET Roll No..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9 border-2 focus:border-primary transition-colors text-foreground placeholder:text-foreground/50"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/60 hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Type of Candidate */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center justify-between text-foreground">
          <span>Type of Candidate</span>
          {selectedTypes.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {selectedTypes.length}
            </span>
          )}
        </Label>
        <ScrollArea className="h-32 border-2 rounded-lg p-3 bg-muted/50">
          <div className="space-y-2">
            {types.map((type) => (
              <div key={type} className="flex items-center space-x-2 group">
                <Checkbox
                  id={`type-${type}`}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={() =>
                    handleCheckboxChange(type, selectedTypes, onTypesChange)
                  }
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label
                  htmlFor={`type-${type}`}
                  className="text-sm cursor-pointer flex-1 group-hover:text-primary transition-colors text-foreground"
                >
                  {type}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Category */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center justify-between text-foreground">
          <span>Category</span>
          {selectedCategories.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">
              {selectedCategories.length}
            </span>
          )}
        </Label>
        <ScrollArea className="h-32 border-2 rounded-lg p-3 bg-muted/50">
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2 group">
                <Checkbox
                  id={`category-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() =>
                    handleCheckboxChange(
                      category,
                      selectedCategories,
                      onCategoriesChange
                    )
                  }
                  className="data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                />
                <label
                  htmlFor={`category-${category}`}
                  className="text-sm cursor-pointer flex-1 group-hover:text-secondary transition-colors text-foreground"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      {/* Admitted Subject */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center justify-between text-foreground">
          <span>Subject Chosen</span>
          {selectedSubjects.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-chart-1/10 text-chart-1">
              {selectedSubjects.length}
            </span>
          )}
        </Label>
        <ScrollArea className="h-24 border-2 rounded-lg p-3 bg-muted/50">
          <div className="space-y-2">
            {subjects.map((subject) => (
              <div key={subject} className="flex items-center space-x-2 group">
                <Checkbox
                  id={`subject-${subject}`}
                  checked={selectedSubjects.includes(subject)}
                  onCheckedChange={() =>
                    handleCheckboxChange(
                      subject,
                      selectedSubjects,
                      onSubjectsChange
                    )
                  }
                  className="data-[state=checked]:bg-chart-1 data-[state=checked]:border-chart-1"
                />
                <label
                  htmlFor={`subject-${subject}`}
                  className="text-sm cursor-pointer flex-1 group-hover:text-chart-1 transition-colors text-foreground"
                >
                  {subject}
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Clear All Filters */}
      {hasActiveFilters && (
        <Button
          onClick={clearAllFilters}
          variant="outline"
          className="w-full border-2 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
        >
          <X className="mr-2 h-4 w-4" />
          Clear All Filters
        </Button>
      )}
    </Card>
  );
}