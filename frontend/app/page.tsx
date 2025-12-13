"use client";

import StatCard from "@/components/StatCard";
import Navbar from "../components/Navbar";
import { Award } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen  bg-linear-to-b from-slate-900 via-slate-950 to-gray-900 text-white">
      <Navbar />
      <section className=" flex items-center">
        <div className=" bg-linear-to-r from-slate-900 via-slate-950 to-gray-900 opacity-80" />
        <div className="mx-auto px-4 py-20 sm:py-24 lg:py-28 relative z-10">
          <div className="max-w-4xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-white/90 text-sm font-medium mb-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <Award className="h-4 w-4" />
              NEET 2024 Official Results
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="bg-clip-text text-transparent bg-linear-to-r from-white to-slate-300">NEET Merit List</span>
              <br />
              <span className="text-white/90">2024</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-1000">
              Comprehensive database of NEET 2024 qualified candidates with
              advanced search and filtering capabilities. Find admission details
              across top medical colleges in India.
            </p>

            <StatCard />
          </div>
        </div>
      </section>
    </div>
  );
}
