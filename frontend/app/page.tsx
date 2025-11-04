"use client";

import { useState, useMemo } from "react";
import FilterSidebar from "../components/FilterSidebar";
import MeritListTable from "../components/MeritListTable";
import { meritListData } from "../lib/data/meritList";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Filter, Award } from "lucide-react";
import { statistics } from "@/lib/stats";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColleges, setSelectedColleges] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filter data based on all criteria
  const filteredData = useMemo(() => {
    return meritListData.filter((candidate) => {
      // Text search filter
      const matchesSearch =
        searchQuery === "" ||
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.neetRollNo.toLowerCase().includes(searchQuery.toLowerCase());

      // Multi-select filters
      const matchesType =
        selectedTypes.length === 0 ||
        selectedTypes.includes(candidate.typeOfCandidate);

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(candidate.category);

      const matchesCollege =
        selectedColleges.length === 0 ||
        selectedColleges.includes(candidate.admittedCollege);

      const matchesSubject =
        selectedSubjects.length === 0 ||
        selectedSubjects.includes(candidate.admittedSubject);

      return (
        matchesSearch &&
        matchesType &&
        matchesCategory &&
        matchesCollege &&
        matchesSubject
      );
    });
  }, [
    searchQuery,
    selectedTypes,
    selectedCategories,
    selectedColleges,
    selectedSubjects,
  ]);

  const cardStats = statistics({selectedTypes, selectedCategories, selectedColleges, selectedSubjects});
  return (
    <div className="min-h-screen bg-linear-to-br from-primary/5 via-background to-secondary/5">
      {/* Hero Landing Section */}
      <section className="min-h-screen relative overflow-hidden flex items-center">
        {/* background overlay - slightly brighter but still dark themed */}
        <div className="absolute inset-0 bg-linear-to-r from-primary/20 via-secondary/20 to-accent/20 -z-10" />
        {/* lift content slightly (translate up) for a more visually centered layout */}
        <div className="container mx-auto px-4 py-20 sm:py-24 lg:py-28 relative z-10 transform -translate-y-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <Award className="h-4 w-4" />
              NEET 2024 Official Results
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="gradient-text-primary">NEET Merit List</span>
              <br />
              <span className="text-foreground">2024</span>
            </h1>

            <p className="text-lg sm:text-xl text-foreground/80 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-1000">
              Comprehensive database of NEET 2024 qualified candidates with
              advanced search and filtering capabilities. Find admission details
              across top medical colleges in India.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-6 duration-1000">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => {
                  document
                    .getElementById("merit-list")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Search className="mr-2 h-5 w-5" />
                Browse Merit List
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10"
                onClick={() => {
                  setShowFilters(!showFilters);
                  document
                    .getElementById("merit-list")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Filter className="mr-2 h-5 w-5" />
                Apply Filters
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              {cardStats.map((stat, index) => (
                <Card
                  key={index}
                  className="p-4 sm:p-6 bg-card/80 backdrop-blur-sm border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-xs sm:text-sm text-foreground/70">
                      {stat.label}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section
        id="merit-list"
        className="container mx-auto px-4 py-8 lg:py-12 max-w-[1600px]"
      >
        {/* Section Header */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">
            Search & Filter Results
          </h2>
          <p className="text-foreground/70 text-sm sm:text-base">
            {filteredData.length === meritListData.length
              ? `Showing all ${filteredData.length} candidates`
              : `Found ${filteredData.length} of ${meritListData.length} candidates`}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <FilterSidebar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedTypes={selectedTypes}
                onTypesChange={setSelectedTypes}
                selectedCategories={selectedCategories}
                onCategoriesChange={setSelectedCategories}
                selectedColleges={selectedColleges}
                onCollegesChange={setSelectedColleges}
                selectedSubjects={selectedSubjects}
                onSubjectsChange={setSelectedSubjects}
              />
            </div>
          </aside>

          {/* Mobile Filters - Collapsible */}
          <div className="lg:hidden">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="w-full mb-4 border-2"
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
              {selectedTypes.length +
                selectedCategories.length +
                selectedColleges.length +
                selectedSubjects.length >
                0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
                  {selectedTypes.length +
                    selectedCategories.length +
                    selectedColleges.length +
                    selectedSubjects.length}
                </span>
              )}
            </Button>

            {showFilters && (
              <div className="mb-6 animate-in slide-in-from-bottom-2 duration-300">
                <FilterSidebar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedTypes={selectedTypes}
                  onTypesChange={setSelectedTypes}
                  selectedCategories={selectedCategories}
                  onCategoriesChange={setSelectedCategories}
                  selectedColleges={selectedColleges}
                  onCollegesChange={setSelectedColleges}
                  selectedSubjects={selectedSubjects}
                  onSubjectsChange={setSelectedSubjects}
                />
              </div>
            )}
          </div>
          <main>
            <MeritListTable data={filteredData} />
          </main>
        </div>
      </section>
    </div>
  );
}
