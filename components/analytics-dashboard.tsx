// components/analytics-dashboard.tsx
"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, Target, Award } from "lucide-react";
import gsap from "gsap";

interface AnalyticsDashboardProps {
  habits: any[];            // Receives habits from parent
  refreshTrigger: number;   // Re-runs animations when this changes
}

export function AnalyticsDashboard({ habits, refreshTrigger }: AnalyticsDashboardProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Derived analytics
  const todayStr = new Date().toDateString();
  const completedToday =
    habits.filter((h) => {
      if (!h?.completedAt) return false;
      const d = new Date(h.completedAt);
      return !isNaN(d.getTime()) && d.toDateString() === todayStr;
    }).length || 0;

  const totalHabits = habits.length;
  const completionRate =
    totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  const categoryCount = habits.reduce((acc: Record<string, number>, habit: any) => {
    const cat = habit?.parsedData?.[0]?.category || "other";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  // GSAP animations (guarded)
  useEffect(() => {
    const tl = gsap.timeline();

    // animate progress bars
    if (chartRef.current) {
      const bars = chartRef.current.querySelectorAll(".progress-bar");
      if (bars.length) {
        tl.fromTo(
          bars,
          { scaleX: 0 },
          { scaleX: 1, duration: 1, ease: "power3.out", stagger: 0.15 }
        );
      }
    }

    // animate stats cards
    if (statsRef.current) {
      const cards = Array.from(statsRef.current.children) as HTMLElement[];
      if (cards.length) {
        tl.fromTo(
          cards,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.2)" },
          "-=0.4"
        );
      }
    }
  }, [refreshTrigger]);

  const stats = [
    {
      icon: Target,
      label: "Completed Today",
      value: completedToday,
      total: totalHabits,
    },
    {
      icon: TrendingUp,
      label: "Completion Rate",
      value: `${completionRate}%`,
      description: "Daily goal progress",
    },
    {
      icon: Calendar,
      label: "Active Streak",
      value: "3 days", // TODO: compute actual streak later
      description: "Current streak",
    },
    {
      icon: Award,
      label: "Level",
      value: "Novice",
      description: "Habit master level",
    },
  ];

  const empty = totalHabits === 0;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="bg-[#FDECEF]/40 border border-[#612940]/20 hover:border-[#9D6381]/40 transition-colors"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#0F110C]/70">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#0F110C] mt-1">{stat.value}</p>
                  {"total" in stat && stat.total !== undefined && (
                    <p className="text-xs text-[#0F110C]/60 mt-1">
                      {stat.total} total habits
                    </p>
                  )}
                  {stat.description && (
                    <p className="text-xs text-[#0F110C]/60 mt-1">{stat.description}</p>
                  )}
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-r from-[#612940] to-[#9D6381]">
                  <stat.icon className="w-5 h-5 text-[#FDECEF]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Distribution */}
      <Card className="bg-[#FDECEF]/40 border border-[#612940]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-[#0F110C]">
            <TrendingUp className="w-5 h-5 text-[#612940]" />
            Habit Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          {empty ? (
            <div className="text-sm text-[#0F110C]/70">
              No habits yet. Add habits to see category insights.
            </div>
          ) : (
            <div ref={chartRef} className="space-y-4">
              {Object.entries(categoryCount).map(([category, count]) => {
                const percentage =
                  totalHabits > 0 ? Math.round((count / totalHabits) * 100) : 0;
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize text-[#0F110C]/80">
                        {category.replace("_", " ")}
                      </span>
                      <span className="text-[#0F110C]/60">
                        {count} habits ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#0F110C]/10 rounded-full h-2 overflow-hidden">
                      <div
                        className="progress-bar h-2 rounded-full bg-gradient-to-r from-[#612940] to-[#9D6381] transition-all duration-1000 ease-out"
                        style={{ width: `${percentage}%`, transformOrigin: "left center" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
