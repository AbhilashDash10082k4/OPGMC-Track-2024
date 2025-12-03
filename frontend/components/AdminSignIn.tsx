"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, Lock, Mail, Clock } from "lucide-react";

type Props = {
  onSignIn?: (email: string) => void;
};

export default function AdminSignIn({ onSignIn }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [admin, setAdmin] = useState<null | { name: string; role: string; email: string; lastLogin: string }>(null);

  async function handleSignIn(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    setLoading(true);
    try {
      // Placeholder sign-in flow: replace with real auth request
      await new Promise((r) => setTimeout(r, 700));
      const mockAdmin = {
        name: "Dr. Admin User",
        role: "Super Admin",
        email,
        lastLogin: new Date().toLocaleString(),
      };
      setAdmin(mockAdmin);
      onSignIn?.(email);
    } catch (err) {
      setError("Sign in failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSignOut() {
    setAdmin(null);
    setEmail("");
    setPassword("");
  }

  return (
    <div className="max-w-xl mx-auto rounded-xl p-6 shadow-lg min-h-[420px]">
      {!admin ? (
        <div>
          <div className="flex items-center gap-6 mb-6">
            <div className="h-12 w-12 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-white">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Admin Sign In</h3>
              <p className="text-sm text-white/70">Access the admin dashboard and manage data</p>
            </div>
          </div>

          <form onSubmit={handleSignIn} className="space-y-5">
            <label className="block">
              <span className="text-sm text-white/80">Email</span>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
                <input
                  className="w-full pl-10 pr-3 py-2 bg-transparent border border-white/10 rounded text-white placeholder-white/50"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm text-white/80">Password</span>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
                <input
                  className="w-full pl-10 pr-3 py-2 bg-transparent border border-white/10 rounded text-white placeholder-white/50"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </label>

            <div className="flex items-center justify-between text-sm text-white/70">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Remember me
              </label>
              <a className="text-primary text-sm" href="#">Forgot?</a>
            </div>

            {error && <div className="text-sm text-destructive">{error}</div>}

            <div className="flex items-center gap-3">
              <Button type="submit" onClick={handleSignIn} className="bg-primary w-full py-2" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-white">
              <span className="font-semibold">{admin.name.split(" ")[0][0]}</span>
            </div>
            <div>
              <div className="text-white font-semibold">{admin.name}</div>
              <div className="text-sm text-white/70">{admin.role}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 text-sm text-white/80">
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-white/70" />{admin.email}</div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-white/70" />Last login: <span className="text-white/70">{admin.lastLogin}</span></div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleSignOut} className="border-white/10 text-white/90">Sign Out</Button>
            <Button className="bg-primary text-primary-foreground">Open Admin</Button>
          </div>
        </div>
      )}
    </div>
  );
}
