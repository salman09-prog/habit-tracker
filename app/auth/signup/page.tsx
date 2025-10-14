// app/auth/signup/page.tsx - FIXED VERSION
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, UserPlus } from "lucide-react";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    const tid = toast.loading("Creating your account...");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        toast.success("Account created successfully! Redirecting to sign in...", { 
          id: tid,
          duration: 2000 // Show for 2 seconds before redirecting
        });
        
        // Wait for toast to show before redirecting
        setTimeout(() => {
          router.push("/auth/signin");
        }, 2000);
        
      } else {
        const error = await res.json();
        toast.error(error.error || "Could not create account. Please try again.", { 
          id: tid 
        });
      }
    } catch {
      toast.error("Something went wrong. Please try again.", { 
        id: tid 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FDECEF] flex items-center justify-center p-4">
      {/* Sonner Toaster - Add this */}
      <Toaster 
        position="top-center" 
        richColors 
        closeButton 
        theme="light"
      />
      
      <div className="pointer-events-none absolute inset-0 opacity-10 bg-gradient-to-br from-[#9D6381] to-[#612940]" />
      <Card className="relative w-full max-w-md bg-[#FDECEF]/20 border border-[#9D6381] shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-[#612940] to-[#9D6381] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#FDECEF]" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#612940] to-[#9D6381] bg-clip-text text-transparent">
            Create Account
          </CardTitle>
          <p className="text-[#0F110C]/70 mt-2">
            Start your habit tracking journey
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#FDECEF]/30 border border-[#9D6381]/40 focus:border-[#612940] focus:ring-0"
                required
              />
            </div>
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
                minLength={6}
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
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#0F110C]/70 text-sm">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/auth/signin")}
                className="text-[#612940] hover:text-[#9D6381] font-medium underline-offset-4 hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}