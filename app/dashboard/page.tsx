// app/dashboard/page.tsx - UPDATED WITH TOASTER
"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import gsap from "gsap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Target, Award, Share2, BarChart as ChartBar } from "lucide-react";
import { HabitList } from "@/components/habit-list";
import { AIHabitInput } from "@/components/ai-habit-input";
import { AdvancedAnalytics } from "@/components/advanced-analytics";
import { SocialSharing } from "@/components/social-sharing";

const stats = [
  { icon: Target, label: "Active Streaks", value: "3", change: "+2" },
  { icon: TrendingUp, label: "Completion Rate", value: "87%", change: "+12%" },
  { icon: Award, label: "Level", value: "Novice", change: "↗ Pro" },
];

const RESET_HOUR = 5; // keep consistent with HabitList/complete route

function cycleStart(d: Date, resetHour = RESET_HOUR) {
  const x = new Date(d);
  if (x.getHours() < resetHour) x.setDate(x.getDate() - 1);
  x.setHours(resetHour, 0, 0, 0);
  x.setMilliseconds(0);
  return x;
}
function inCurrentCycle(ts: Date, now = new Date(), resetHour = RESET_HOUR) {
  const start = cycleStart(now, resetHour);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const t = ts.getTime();
  return t >= start.getTime() && t < end.getTime();
}

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const [showHabitInput, setShowHabitInput] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [userHabits, setUserHabits] = useState<any[]>([]);
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
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "back.out(1.2)",
        },
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

  const handleHabitsCreated = () => {
    setShowHabitInput(false);
    triggerRefresh();
    // Note: The actual success toast is now handled in AIHabitInput component
  };
  const handleHabitsUpdated = (habits: any[]) => setUserHabits(habits);
  const handleHabitComplete = () => triggerRefresh();

  // Boundary-aware completion rate for today's cycle
  const now = useMemo(() => new Date(), []);
  const completionRate = useMemo(() => {
    if (userHabits.length === 0) return 0;
    let completed = 0;
    for (const h of userHabits) {
      if (!h?.completedAt) continue;
      const t = new Date(h.completedAt);
      if (!isNaN(t.getTime()) && inCurrentCycle(t, now)) completed++;
    }
    return Math.round((completed / userHabits.length) * 100);
  }, [userHabits, now]);

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
                <p className="text-[#0F110C]/70 mt-2">
                  Your AI-powered journey to better habits
                </p>
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

          {/* Stats Cards */}
          <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat) => (
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
                  <div className="text-2xl font-bold text-[#0F110C]">
                    {stat.value}
                  </div>
                  <p className="text-sm text-[#9D6381] mt-1">{stat.change} this week</p>
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
                activeTab === "habits"
                  ? "bg-[#612940] text-[#FDECEF]"
                  : "text-[#0F110C]/70 hover:text-[#612940]"
              }`}
            >
              Habits
            </Button>
            <Button
              variant={activeTab === "analytics" ? "default" : "ghost"}
              onClick={() => setActiveTab("analytics")}
              className={`flex-1 ${
                activeTab === "analytics"
                  ? "bg-[#9D6381] text-[#FDECEF]"
                  : "text-[#0F110C]/70 hover:text-[#612940]"
              }`}
            >
              <ChartBar className="w-4 h-4 mr-2" />
              Stats
            </Button>
            <Button
              variant={activeTab === "social" ? "default" : "ghost"}
              onClick={() => setActiveTab("social")}
              className={`flex-1 ${
                activeTab === "social"
                  ? "bg-[#612940] text-[#FDECEF]"
                  : "text-[#0F110C]/70 hover:text-[#612940]"
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
                      <span className="font-semibold text-[#0F110C]">{userHabits.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#0F110C]/70">Completed</span>
                      <span className="font-semibold text-[#612940]">
                        {
                          userHabits.filter(
                            (h) =>
                              h?.completedAt &&
                              inCurrentCycle(new Date(h.completedAt), now)
                          ).length
                        }
                      </span>
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
                      { name: "5 Habits", progress: 60 },
                      { name: "Weekly Master", progress: 30 },
                    ].map((ach) => (
                      <div key={ach.name} className="space-y-1">
                        <div className="flex justify-between text-sm text-[#0F110C]">
                          <span>{ach.name}</span>
                          <span>{ach.progress}%</span>
                        </div>
                        <div className="w-full bg-[#0F110C]/10 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#612940] to-[#9D6381] h-2 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${ach.progress}%` }}
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
  );
}