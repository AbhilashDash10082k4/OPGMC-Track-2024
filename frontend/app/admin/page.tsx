"use client";

import { useMemo, useState } from "react";
import MeritListTable from "@/components/MeritListTable";
import FilterSidebar from "@/components/FilterSidebar";
import { meritListData } from "@/lib/data/meritList";
import { Button } from "@/components/ui/button";
import { Filter, User, LogOut } from "lucide-react";
export default function Admin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const admin = {
    name: "Dr. Admin User",
    role: "Super Admin",
    email: "admin@example.com",
    lastLogin: new Date().toLocaleString(),
  };

  const filteredData = useMemo(() => {
    return meritListData.filter((candidate) => {
      const matchesType =
        selectedTypes.length === 0 ||
        selectedTypes.includes(candidate.typeOfCandidate);
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(candidate.category);
      const matchesSubject =
        selectedSubjects.length === 0 ||
        selectedSubjects.includes(candidate.admittedSubject);
      return matchesType && matchesCategory && matchesSubject;
    });
  }, [selectedTypes, selectedCategories, selectedSubjects]);


  function exportCsv() {
    const rows = [
      [
        "Name",
        "NEET Roll No",
        "Type",
        "Category",
        "Admitted Subject",
        "College",
      ],
      ...filteredData.map((r) => [
        r.name,
        r.neetRollNo,
        r.typeOfCandidate,
        r.category,
        r.admittedSubject,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `opgmc-meritlist-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-md font-semibold text-white/70">Manage and export NEET 2024 merit list data</p>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((s) => !s)}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/6"
          >
            <User className="h-5 w-5 text-white/90" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white/5 rounded shadow-lg p-4 z-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-white">
                  {admin.name.split(" ")[0][0]}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">{admin.name}</div>
                  <div className="text-sm text-white/70">{admin.role}</div>
                  <div className="text-xs text-white/60 truncate">{admin.email}</div>
                </div>
              </div>

              <div className="mt-3 border-t border-white/10 pt-3">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    // Ideally call your logout API or redirect here
                  }}
                  className="w-full inline-flex items-center gap-2 justify-center px-3 py-2 rounded bg-destructive text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 bg-white/3 p-4 rounded">
            <FilterSidebar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedTypes={selectedTypes}
              onTypesChange={setSelectedTypes}
              selectedCategories={selectedCategories}
              onCategoriesChange={setSelectedCategories}
              selectedSubjects={selectedSubjects}
              onSubjectsChange={setSelectedSubjects}
            />
          </div>
        </aside>

        {/* Mobile filters toggle */}
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
              selectedSubjects.length >
              0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
                {selectedTypes.length +
                  selectedCategories.length +
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
                selectedSubjects={selectedSubjects}
                onSubjectsChange={setSelectedSubjects}
              />
            </div>
          )}
        </div>

        <section className="p-4 bg-white/3 rounded">
          <div className="mb-4 text-sm text-white/70">
            Showing {filteredData.length} candidates
          </div>
          <MeritListTable data={filteredData} />
        </section>
      </div>
    </div>
  );
}
