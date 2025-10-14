// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
// import { AIHabitInput } from "@/components/ai-habit-input";
// import { HabitList } from "@/components/habit-list";
// import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import {
  ArrowRight,
  Sparkles,
  Play,
  LogIn,
  Plus,
  CheckCircle2,
  ShieldCheck,
  Target,
  BarChart2,
  Clock,
  Quote,
} from "lucide-react";

interface ParsedHabit {
  activity: string;
  quantity: number;
  unit: string;
  category: string;
  confidence: number;
}

export default function Home() {
  const { data: session, status } = useSession();

  const [showDemo, setShowDemo] = useState(false);
  const [showHabitInput, setShowHabitInput] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [userHabits, setUserHabits] = useState<any[]>([]);

  // Auto-open demo after 3s only for unauthenticated visitors (optional)
  useEffect(() => {
    if (!session) {
      const timer = setTimeout(() => setShowDemo(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [session]);

  const triggerRefresh = () => setRefreshTrigger((v) => v + 1);

  const handleHabitsCreated = (habits: ParsedHabit[]) => {
    setShowHabitInput(false);
    triggerRefresh();
  };

  const handleHabitsComplete = (habitId: string) => {
    triggerRefresh();
  };

  const handleHabitsUpdated = (habits: any[]) => {
    setUserHabits(habits);
  };

  // Global loading (session)
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#FDECEF] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9D6381]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDECEF] py-20 px-4">
      {/* Hero (unchanged) */}
      <section className="relative z-10 max-w-4xl text-center mx-auto min-h-screen">
        <div className="inline-flex items-center gap-2 bg-[#612940]/20 rounded-full px-4 py-2 mb-8 animate-in fade-in slide-in-from-top-5 duration-1000 backdrop-blur-sm border border-[#612940]/30">
          <Sparkles className="w-4 h-4 text-[#9D6381] animate-pulse" />
          <span className="text-sm font-medium text-[#612940]">
            AI-Powered Habit Tracking
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 animate-in fade-in slide-in-from-top-5 duration-1000 delay-300 leading-tight tracking-tight text-[#0F110C]">
          Transform Your{" "}
          <span className="block bg-gradient-to-r from-[#9D6381] via-[#612940] to-[#0F110C] bg-clip-text text-transparent">
            Daily Habits
          </span>{" "}
          with AI Intelligence
        </h1>

        <p className="text-lg sm:text-xl text-[#612940]/80 mb-10 animate-in fade-in slide-in-from-top-5 duration-1000 delay-500">
          Describe the day in natural language and convert it into{" "}
          <span className="text-[#0F110C] font-semibold">actionable insights</span>{" "}
          and{" "}
          <span className="text-[#9D6381] font-semibold">beautiful progress tracking</span>.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-top-5 duration-1000 delay-700">
          {session ? (
            <Button
              asChild
              size="lg"
              className="flex items-center gap-3 bg-[#612940] hover:bg-[#9D6381] text-[#FDECEF] font-bold text-lg px-10 py-4 rounded-full shadow-lg shadow-[#612940]/40 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
            >
              <Link href="/dashboard" aria-label="Go to dashboard">
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                size="lg"
                className="flex items-center gap-3 bg-[#612940] hover:bg-[#9D6381] text-[#FDECEF] font-bold text-lg px-10 py-4 rounded-full shadow-lg shadow-[#612940]/40 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
              >
                <Link href="/auth/signin" aria-label="Sign in">
                  <LogIn className="w-5 h-5" />
                  Sign In
                </Link>
              </Button>

              {/* <Button
                size="lg"
                variant="outline"
                onClick={() => setShowDemo(true)}
                className="flex items-center gap-3 border-2 border-[#0F110C] text-[#0F110C] hover:bg-[#0F110C]/10 hover:border-[#612940] font-semibold text-lg px-10 py-4 rounded-full transition-all duration-300 transform hover:-translate-y-1"
              >
                <Play className="w-5 h-5" />
                See Demo
              </Button> */}
            </>
          )}
        </div>

        {/* Social proof */}
        <div className="mt-12 animate-in fade-in slide-in-from-top-5 duration-1000 delay-900">
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-[#0F110C]/60">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-[#612940] via-[#9D6381] to-[#0F110C] border-2 border-[#FDECEF] flex items-center justify-center text-xs font-bold text-[#FDECEF]"
                  >
                    👤
                  </div>
                ))}
              </div>
              <span className="font-medium text-[#0F110C]">10,000+ users</span>
            </div>

            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-[#9D6381] text-lg">
                  ★
                </span>
              ))}
              <span className="font-medium ml-2 text-[#0F110C]">4.9/5 rating</span>
            </div>

            <span className="font-medium text-[#0F110C]">No credit card required</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="relative scroll-mt-24 py-16 px-4"
        aria-labelledby="features-title"
      >
        <div className="pointer-events-none absolute inset-0 opacity-10 bg-gradient-to-tr from-[#612940] to-[#9D6381]" />
        <div className="relative max-w-6xl mx-auto">
          <h2
            id="features-title"
            className="text-3xl md:text-4xl font-extrabold text-center bg-gradient-to-r from-[#612940] to-[#9D6381] bg-clip-text text-transparent"
          >
            Powerful Features
          </h2>
          <p className="text-center text-[#0F110C]/70 mt-3 max-w-2xl mx-auto">
            Build, track, and improve habits—beautifully and intelligently.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {/* Insightful Parsing */}
            <div className="rounded-xl p-5 bg-[#FDECEF]/50 border border-[#612940]/20 hover:border-[#9D6381]/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#612940] to-[#9D6381] flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-[#FDECEF]" />
              </div>
              <h3 className="text-lg font-semibold text-[#0F110C]">Natural Language Input</h3>
              <p className="text-sm text-[#0F110C]/70 mt-2">
                Describe your day; the AI extracts activities, quantities, and categories automatically.
              </p>
            </div>

            {/* Goals and Targets */}
            <div className="rounded-xl p-5 bg-[#FDECEF]/50 border border-[#612940]/20 hover:border-[#9D6381]/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#612940] to-[#9D6381] flex items-center justify-center mb-3">
                <Target className="w-5 h-5 text-[#FDECEF]" />
              </div>
              <h3 className="text-lg font-semibold text-[#0F110C]">Smart Goals</h3>
              <p className="text-sm text-[#0F110C]/70 mt-2">
                Set measurable targets and track confidence scores for each habit automatically.
              </p>
            </div>

            {/* Analytics */}
            <div className="rounded-xl p-5 bg-[#FDECEF]/50 border border-[#612940]/20 hover:border-[#9D6381]/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#612940] to-[#9D6381] flex items-center justify-center mb-3">
                <BarChart2 className="w-5 h-5 text-[#FDECEF]" />
              </div>
              <h3 className="text-lg font-semibold text-[#0F110C]">Deep Analytics</h3>
              <p className="text-sm text-[#0F110C]/70 mt-2">
                Understand trends, completion rates, and category distributions over time.
              </p>
            </div>

            {/* Streaks */}
            <div className="rounded-xl p-5 bg-[#FDECEF]/50 border border-[#612940]/20 hover:border-[#9D6381]/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#612940] to-[#9D6381] flex items-center justify-center mb-3">
                <Clock className="w-5 h-5 text-[#FDECEF]" />
              </div>
              <h3 className="text-lg font-semibold text-[#0F110C]">Streaks & Rewards</h3>
              <p className="text-sm text-[#0F110C]/70 mt-2">
                Keep momentum with streaks and achievements aligned to a morning reset boundary.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="relative scroll-mt-24 py-16 px-4"
        aria-labelledby="how-title"
      >
        <div className="relative max-w-6xl mx-auto">
          <h2
            id="how-title"
            className="text-3xl md:text-4xl font-extrabold text-center bg-gradient-to-r from-[#612940] to-[#9D6381] bg-clip-text text-transparent"
          >
            How It Works
          </h2>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <p className="text-center text-[#0F110C]/70 mt-3 max-w-2xl mx-auto">
            Three simple steps to turn daily routines into measurable, lasting habits.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {/* Step 1 */}
            <div className="rounded-xl p-6 bg-[#FDECEF]/50 border border-[#612940]/20 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#612940] to-[#9D6381] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#FDECEF]" />
                </div>
                <h3 className="text-lg font-semibold text-[#0F110C]">1. Describe</h3>
              </div>
              <p className="text-sm text-[#0F110C]/70 mt-3">
                Write what you did in plain English—no forms needed. The AI parses activities, units, and categories.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl p-6 bg-[#FDECEF]/50 border border-[#612940]/20 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#612940] to-[#9D6381] flex items-center justify-center">
                  <Target className="w-5 h-5 text-[#FDECEF]" />
                </div>
                <h3 className="text-lg font-semibold text-[#0F110C]">2. Track</h3>
              </div>
              <p className="text-sm text-[#0F110C]/70 mt-3">
                Habits are created and marked completed for the current cycle; streaks grow every morning you keep going.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl p-6 bg-[#FDECEF]/50 border border-[#612940]/20 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#612940] to-[#9D6381] flex items-center justify-center">
                  <BarChart2 className="w-5 h-5 text-[#FDECEF]" />
                </div>
                <h3 className="text-lg font-semibold text-[#0F110C]">3. Improve</h3>
              </div>
              <p className="text-sm text-[#0F110C]/70 mt-3">
                Use analytics and insights to refine goals, celebrate wins, and sustain progress over time.
              </p>
            </div>
          </div>

          <div className="flex justify-center mt-10">
            <Button
              asChild
              className="bg-gradient-to-r from-[#9D6381] to-[#612940] hover:from-[#612940] hover:to-[#0F110C] text-[#FDECEF] font-semibold px-8"
            >
              <Link href={session ? "/dashboard" : "/auth/signin"}>
                {session ? "Open Dashboard" : "Get Started Free"}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="testimonials"
        className="relative scroll-mt-24 py-16 px-4"
        aria-labelledby="testimonials-title"
      >
        <div className="pointer-events-none absolute inset-0 opacity-10 bg-gradient-to-b from-[#9D6381] to-transparent" />
        <div className="relative max-w-6xl mx-auto">
          <h2
            id="testimonials-title"
            className="text-3xl md:text-4xl font-extrabold text-center bg-gradient-to-r from-[#612940] to-[#9D6381] bg-clip-text text-transparent"
          >
            Loved by Builders
          </h2>
          <p className="text-center text-[#0F110C]/70 mt-3 max-w-2xl mx-auto">
            Developers, creators, and learners use HabitTracker daily to stay consistent.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {[
              {
                name: "Aarav",
                role: "Full-stack Dev",
                quote:
                  "The AI input is brilliant—typing a sentence updates my day. The analytics helped me spot gaps fast.",
                initials: "A",
              },
              {
                name: "Meera",
                role: "Product Designer",
                quote:
                  "The palette and micro-interactions keep me motivated. Streaks feel earned and rewarding.",
                initials: "M",
              },
              {
                name: "Rohan",
                role: "Data Engineer",
                quote:
                  "Morning reset matches my routine. One click to complete a habit per day is the perfect friction.",
                initials: "R",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="rounded-xl p-6 bg-[#FDECEF]/50 border border-[#612940]/20 hover:border-[#9D6381]/40 transition-colors"
              >
                <Quote className="w-5 h-5 text-[#9D6381]" />
                <p className="text-sm text-[#0F110C]/80 mt-3">{t.quote}</p>
                <div className="flex items-center gap-3 mt-5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#612940] to-[#9D6381] text-[#FDECEF] flex items-center justify-center font-semibold">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0F110C]">{t.name}</p>
                    <p className="text-xs text-[#0F110C]/70">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-16 px-4">
        <div className="pointer-events-none absolute inset-0 opacity-10 bg-gradient-to-br from-[#612940] to-[#9D6381]" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-[#612940] to-[#9D6381] bg-clip-text text-transparent">
            Ready to build habits you’ll keep?
          </h3>
          <p className="text-[#0F110C]/70 mt-3">
            Join thousands tracking progress with clarity and consistency.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Button
              asChild
              className="bg-gradient-to-r from-[#612940] to-[#9D6381] hover:from-[#9D6381] hover:to-[#0F110C] text-[#FDECEF] font-semibold px-8"
            >
              <Link href={session ? "/dashboard" : "/auth/signin"}>
                {session ? "Open Dashboard" : "Get Started"}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-[#0F110C] text-[#0F110C] hover:bg-[#0F110C]/10"
            >
              <Link href="#features">See Features</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
