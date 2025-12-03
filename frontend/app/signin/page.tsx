"use client";

import { useState } from "react";
import AdminSignIn from "@/components/AdminSignIn";
import StudentSignIn from "@/components/StudentSignIn";
import { Card } from "@/components/ui/card";
import { ArrowLeft, User, GraduationCap } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const [selected, setSelected] = useState<null | "admin" | "student">(null);

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-950 to-gray-900 text-white">

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Sign In</h1>
              <p className="text-sm text-white/70">Choose Admin or Student sign in to continue</p>
            </div>
            <div>
              <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white">
                <ArrowLeft className="h-4 w-4" /> Back to home
              </Link>
            </div>
          </div>

          {/* Choice cards: shown when no selection made */}
          {selected === null ? (
            <div className="flex flex-col items-center justify-center min-h-[55vh] gap-10">
              <Card className="w-full max-w-xl p-8 bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-white/6 flex items-center justify-center shrink-0">
                    <User className="h-7 w-7 text-white/90" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-xl font-semibold truncate">Administrator</h2>
                      <div className="hidden md:block">
                        <button onClick={() => setSelected("admin")} className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground">Open</button>
                      </div>
                    </div>
                    <p className="text-sm text-white/70 mt-1 truncate">Sign in to manage the merit list, export data and perform admin tasks.</p>
                    <div className="mt-3 md:hidden">
                      <button onClick={() => setSelected("admin")} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground">Open Admin Sign In</button>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="w-full max-w-xl p-8 bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-white/6 flex items-center justify-center shrink-0">
                    <GraduationCap className="h-7 w-7 text-white/90" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-xl font-semibold truncate">Student</h2>
                      <div className="hidden md:block">
                        <button onClick={() => setSelected("student")} className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground">Open</button>
                      </div>
                    </div>
                    <p className="text-sm text-white/70 mt-1 truncate">Enter your NEET roll number to view your results.</p>
                    <div className="mt-3 md:hidden">
                      <button onClick={() => setSelected("student")} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground">Open Student Sign In</button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <button onClick={() => setSelected(null)} className="text-sm text-white/80 hover:text-white">← Back to options</button>
              </div>

              <div className="flex items-center justify-center">
                <Card className="w-full max-w-xl p-8 bg-white/5">
                  {selected === "admin" ? <AdminSignIn /> : <StudentSignIn />}
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
