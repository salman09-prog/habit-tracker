// components/ai-habit-input.tsx - UPDATED WITH TOAST
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, CheckCircle, Zap, X } from "lucide-react";
import { toast } from "sonner"; // Import toast

interface ParsedHabit {
  activity: string;
  quantity: number;
  unit: string;
  category: string;
  confidence: number;
}

interface AIHabitInputProps {
  onHabitsCreated: (habits: ParsedHabit[]) => void;
  onClose: () => void;
}

export function AIHabitInput({ onHabitsCreated, onClose }: AIHabitInputProps) {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parsedHabits, setParsedHabits] = useState<ParsedHabit[]>([]);
  const [step, setStep] = useState<"input" | "review" | "success">("input");
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  useEffect(() => {
    if (step === "input") {
      setParsedHabits([]);
      textareaRef.current?.focus();
    }
  }, [step]);

  const handleParseHabits = useCallback(async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputText }),
      });
      const data = await res.json();
      console.log("ai-habit-input-data :-",data);
      if (data.parsedHabits?.length) {
        setParsedHabits(data.parsedHabits);
        setStep("review");
      } else {
        toast.error("No habits detected. Try being more specific!");
      }
    } catch (error) {
      toast.error("Failed to parse habits. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [inputText]);

  const handleConfirmHabits = useCallback(() => {
    // Show success toast

    toast.success("Habit added successfully")
    onHabitsCreated(parsedHabits);
    setStep("success");
    setTimeout(onClose, 1500);
  }, [parsedHabits, onHabitsCreated, onClose]);

  const examples = [
    "I ran 3 miles and drank 8 glasses of water today",
    "Meditated for 15 minutes, read 20 pages, did 30 pushups",
    "Slept 7 hours, avoided coffee after 2 PM, walked 10k steps",
  ];

  if (step === "success") {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4 bg-[#FDECEF]/15 border border-[#9D6381]">
          <CardContent className="flex flex-col items-center py-12">
            <CheckCircle className="w-16 h-16 text-[#612940] mb-4" />
            <h3 className="text-xl font-semibold text-[#0F110C] mb-2">
              Habits Added!
            </h3>
            <p className="text-[#0F110C]/70 text-center">
              Your habits have been successfully tracked
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="AI habit input"
    >
      <div ref={containerRef} className="w-full max-w-2xl">
        <Card className="bg-[#FDECEF]/20 border border-[#9D6381] shadow-lg">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-[#0F110C]">
              <Sparkles className="w-5 h-5 text-[#9D6381]" />
              {step === "input" ? "Add Habits with AI" : "Review Parsed Habits"}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close"
              className="text-[#0F110C]/60 hover:text-[#612940] hover:bg-[#9D6381]/10"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>

          <CardContent>
            {step === "input" ? (
              <div className="space-y-6">
                <Textarea
                  ref={textareaRef}
                  placeholder="Tell me about your day..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value.slice(0, 500))}
                  className="min-h-[120px] resize-none bg-[#FDECEF]/30 border border-[#9D6381]/40 focus:border-[#612940] focus:ring-0"
                />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#0F110C]/60">
                    {inputText.length}/500
                  </span>
                  <Button
                    onClick={handleParseHabits}
                    disabled={!inputText.trim() || isLoading}
                    className="bg-gradient-to-r from-[#9D6381] to-[#612940] hover:from-[#612940] hover:to-[#0F110C] text-[#FDECEF] font-semibold"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Parsing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Parse
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-[#0F110C]/60">Try examples:</p>
                  <div className="grid gap-2">
                    {examples.map((ex, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setInputText(ex)}
                        className="text-left p-3 rounded-lg border border-[#9D6381]/60 hover:border-[#612940] hover:bg-[#612940]/10 transition text-sm text-[#0F110C]"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-3">
                  {parsedHabits.map((habit, i) => (
                    <Card key={i} className="bg-[#FDECEF]/30 border border-[#9D6381]">
                      <CardContent className="p-4 flex justify-between">
                        <div>
                          <h4 className="font-semibold text-[#0F110C] capitalize">
                            {habit.activity}
                          </h4>
                          <p className="text-sm text-[#0F110C]/70">
                            {habit.quantity} {habit.unit} • {habit.category}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-3 h-3 rounded-full ${
                              habit.confidence > 0.8
                                ? "bg-[#612940]"
                                : habit.confidence > 0.6
                                ? "bg-[#9D6381]"
                                : "bg-[#0F110C]"
                            }`}
                          />
                          <span className="text-xs text-[#0F110C]/60">
                            {Math.round(habit.confidence * 100)}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep("input")}
                    className="border-[#9D6381] hover:border-[#612940] text-[#0F110C]"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleConfirmHabits}
                    className="bg-gradient-to-r from-[#9D6381] to-[#612940] hover:from-[#612940] hover:to-[#0F110C] text-[#FDECEF] font-semibold"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}