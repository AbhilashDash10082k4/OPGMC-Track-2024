import { statistics } from "@/lib/stats";
import { Card } from "./ui/card";
import { useState } from "react";

export default function StatCard() {
  const cardStats = statistics();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 justify-items-stretch">
      {cardStats.map((stat, index) => (
        <Card
          key={index}
          className="h-full p-4 sm:p-6 bg-card/80 backdrop-blur-sm border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:scale-105"
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
  );
}
