// components/advanced-analytics.tsx
"use client";

import { useMemo, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, Target, Award } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface AdvancedAnalyticsProps {
  habits: Array<{
    id: string;
    completedAt?: string | null;
    parsedData?: Array<{ category?: string }>;
  }>;
  refreshTrigger: number;
}

const RESET_HOUR = 5; // 5 AM local reset boundary to match HabitList/complete logic

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

function shortDayLabel(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: "short" }); // Mon, Tue, ...
}

export function AdvancedAnalytics({ habits }: AdvancedAnalyticsProps) {
  const barChartRef = useRef<ChartJS<"bar">>(null);
  const lineChartRef = useRef<ChartJS<"line">>(null);
  const doughnutChartRef = useRef<ChartJS<"doughnut">>(null);

  const now = useMemo(() => new Date(), []);
  const startOfToday = useMemo(() => cycleStart(now), [now]);

  const completedToday = useMemo(() => {
    const endOfToday = addDays(startOfToday, 1);
    let count = 0;
    for (const h of habits) {
      if (!h.completedAt) continue;
      const t = new Date(h.completedAt);
      if (!isNaN(t.getTime()) && inWindow(t, startOfToday, endOfToday)) count++;
    }
    return count;
  }, [habits, startOfToday]);

  const totalHabits = habits.length;
  const todayCompletionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  // Last 7 cycles (ending today), left-to-right oldest -> newest
  const last7 = useMemo(() => {
    const arr: { label: string; start: Date; end: Date }[] = [];
    for (let i = 6; i >= 0; i--) {
      const start = addDays(startOfToday, -i);
      const end = addDays(start, 1);
      arr.push({ label: shortDayLabel(start), start, end });
    }
    return arr;
  }, [startOfToday]);

  const last7Counts = useMemo(() => {
    return last7.map(({ start, end }) => {
      let c = 0;
      for (const h of habits) {
        if (!h.completedAt) continue;
        const t = new Date(h.completedAt);
        if (!isNaN(t.getTime()) && inWindow(t, start, end)) c++;
      }
      return c;
    });
  }, [habits, last7]);

  // Last 4 weeks (blocks of 7 cycles). Latest block is week 4
  const last4Weeks = useMemo(() => {
    const weeks: { label: string; start: Date; end: Date }[] = [];
    const thisWeekStart = addDays(startOfToday, -6); // inclusive 7-day span ending today
    for (let i = 3; i >= 0; i--) {
      const start = addDays(thisWeekStart, -7 * i);
      const end = addDays(start, 7);
      weeks.push({ label: `Week ${4 - i}`, start, end });
    }
    return weeks;
  }, [startOfToday]);

  const weeklyRates = useMemo(() => {
    return last4Weeks.map(({ start, end }) => {
      // Total possible completions per block = totalHabits * 7
      if (totalHabits === 0) return 0;
      let comps = 0;
      for (const h of habits) {
        if (!h.completedAt) continue;
        const t = new Date(h.completedAt);
        if (!isNaN(t.getTime()) && inWindow(t, start, end)) comps++;
      }
      const possible = totalHabits * 7;
      return Math.round((comps / possible) * 100);
    });
  }, [habits, last4Weeks, totalHabits]);

  // Category distribution
  const categoryCount = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const h of habits) {
      const cat = h.parsedData?.[0]?.category || "other";
      acc[cat] = (acc[cat] || 0) + 1;
    }
    return acc;
  }, [habits]);

  // Palette
  const palette = {
    base: "#FDECEF",
    primary: "#612940",
    secondary: "#9D6381",
    text: "#0F110C",
    neutral: "#CECCCC",
  };

  // Helper alphas
  const rgba = (hex: string, a: number) => {
    // Simple hex -> rgba converter for #RRGGBB
    const m = hex.replace("#", "");
    const r = parseInt(m.slice(0, 2), 16);
    const g = parseInt(m.slice(2, 4), 16);
    const b = parseInt(m.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
    };

  // Charts data using the palette
  const barChartData: ChartData<"bar"> = {
    labels: last7.map((d) => d.label),
    datasets: [
      {
        label: "Habits Completed",
        data: last7Counts,
        backgroundColor: rgba(palette.secondary, 0.85),
        borderColor: palette.primary,
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: rgba(palette.primary, 0.85),
      },
    ],
  };

  const lineChartData: ChartData<"line"> = {
    labels: last4Weeks.map((w) => w.label),
    datasets: [
      {
        label: "Completion Rate %",
        data: weeklyRates,
        borderColor: palette.primary,
        backgroundColor: rgba(palette.secondary, 0.2),
        pointBackgroundColor: palette.secondary,
        pointBorderColor: palette.primary,
        pointHoverBackgroundColor: palette.primary,
        pointHoverBorderColor: palette.secondary,
        tension: 0.35,
        fill: true,
      },
    ],
  };

  // Doughnut colors cycle through palette variants
  const catLabels = Object.keys(categoryCount);
  const catValues = Object.values(categoryCount);
  const doughnutColors = catLabels.map((_, i) => {
    const seq = [
      rgba(palette.primary, 0.85),
      rgba(palette.secondary, 0.85),
      rgba(palette.text, 0.65),
      rgba(palette.neutral, 0.9),
      rgba(palette.base, 0.9),
    ];
    return seq[i % seq.length];
  });

  const doughnutChartData: ChartData<"doughnut"> = {
    labels: catLabels,
    datasets: [
      {
        data: catValues,
        backgroundColor: doughnutColors,
        borderWidth: 2,
        borderColor: palette.base, // subtle separation on light bg
        hoverBorderColor: palette.secondary,
        hoverBorderWidth: 2,
      },
    ],
  };

  // Shared chart options with palette
  const baseOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: rgba(palette.text, 0.85) as any,
          font: { size: 12 },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      title: {
        display: true,
        color: palette.text,
        font: { size: 16, weight: "bold" },
      },
      tooltip: {
        titleColor: palette.text,
        bodyColor: rgba(palette.text, 0.9),
        backgroundColor: rgba(palette.base, 0.95),
        borderColor: rgba(palette.primary, 0.2),
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: rgba(palette.text, 0.12) },
        ticks: { color: rgba(palette.text, 0.8) },
      },
      x: {
        grid: { color: rgba(palette.text, 0.08) },
        ticks: { color: rgba(palette.text, 0.8) },
      },
    },
  };

  // Stats cards (palette-only)
  const stats = [
    {
      icon: Target,
      label: "Completed Today",
      value: String(completedToday),
      total: totalHabits,
      description: `${todayCompletionRate}% of daily goal`,
      accentFrom: palette.primary,
      accentTo: palette.secondary,
    },
    {
      icon: TrendingUp,
      label: "Current Streak",
      value: "5 days", // placeholder until streak aggregated server-side
      description: "Longest: 12 days",
      accentFrom: palette.primary,
      accentTo: palette.secondary,
    },
    {
      icon: Calendar,
      label: "Weekly Average",
      value:
        weeklyRates.length > 0
          ? `${Math.round(weeklyRates.reduce((a, b) => a + b, 0) / weeklyRates.length)}%`
          : "0%",
      description: "Avg across last 4 weeks",
      accentFrom: palette.primary,
      accentTo: palette.secondary,
    },
    {
      icon: Award,
      label: "Level",
      value: "Explorer",
      description: "Next: Adventurer",
      accentFrom: palette.primary,
      accentTo: palette.secondary,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-[#FDECEF]/40 border border-[#612940]/20 hover:border-[#9D6381]/40 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#0F110C]/70">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#0F110C] mt-1">{stat.value}</p>
                  {"total" in stat && (stat as any).total !== undefined && (
                    <p className="text-xs text-[#0F110C]/60 mt-1">{(stat as any).total} total habits</p>
                  )}
                  {stat.description && <p className="text-xs text-[#0F110C]/60 mt-1">{stat.description}</p>}
                </div>
                <div
                  className="p-3 rounded-lg transition-transform duration-300"
                  style={{
                    background: `linear-gradient(90deg, ${stat.accentFrom}, ${stat.accentTo})`,
                  }}
                >
                  <stat.icon className="w-5 h-5 text-[#FDECEF]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress Bar Chart */}
        <Card className="bg-[#FDECEF]/40 border border-[#612940]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-[#0F110C]">
              <TrendingUp className="w-5 h-5 text-[#612940]" />
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar
                ref={barChartRef}
                data={barChartData}
                options={{
                  ...baseOptions,
                  plugins: {
                    ...baseOptions.plugins,
                    title: {
                      ...baseOptions.plugins?.title,
                      display: true,
                      text: "Habits Completed (Last 7 Days)",
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Progress Trend Line Chart */}
        <Card className="bg-[#FDECEF]/40 border border-[#612940]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-[#0F110C]">
              <Calendar className="w-5 h-5 text-[#9D6381]" />
              Progress Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line
                ref={lineChartRef}
                data={lineChartData}
                options={{
                  ...baseOptions,
                  plugins: {
                    ...baseOptions.plugins,
                    title: {
                      ...baseOptions.plugins?.title,
                      display: true,
                      text: "Completion Rate (Last 4 Weeks)",
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution Doughnut Chart */}
        <Card className="bg-[#FDECEF]/40 border border-[#612940]/20 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-[#0F110C]">
              <Target className="w-5 h-5 text-[#612940]" />
              Habit Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <Doughnut
                ref={doughnutChartRef}
                data={doughnutChartData}
                options={{
                  ...baseOptions,
                  plugins: {
                    ...baseOptions.plugins,
                    title: {
                      ...baseOptions.plugins?.title,
                      display: true,
                      text: "Your Habit Distribution",
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
