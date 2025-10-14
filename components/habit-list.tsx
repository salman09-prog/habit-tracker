// components/habit-list.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, TrendingUp, RefreshCw, Star } from "lucide-react";

interface Habit {
  id: string;
  title: string;
  description: string;
  inputText: string;
  parsedData: any;
  createdAt: string;
  completedAt: string | null;
  streak: number;
}

interface HabitListProps {
  refreshTrigger?: number;
  onHabitsUpdated?: (habits: Habit[]) => void;
  onHabitComplete?: (habitId: string) => void;
}

const RESET_HOUR = 5; // 5 AM local time boundary

function cycleStart(date: Date, resetHour = RESET_HOUR) {
  const d = new Date(date);
  if (d.getHours() < resetHour) d.setDate(d.getDate() - 1);
  d.setHours(resetHour, 0, 0, 0);
  d.setMilliseconds(0);
  return d;
}

function nextCycleStart(from: Date, resetHour = RESET_HOUR) {
  const start = cycleStart(from, resetHour);
  const next = new Date(start);
  next.setDate(next.getDate() + 1);
  return next;
}

function isCompletedThisCycle(completedAt: string | null, resetHour = RESET_HOUR) {
  if (!completedAt) return false;
  const ca = new Date(completedAt);
  if (isNaN(ca.getTime())) return false;
  const start = cycleStart(new Date(), resetHour);
  return ca.getTime() >= start.getTime();
}

export function HabitList({
  refreshTrigger = 0,
  onHabitsUpdated,
  onHabitComplete,
}: HabitListProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completingHabit, setCompletingHabit] = useState<string | null>(null);

  const fetchHabits = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await fetch("/api/habits");
      const data = await response.json();
      if (response.ok) {
        setHabits(data.habits || []);
        onHabitsUpdated?.(data.habits || []);
      } else {
        console.error("Failed to fetch habits:", data.error);
      }
    } catch (error) {
      console.error("Error fetching habits:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCompleteHabit = async (habitId: string) => {
    setCompletingHabit(habitId);
    try {
      const response = await fetch(`/api/habits/${habitId}/complete`, {
        method: "PATCH",
      });
      if (response.ok) {
        onHabitComplete?.(habitId);
        await fetchHabits(true);
      } else {
        console.error("Failed to complete habit");
      }
    } catch (error) {
      console.error("Error completing habit:", error);
    } finally {
      setCompletingHabit(null);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [refreshTrigger]);

  // Auto-refresh right after the next boundary to re-enable the button without manual action
  useEffect(() => {
    const now = new Date();
    const next = nextCycleStart(now, RESET_HOUR);
    const ms = next.getTime() - now.getTime();
    const id = setTimeout(() => fetchHabits(true), ms + 1000);
    return () => clearTimeout(id);
  }, [habits.length]); // re-schedule when habits change

  const handleRefresh = () => fetchHabits(true);

  const getCategoryColor = (category: string) => {
    const colors = {
      health: "bg-green-500/20 text-green-400 border-green-500/30",
      fitness: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      work: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      learning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      self_care: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      other: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  if (loading) {
    return (
      <Card className="glass border-0 backdrop-blur-xl bg-white/5">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (habits.length === 0) {
    return (
      <Card className="glass border-0 backdrop-blur-xl bg-white/5">
        <CardContent className="text-center p-12">
          <TrendingUp className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No habits yet</h3>
          <p className="text-foreground/60 mb-6">Start by adding your first habit with AI</p>
          <Button onClick={handleRefresh} variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">Your Habits ({habits.length})</h2>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={refreshing}
          className="border-white/20 hover:border-cyan-400 hover:text-cyan-400"
        >
          {refreshing ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-cyan-400"></div>
          ) : (
            <RefreshCw className="w-3 h-3 mr-1" />
          )}
          Refresh
        </Button>
      </div>

      {/* Habits List */}
      {habits.map((habit) => {
        const completedThisCycle = isCompletedThisCycle(habit.completedAt);

        return (
          <Card
            key={habit.id}
            className={`glass backdrop-blur-xl transition-all duration-300 group border ${
              completedThisCycle
                ? "border-green-400/30 bg-green-500/5"
                : "border-white/10 hover:border-cyan-400/30 bg-white/5 hover:bg-white/10"
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3
                      className={`font-semibold text-lg transition-colors ${
                        completedThisCycle ? "text-green-400" : "text-foreground group-hover:text-cyan-400"
                      }`}
                    >
                      {habit.title}
                    </h3>

                    {habit.streak > 0 && (
                      <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                        <Star className="w-3 h-3 mr-1" />
                        {habit.streak} day{habit.streak !== 1 ? "s" : ""}
                      </Badge>
                    )}

                    {habit.parsedData?.[0] && (
                      <Badge variant="outline" className={getCategoryColor(habit.parsedData[0].category)}>
                        {habit.parsedData[0].category.replace("_", " ")}
                      </Badge>
                    )}
                  </div>

                  {habit.description && <p className="text-foreground/60 text-sm mb-3">{habit.description}</p>}

                  {habit.parsedData?.[0] && (
                    <div className="flex items-center gap-4 text-sm text-foreground/70">
                      <span>
                        {habit.parsedData[0].quantity} {habit.parsedData[0].unit}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            habit.parsedData[0].confidence > 0.8
                              ? "bg-green-400"
                              : habit.parsedData[0].confidence > 0.6
                              ? "bg-yellow-400"
                              : "bg-red-400"
                          }`}
                        />
                        {Math.round(habit.parsedData[0].confidence * 100)}% confidence
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    onClick={() => handleCompleteHabit(habit.id)}
                    disabled={completingHabit === habit.id || completedThisCycle}
                    variant="ghost"
                    size="sm"
                    className={`transition-all duration-300 cursor-pointer${
                      completedThisCycle
                        ? " text-green-400 bg-green-400/10 hover:bg-green-400/20"
                        : " text-foreground/40 hover:text-cyan-400 hover:bg-cyan-400/10"
                    }`}
                    title={completedThisCycle ? "Already completed this cycle" : "Mark as complete"}
                  >
                    {completingHabit === habit.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : (
                      <CheckCircle className={`w-4 h-4 ${completedThisCycle ? "fill-green-400" : ""}`} />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-foreground/50">
                  <Clock className="w-3 h-3" />
                  {new Date(habit.createdAt).toLocaleDateString()}
                  {completedThisCycle && <span className="text-green-400 ml-2">• Completed this cycle</span>}
                </div>

                {/* Streak visualization */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((day) => (
                    <div
                      key={day}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        day <= habit.streak ? "bg-amber-400" : "bg-white/10 hover:bg-cyan-400"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
