"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {  User, Calendar } from "lucide-react";
import { meritListData } from "@/lib/data/meritList";

type Student = {
  name: string;
  neetRollNo: string;
  admittedCollege?: string;
  admittedSubject?: string;
};

export default function StudentSignIn() {
  const [neetRollNo, setNeetRollNo] = useState("");
  const [stateAppNo, setStateAppNo] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const dobRef = useRef<HTMLInputElement | null>(null);

  async function handleLookup(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setStudent(null);
    if (!neetRollNo) {
      setError("Enter your NEET roll number to continue.");
      return;
    }
    setLoading(true);
    try {
      // Simulated lookup: try to find in local merit list data
      await new Promise((r) => setTimeout(r, 600));
      const found = meritListData.find(
        (m) => m.neetRollNo === neetRollNo.trim()
      );
      if (!found) {
        setError(
          "No record found for this roll number. Please check and try again."
        );
      } else {
        setStudent({
          name: found.name,
          neetRollNo: found.neetRollNo,
          // admittedCollege: (found).college ?? "",
          admittedSubject: found.admittedSubject ?? "",
        });
      }
    } catch (err) {
      setError("Lookup failed. Try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto rounded-xl p-6 shadow-lg min-h-[380px]">
      <div className="flex items-center gap-6 mb-6">
        <div className="h-12 w-12 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-white">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Student Sign In</h3>
          <p className="text-sm text-white/70 font-semibold">
            Enter your NEET roll number to view your result
          </p>
        </div>
      </div>

      <form onSubmit={handleLookup} className="space-y-5">
        <label className="block">
          <span className="text-sm text-white/80">NEET Roll Number</span>
          <div className="mt-1 relative">
            <input
              className="w-full py-2 bg-transparent border border-white/10 pl-4 rounded text-white placeholder-white/50"
              placeholder="Enter NEET roll number"
              value={neetRollNo}
              onChange={(e) => setNeetRollNo(e.target.value)}
            />
          </div>
        </label>

        <label className="block">
          <span className="text-sm text-white/80">State Application No.</span>
          <div className="mt-1 relative">
            <input
              className="w-full  py-2 bg-transparent border border-white/10 pl-4  rounded text-white placeholder-white/50"
              placeholder="Enter State Application No."
              value={stateAppNo}
              onChange={(e) => setStateAppNo(e.target.value)}
            />
          </div>
        </label>

        <label className="block">
          <span className="text-sm text-white/80">Date of Birth</span>
          <div className="mt-1 relative">
            <button
              type="button"
              onClick={() => {
                const el = dobRef.current;
                if (!el) return;
                (el).showPicker?.() ?? el.focus();
              }}
              aria-label="Open date picker"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 flex items-center justify-center"
            >
              <Calendar className="h-5 w-5" />
            </button>
            <input
              ref={dobRef}
              id="dob-input"
              className="w-full pl-10 pr-3 py-2 bg-transparent border border-white/10 rounded text-white placeholder-white/50"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
        </label>

        {error && <div className="text-sm text-destructive">{error}</div>}

        <div className="flex gap-3">
          <Button
            onClick={handleLookup}
            className="bg-primary w-full py-2"
            disabled={loading}
          >
            {loading ? "Looking up..." : "View Result"}
          </Button>
        </div>
      </form>

      {student && (
        <div className="mt-6 p-4 rounded border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white/80">Name</div>
              <div className="font-semibold text-white">{student.name}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/80">Roll</div>
              <div className="font-semibold text-white">
                {student.neetRollNo}
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-white/80">
            <div>
              College:{" "}
              <span className="text-white">
                {student.admittedCollege || "N/A"}
              </span>
            </div>
            <div>
              Subject:{" "}
              <span className="text-white">
                {student.admittedSubject || "N/A"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
