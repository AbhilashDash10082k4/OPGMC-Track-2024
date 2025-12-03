"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full pt-4 bg-transparent">
      <div className=" px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="3" stroke="white" strokeWidth="1.2" />
              <path d="M4 20c1.5-4 6-6 8-6s6.5 2 8 6" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-lg font-semibold text-white">OPGMC Track</div>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="about" className="text-sm text-white/80 hover:text-white">
            About
          </Link>

          <div className="ml-2 flex items-center gap-2">
            <Link href="/signin">
              <Button size="sm" variant="ghost" className="text-white/90 border border-white/10 hover:bg-white/5">
                Sign In
              </Button>
            </Link>
            <Button size="sm" className="bg-primary text-primary-foreground">
              Log In
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
