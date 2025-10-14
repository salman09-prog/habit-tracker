// components/mobile-optimized-layout.tsx
"use client";

import { useEffect, useState } from "react";
import { Home, Plus, BarChart2 } from "lucide-react";

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
}

export function MobileOptimizedLayout({ children }: MobileOptimizedLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [active, setActive] = useState<"home" | "add" | "stats">("home");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className={`min-h-screen bg-[#FDECEF] ${isMobile ? "pb-20" : ""}`}>
      {/* Palette overlay (subtle) */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-[#9D6381] to-[#612940]" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background:
              "radial-gradient(800px 400px at 20% 10%, rgba(97,41,64,0.25), transparent 60%), radial-gradient(600px 300px at 80% 20%, rgba(157,99,129,0.25), transparent 60%)",
          }}
        />
      </div>

      {/* Content */}
      <div className={`relative z-10 ${isMobile ? "px-4 py-4" : "container mx-auto px-4 py-8"}`}>
        {children}
      </div>

      {/* Bottom nav (mobile only) */}
      {isMobile && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-20 bg-[#FDECEF]/90 backdrop-blur-md border-t border-[#612940]/30 shadow-[0_-6px_16px_rgba(97,41,64,0.08)]"
          role="navigation"
          aria-label="Mobile Navigation"
        >
          <div className="flex justify-around items-center p-2.5">
            {/* Home */}
            <button
              type="button"
              onClick={() => setActive("home")}
              className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
                active === "home"
                  ? "text-[#612940]"
                  : "text-[#0F110C]/70 hover:text-[#612940]"
              }`}
              aria-label="Home"
            >
              <Home className="w-6 h-6" />
              <span className="text-[11px] mt-1">Home</span>
            </button>

            {/* Add */}
            <button
              type="button"
              onClick={() => setActive("add")}
              className="flex flex-col items-center px-3 py-2 rounded-lg"
              aria-label="Add Habit"
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-r from-[#612940] to-[#9D6381] flex items-center justify-center shadow-md shadow-[#612940]/20 ring-1 ring-[#612940]/30">
                <Plus className="w-5 h-5 text-[#FDECEF]" />
              </div>
              <span
                className={`text-[11px] mt-1 ${
                  active === "add" ? "text-[#612940]" : "text-[#0F110C]/70"
                }`}
              >
                Add
              </span>
            </button>

            {/* Stats */}
            <button
              type="button"
              onClick={() => setActive("stats")}
              className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
                active === "stats"
                  ? "text-[#612940]"
                  : "text-[#0F110C]/70 hover:text-[#612940]"
              }`}
              aria-label="Stats"
            >
              <BarChart2 className="w-6 h-6" />
              <span className="text-[11px] mt-1">Stats</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
