// components/social-sharing.tsx
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, MessageCircle, Copy, CheckCircle } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";

<FaXTwitter className="w-5 h-5 text-white" />

interface SocialSharingProps {
  habits: Array<{
    completedAt?: string | null;
    streak?: number;
  }>;
  completionRate: number; // % of habits completed in current cycle
}

const RESET_HOUR = 5; // 5 AM local reset

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

export function SocialSharing({ habits, completionRate }: SocialSharingProps) {
  const [copied, setCopied] = useState(false);

  // Palette
  const palette = {
    base: "#FDECEF",
    primary: "#612940",
    secondary: "#9D6381",
    text: "#0F110C",
  };

  const now = useMemo(() => new Date(), []);
  const completedCount = useMemo(() => {
    let c = 0;
    for (const h of habits) {
      if (!h?.completedAt) continue;
      const t = new Date(h.completedAt);
      if (!isNaN(t.getTime()) && inCurrentCycle(t, now)) c++;
    }
    return c;
  }, [habits, now]);

  const longestStreak = useMemo(
    () => Math.max(...habits.map((h) => h.streak || 0), 0),
    [habits]
  );

  const shareText = `I've completed ${completionRate}% of my ${habits.length} habits today! 🚀 Track habits with HabitTracker.`;

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareGeneric = () => {
    if (navigator.share) {
      navigator.share({
        title: "My Habit Progress",
        text: shareText,
        url: window.location.href,
      });
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // no-op
    }
  };

  return (
    <Card className="bg-[#FDECEF]/40 border border-[#612940]/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#0F110C]">
          <Share2 className="w-5 h-5 text-[#612940]" />
          Share Your Progress
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Summary */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 rounded-lg bg-[#FDECEF]/50 border border-[#612940]/15">
            <p className="text-2xl font-bold text-[#612940]">{completedCount}</p>
            <p className="text-xs text-[#0F110C]/70">Completed Today</p>
          </div>
          <div className="p-3 rounded-lg bg-[#FDECEF]/50 border border-[#612940]/15">
            <p className="text-2xl font-bold text-[#9D6381]">{longestStreak}</p>
            <p className="text-xs text-[#0F110C]/70">Day Streak</p>
          </div>
        </div>

        {/* Sharing Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={shareOnTwitter}
            className="bg-gradient-to-r from-[#612940] to-[#9D6381] hover:from-[#9D6381] hover:to-[#0F110C] text-[#FDECEF] font-semibold"
            title="Share on Twitter"
          >
            <FaXTwitter className="w-4 h-4 mr-2" />
            Twitter
          </Button>

          <Button
            onClick={shareGeneric}
            variant="outline"
            className="border-[#9D6381] text-[#0F110C] hover:bg-[#612940]/10"
            title="Share via apps"
          >
            <MessageCircle className="w-4 h-4 mr-2 text-[#612940]" />
            Share
          </Button>
        </div>

        {/* Copy to Clipboard */}
        <Button
          onClick={copyToClipboard}
          variant="outline"
          className="w-full border-[#9D6381] text-[#0F110C] hover:bg-[#612940]/10"
          title="Copy progress"
        >
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2 text-[#612940]" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2 text-[#612940]" />
              Copy Progress
            </>
          )}
        </Button>

        {/* Tip */}
        <div className="text-xs text-[#0F110C]/70 text-center">
          <p>Share your journey and inspire others! 🌟</p>
        </div>
      </CardContent>
    </Card>
  );
}
