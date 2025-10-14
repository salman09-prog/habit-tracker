// app/auth/signin/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, LogIn } from "lucide-react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        alert("Invalid credentials");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error("Sign in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FDECEF] flex items-center justify-center p-4">
      {/* Soft overlay using palette */}
      <div className="pointer-events-none absolute inset-0 opacity-10 bg-gradient-to-br from-[#9D6381] to-[#612940]" />
      <Card className="relative w-full max-w-md bg-[#FDECEF]/20 border border-[#9D6381] shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-[#612940] to-[#9D6381] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#FDECEF]" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#612940] to-[#9D6381] bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <p className="text-[#0F110C]/70 mt-2">
            Sign in to your HabitTracker account
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#FDECEF]/30 border border-[#9D6381]/40 focus:border-[#612940] focus:ring-0"
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#FDECEF]/30 border border-[#9D6381]/40 focus:border-[#612940] focus:ring-0"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#9D6381] to-[#612940] hover:from-[#612940] hover:to-[#0F110C] text-[#FDECEF] font-semibold"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FDECEF]" />
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#0F110C]/70 text-sm">
              Don&apos;t have an account?{" "}
              <button
                onClick={() => router.push("/auth/signup")}
                className="text-[#612940] hover:text-[#9D6381] font-medium underline-offset-4 hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>

          {/* Optional note in palette */}
          <div className="mt-6 p-3 bg-[#612940]/10 border border-[#612940]/20 rounded-lg">
            <p className="text-[#612940] text-xs text-center">
              For demo environments, credentials may be auto-created on first sign-in.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
