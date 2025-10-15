// app/dashboard/page.tsx - UPDATED WITH DYNAMIC STATS
"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import gsap from "gsap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  TrendingUp,
  Target,
  Award,
  Share2,
  BarChart as ChartBar,
} from "lucide-react";
import { HabitList } from "@/components/habit-list";
import { AIHabitInput } from "@/components/ai-habit-input";
import { AdvancedAnalytics } from "@/components/advanced-analytics";
import { SocialSharing } from "@/components/social-sharing";
import { MobileOptimizedLayout } from "@/components/mobile-optimized-layout";
// import { Toaster } from "sonner"; // Optional: global Toaster recommended in app/layout.tsx

interface ParsedHabit {
  activity: string;
  quantity: number;
  unit: string;
  category: string;
  confidence: number;
}

interface HabitShape {
  id: string;
  createdAt: string;
  completedAt: string | null;
  streak: number;
  parsedData?: Array<{ category?: string; quantity?: number; unit?: string; confidence?: number }>;
  title?: string;
  description?: string;
}

const RESET_HOUR = 5; // keep consistent with HabitList/complete route

function cycleStart(d: Date, resetHour = RESET_HOUR) {
  const x = new Date(d);
  if (x.getHours() < resetHour) x.setDate(x.getDate() - 1);
  x.setHours(resetHour, 0, 0, 0);
  x.setMilliseconds(0);
  return x;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function inWindow(ts: Date, start: Date, end: Date) {
  const t = ts.getTime();
  return t >= start.getTime() && t < end.getTime();
}
function inCurrentCycle(ts: Date, now = new Date(), resetHour = RESET_HOUR) {
  const start = cycleStart(now, resetHour);
  const end = addDays(start, 1);
  return inWindow(ts, start, end);
}

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const [showHabitInput, setShowHabitInput] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [userHabits, setUserHabits] = useState<HabitShape[]>([]);
  const [activeTab, setActiveTab] = useState<"habits" | "analytics" | "social">("habits");

  const statsRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!headerRef.current || !statsRef.current) return;
    const headerEl = headerRef.current;
    const statsEls = Array.from(statsRef.current.children) as HTMLElement[];
    const tl = gsap.timeline();
    tl.fromTo(
      headerEl,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    )
      .fromTo(
        statsEls,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: "back.out(1.2)" },
        "-=0.4"
      )
      .fromTo(
        statsEls,
        { scale: 0.95 },
        { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.5)" },
        "-=0.6"
      );
  }, []);

  const handleOpenHabitInput = () => setShowHabitInput(true);
  const triggerRefresh = () => setRefreshTrigger((v) => v + 1);

  const handleHabitsCreated = (habits: ParsedHabit[]) => {
    setShowHabitInput(false);
    triggerRefresh();
    // Note: success toast handled inside AIHabitInput (recommended)
  };
  const handleHabitsUpdated = (habits: any[]) => setUserHabits(habits);
  const handleHabitComplete = () => triggerRefresh();

  // Time windows
  const now = useMemo(() => new Date(), []);
  const start = useMemo(() => cycleStart(now, RESET_HOUR), [now]);
  const end = useMemo(() => addDays(start, 1), [start]);
  const prevStart = useMemo(() => addDays(start, -1), [start]);
  const prevEnd = useMemo(() => start, [start]);

  const totalHabits = userHabits.length;

  // Completions current and previous cycle
  const completedCurrent = useMemo(() => {
    let c = 0;
    for (const h of userHabits) {
      if (!h?.completedAt) continue;
      const t = new Date(h.completedAt);
      if (!isNaN(t.getTime()) && inWindow(t, start, end)) c++;
    }
    return c;
  }, [userHabits, start, end]);

  const completedPrev = useMemo(() => {
    let c = 0;
    for (const h of userHabits) {
      if (!h?.completedAt) continue;
      const t = new Date(h.completedAt);
      if (!isNaN(t.getTime()) && inWindow(t, prevStart, prevEnd)) c++;
    }
    return c;
  }, [userHabits, prevStart, prevEnd]);

  // Completion rates
  const completionRate = useMemo(() => {
    if (totalHabits === 0) return 0;
    return Math.round((completedCurrent / totalHabits) * 100);
  }, [completedCurrent, totalHabits]);

  const prevCompletionRate = useMemo(() => {
    if (totalHabits === 0) return 0;
    return Math.round((completedPrev / totalHabits) * 100);
  }, [completedPrev, totalHabits]);

  const completionDelta = useMemo(() => {
    const diff = completionRate - prevCompletionRate;
    const sign = diff > 0 ? "+" : diff < 0 ? "" : "";
    return `${sign}${diff}%`;
  }, [completionRate, prevCompletionRate]);

  // Active streaks: habits completed in previous or current cycle and streak > 0
  const activeStreaks = useMemo(() => {
    let c = 0;
    for (const h of userHabits) {
      if (!h?.completedAt || !(h?.streak >= 1)) continue;
      const t = new Date(h.completedAt);
      if (!isNaN(t.getTime()) && t.getTime() >= prevStart.getTime()) c++;
    }
    return c;
  }, [userHabits, prevStart]);

  // Proxy previous "active": completions in previous cycle
  const activePrev = useMemo(() => completedPrev, [completedPrev]);

  const activeDelta = useMemo(() => {
    const diff = activeStreaks - activePrev;
    const sign = diff > 0 ? "+" : "";
    return `${sign}${diff}`;
  }, [activeStreaks, activePrev]);

  // Level based on total streak days across all habits
  const totalStreakDays = useMemo(
    () => userHabits.reduce((sum, h) => sum + (Number(h?.streak) || 0), 0),
    [userHabits]
  );

  function levelFromStreak(total: number) {
    if (total >= 60) return "Master";
    if (total >= 30) return "Pro";
    if (total >= 15) return "Achiever";
    if (total >= 5) return "Explorer";
    return "Novice";
  }
  function nextLevelInfo(total: number) {
    const thresholds = [
      { name: "Novice", min: 0 },
      { name: "Explorer", min: 5 },
      { name: "Achiever", min: 15 },
      { name: "Pro", min: 30 },
      { name: "Master", min: 60 },
    ];
    const current = levelFromStreak(total);
    const idx = thresholds.findIndex((t) => t.name === current);
    const next = thresholds[idx + 1];
    if (!next) return { label: "Max level", remaining: 0 };
    const remaining = Math.max(0, next.min - total);
    return { label: `↗ ${remaining} to ${next.name}`, remaining };
  }

  const levelLabel = useMemo(() => levelFromStreak(totalStreakDays), [totalStreakDays]);
  const levelChange = useMemo(() => nextLevelInfo(totalStreakDays).label, [totalStreakDays]);

  // Dynamic stats config
  const dynamicStats = useMemo(
    () => [
      {
        icon: Target,
        label: "Active Streaks",
        value: String(activeStreaks),
        change: activeDelta, // e.g., +2
      },
      {
        icon: TrendingUp,
        label: "Completion Rate",
        value: `${completionRate}%`,
        change: `${completionDelta}`, // e.g., +12%
      },
      {
        icon: Award,
        label: "Level",
        value: levelLabel,
        change: levelChange, // e.g., ↗ 3 to Pro or Max level
      },
    ],
    [activeStreaks, activeDelta, completionRate, completionDelta, levelLabel, levelChange]
  );

  // Loading state (middleware protects access; this is just a friendly spinner)
  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-[#FDECEF] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-b-2 border-[#9D6381] mx-auto mb-3" />
          <p className="text-[#0F110C]/70">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <MobileOptimizedLayout>
      {/* Optional: Use a single Toaster in app/layout.tsx instead */}
      {/* <Toaster position="top-right" richColors closeButton theme="light" /> */}

      <div className="min-h-screen bg-[#FDECEF] ">
        {/* Animated background overlay */}
        <div className="fixed inset-0 opacity-10 bg-gradient-to-br from-[#9D6381] to-[#612940]" />

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header */}
          <div ref={headerRef} className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#612940] to-[#9D6381] bg-clip-text text-transparent">
                  Habit Dashboard
                </h1>
                <p className="text-[#0F110C]/70 mt-2">Your AI-powered journey to better habits</p>
              </div>
              <Button
                onClick={handleOpenHabitInput}
                className="bg-gradient-to-r from-[#612940] to-[#9D6381] hover:from-[#9D6381] hover:to-[#0F110C] text-[#FDECEF] font-semibold px-6 py-3 shadow-lg transition-transform transform hover:-translate-y-1"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Habit
              </Button>
            </div>
          </div>

          {/* Stats Cards (now dynamic) */}
          <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {dynamicStats.map((stat) => (
              <Card
                key={stat.label}
                className="backdrop-blur-lg bg-[#FDECEF]/50 border-2 border-[#612940] hover:bg-[#FDECEF]/70 transition-transform hover:scale-105 cursor-pointer"
              >
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-[#0F110C]/70">
                    {stat.label}
                  </CardTitle>
                  <stat.icon className="w-4 h-4 text-[#612940]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#0F110C]">{stat.value}</div>
                  <p className="text-sm text-[#9D6381] mt-1">{stat.change}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mobile Tabs */}
          <div className="flex md:hidden mb-6 rounded-lg p-1 bg-[#FDECEF]/60 border border-[#612940]/20">
            <Button
              variant={activeTab === "habits" ? "default" : "ghost"}
              onClick={() => setActiveTab("habits")}
              className={`flex-1 ${
                activeTab === "habits" ? "bg-[#612940] text-[#FDECEF]" : "text-[#0F110C]/70 hover:text-[#612940]"
              }`}
            >
              Habits
            </Button>
            <Button
              variant={activeTab === "analytics" ? "default" : "ghost"}
              onClick={() => setActiveTab("analytics")}
              className={`flex-1 ${
                activeTab === "analytics" ? "bg-[#9D6381] text-[#FDECEF]" : "text-[#0F110C]/70 hover:text-[#612940]"
              }`}
            >
              <ChartBar className="w-4 h-4 mr-2" />
              Stats
            </Button>
            <Button
              variant={activeTab === "social" ? "default" : "ghost"}
              onClick={() => setActiveTab("social")}
              className={`flex-1 ${
                activeTab === "social" ? "bg-[#612940] text-[#FDECEF]" : "text-[#0F110C]/70 hover:text-[#612940]"
              }`}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Analytics + Habits */}
              <div className="lg:col-span-2 space-y-8">
                <div className="rounded-xl border border-[#612940]/20 bg-[#FDECEF]/40 p-4">
                  <AdvancedAnalytics habits={userHabits} refreshTrigger={refreshTrigger} />
                </div>
                <div className="rounded-xl border border-[#612940]/20 bg-[#FDECEF]/40 p-4">
                  <HabitList
                    refreshTrigger={refreshTrigger as any}
                    onHabitsUpdated={handleHabitsUpdated as any}
                    onHabitComplete={handleHabitComplete as any}
                  />
                </div>
              </div>

              {/* Right: Social + Quick cards */}
              <div className="space-y-6">
                <SocialSharing habits={userHabits} completionRate={completionRate} />

                {/* Today's Summary */}
                <div className="rounded-xl p-6 border border-[#612940]/20 bg-[#FDECEF]/50">
                  <h3 className="font-semibold text-[#0F110C] mb-4">Today&apos;s Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#0F110C]/70">Habits Tracked</span>
                      <span className="font-semibold text-[#0F110C]">{totalHabits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#0F110C]/70">Completed</span>
                      <span className="font-semibold text-[#612940]">{completedCurrent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#0F110C]/70">Completion Rate</span>
                      <span className="font-semibold text-[#9D6381]">{completionRate}%</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <Card className="backdrop-blur-lg bg-[#FDECEF]/50 border-2 border-[#612940]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#0F110C]">
                      <Target className="w-5 h-5 text-[#612940]" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {["Morning routine", "Workout", "Meditation", "Reading"].map((action) => (
                      <Button
                        key={action}
                        variant="outline"
                        className="w-full justify-start border-[#9D6381] text-[#0F110C] hover:bg-[#9D6381]/10"
                        onClick={handleOpenHabitInput}
                      >
                        {action}
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card className="backdrop-blur-lg bg-[#FDECEF]/50 border-2 border-[#612940]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#0F110C]">
                      <Award className="w-5 h-5 text-[#9D6381]" />
                      Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { name: "First Habit", progress: 100 },
                      { name: "3-Day Streak", progress: 100 },
                      { name: "5 Habits", progress: Math.min(100, totalHabits >= 5 ? 100 : (totalHabits / 5) * 100) },
                      { name: "Weekly Master", progress: Math.min(100, Math.round((completedCurrent / Math.max(1, totalHabits)) * 100)) },
                    ].map((ach) => (
                      <div key={ach.name} className="space-y-1">
                        <div className="flex justify-between text-sm text-[#0F110C]">
                          <span>{ach.name}</span>
                          <span>{Math.round(ach.progress)}%</span>
                        </div>
                        <div className="w-full bg-[#0F110C]/10 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#612940] to-[#9D6381] h-2 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${Math.round(ach.progress)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Mobile: show one tab at a time */}
          <div className="md:hidden">
            {activeTab === "habits" && (
              <div className="rounded-xl border border-[#612940]/20 bg-[#FDECEF]/40 p-4">
                <HabitList
                  refreshTrigger={refreshTrigger as any}
                  onHabitsUpdated={handleHabitsUpdated as any}
                  onHabitComplete={handleHabitComplete as any}
                />
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="rounded-xl border border-[#612940]/20 bg-[#FDECEF]/40 p-4">
                <AdvancedAnalytics habits={userHabits} refreshTrigger={refreshTrigger} />
              </div>
            )}

            {activeTab === "social" && (
              <div className="rounded-xl border border-[#612940]/20 bg-[#FDECEF]/40 p-4">
                <SocialSharing habits={userHabits} completionRate={completionRate} />
              </div>
            )}
          </div>
        </div>

        {/* AI Input Modal */}
        {showHabitInput && (
          <AIHabitInput
            onHabitsCreated={handleHabitsCreated}
            onClose={() => setShowHabitInput(false)}
          />
        )}
      </div>
    </MobileOptimizedLayout>
  );
}
