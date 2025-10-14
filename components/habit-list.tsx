// components/habit-list.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Clock,
  TrendingUp,
  RefreshCw,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

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

const RESET_HOUR = 5;

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

  // Delete modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        toast.error("Could not load habits. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching habits:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCompleteHabit = async (habitId: string) => {
    setCompletingHabit(habitId);
    try {
      const response = await fetch(`/api/habits/${habitId}/complete`, { method: "PATCH" });
      if (response.ok) {
        onHabitComplete?.(habitId);
        await fetchHabits(true);
      } else {
        toast.error("Could not update habit for now. Please try again.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setCompletingHabit(null);
    }
  };

  const openDeleteConfirm = (habitId: string) => {
    setPendingDeleteId(habitId);
    setConfirmOpen(true);
  };

  const handleDeleteHabit = async () => {
    if (!pendingDeleteId) return;
    setDeletingId(pendingDeleteId);
    const tid = toast.loading("Deleting habit...");
    try {
      const res = await fetch(`/api/habits/${pendingDeleteId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Habit removed.", { id: tid });
        setConfirmOpen(false);
        setPendingDeleteId(null);
        await fetchHabits(true);
      } else {
        toast.error("Could not delete habit. Please try again.", { id: tid });
      }
    } catch (e) {
      toast.error("Something went wrong. Please try again.", { id: tid });
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [refreshTrigger]);

  useEffect(() => {
    const now = new Date();
    const next = nextCycleStart(now, RESET_HOUR);
    const ms = next.getTime() - now.getTime();
    const id = setTimeout(() => fetchHabits(true), ms + 1000);
    return () => clearTimeout(id);
  }, [habits.length]);

  const handleRefresh = () => fetchHabits(true);

  const getCategoryColor = (category: string) => {
    // Palette-adapted tags (all within scheme)
    const styles = {
      health: "bg-[#612940]/10 text-[#612940] border-[#612940]/30",
      fitness: "bg-[#9D6381]/10 text-[#9D6381] border-[#9D6381]/30",
      work: "bg-[#0F110C]/10 text-[#0F110C] border-[#0F110C]/20",
      learning: "bg-[#612940]/10 text-[#612940] border-[#612940]/30",
      self_care: "bg-[#9D6381]/10 text-[#9D6381] border-[#9D6381]/30",
      other: "bg-[#0F110C]/10 text-[#0F110C] border-[#0F110C]/20",
    } as const;
    return (styles as any)[category] || styles.other;
  };

  if (loading) {
    return (
      <Card className="bg-[#FDECEF]/40 border border-[#612940]/20">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9D6381]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (habits.length === 0) {
    return (
      <Card className="bg-[#FDECEF]/40 border border-[#612940]/20">
        <CardContent className="text-center p-12">
          <TrendingUp className="w-16 h-16 text-[#0F110C]/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#0F110C] mb-2">No habits yet</h3>
          <p className="text-[#0F110C]/70 mb-6">Start by adding your first habit with AI</p>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="border-[#612940] text-[#0F110C] hover:bg-[#612940]/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Delete Confirmation Modal */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="bg-[#FDECEF] border border-[#612940]/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0F110C]">Delete habit?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#0F110C]/70">
              This action cannot be undone. The habit will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#612940] text-[#0F110C] hover:bg-[#612940]/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteHabit}
              disabled={!!deletingId}
              className="bg-gradient-to-r from-[#612940] to-[#9D6381] hover:from-[#9D6381] hover:to-[#0F110C] text-[#FDECEF]"
            >
              {deletingId ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-[#0F110C]">
            Your Habits ({habits.length})
          </h2>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={refreshing}
            className="border-[#612940]/30 text-[#0F110C] hover:bg-[#612940]/10"
          >
            {refreshing ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#9D6381]" />
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
              className={`transition-all duration-300 group border ${
                completedThisCycle
                  ? "border-[#612940]/30 bg-[#612940]/5"
                  : "border-[#612940]/20 bg-[#FDECEF]/40 hover:border-[#9D6381]/40"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3
                        className={`font-semibold text-lg transition-colors ${
                          completedThisCycle
                            ? "text-[#612940]"
                            : "text-[#0F110C] group-hover:text-[#9D6381]"
                        }`}
                      >
                        {habit.title}
                      </h3>

                      {habit.streak > 0 && (
                        <Badge
                          variant="outline"
                          className="bg-[#9D6381]/10 text-[#9D6381] border-[#9D6381]/30"
                        >
                          <Star className="w-3 h-3 mr-1" />
                          {habit.streak} day{habit.streak !== 1 ? "s" : ""}
                        </Badge>
                      )}

                      {habit.parsedData?.[0] && (
                        <Badge
                          variant="outline"
                          className={getCategoryColor(habit.parsedData[0].category)}
                        >
                          {habit.parsedData[0].category.replace("_", " ")}
                        </Badge>
                      )}
                    </div>

                    {habit.description && (
                      <p className="text-sm text-[#0F110C]/70 mb-3">{habit.description}</p>
                    )}

                    {habit.parsedData?.[0] && (
                      <div className="flex items-center gap-4 text-sm text-[#0F110C]/80">
                        <span>
                          {habit.parsedData[0].quantity} {habit.parsedData[0].unit}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor:
                                habit.parsedData[0].confidence > 0.8
                                  ? "#612940"
                                  : habit.parsedData[0].confidence > 0.6
                                  ? "#9D6381"
                                  : "#0F110C",
                            }}
                          />
                          {Math.round(habit.parsedData[0].confidence * 100)}% confidence
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {/* Complete */}
                    <Button
                      onClick={() => handleCompleteHabit(habit.id)}
                      disabled={completingHabit === habit.id || completedThisCycle}
                      variant="ghost"
                      size="sm"
                      className={`transition-all duration-300 ${
                        completedThisCycle
                          ? "text-[#612940] bg-[#612940]/10 hover:bg-[#612940]/20"
                          : "text-[#0F110C]/50 hover:text-[#9D6381] hover:bg-[#9D6381]/10"
                      }`}
                      title={
                        completedThisCycle
                          ? "Already completed this cycle"
                          : "Mark as complete"
                      }
                    >
                      {completingHabit === habit.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                      ) : (
                        <CheckCircle
                          className={`w-4 h-4 ${completedThisCycle ? "" : ""}`}
                        />
                      )}
                    </Button>

                    {/* Delete */}
                    <Button
                      onClick={() => openDeleteConfirm(habit.id)}
                      variant="ghost"
                      size="sm"
                      className="text-[#9D6381] hover:text-[#612940] hover:bg-[#612940]/10"
                      title="Delete habit"
                    >
                      {deletingId === habit.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#612940]/15">
                  <div className="flex items-center gap-2 text-xs text-[#0F110C]/60">
                    <Clock className="w-3 h-3" />
                    {new Date(habit.createdAt).toLocaleDateString()}
                    {completedThisCycle && (
                      <span className="text-[#612940] ml-2">• Completed this cycle</span>
                    )}
                  </div>

                  {/* Streak visualization */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((day) => (
                      <div
                        key={day}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          day <= habit.streak
                            ? "bg-[#9D6381]"
                            : "bg-[#0F110C]/10 hover:bg-[#612940]"
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
    </>
  );
}
