// components/navbar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Testimonials", href: "#testimonials" },
  // { label: "Pricing", href: "#pricing" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const closeOnOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, []);

  if (status === "loading") {
    return (
      <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-300 backdrop-blur-md bg-[#FDECEF]/80 py-3">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2 select-none">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-[#612940] to-[#9D6381] animate-pulse" />
            <span className="text-xl font-extrabold bg-gradient-to-r from-[#612940] to-[#9D6381] bg-clip-text text-transparent tracking-tight">
              HabitTracker
            </span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 backdrop-blur-md",
        isScrolled ? "bg-[#FDECEF]/80 shadow-md py-2" : "bg-transparent py-4"
      )}
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 select-none">
          <div className="w-9 h-9 bg-gradient-to-r from-[#612940] to-[#9D6381] rounded-lg flex items-center justify-center">
            <span className="text-[#FDECEF] font-bold text-sm">HT</span>
          </div>
          <span className="text-xl font-extrabold bg-gradient-to-r from-[#612940] to-[#9D6381] bg-clip-text text-transparent tracking-tight">
            HabitTracker
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-[#0F110C]/80 hover:text-[#612940] transition-colors duration-200 font-medium"
            >
              {label}
            </Link>
          ))}

          {session ? (
            <>
              <Button
                asChild
                className="bg-gradient-to-r from-[#612940] to-[#9D6381] hover:from-[#9D6381] hover:to-[#0F110C] text-[#FDECEF] font-semibold"
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 text-[#0F110C]/80 hover:text-[#612940] transition-colors"
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#612940] to-[#9D6381] flex items-center justify-center">
                    <User className="w-4 h-4 text-[#FDECEF]" />
                  </div>
                  <span className="font-medium">
                    {session.user?.name || session.user?.email}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-[#FDECEF]/95 rounded-lg border border-[#612940]/30 backdrop-blur-md shadow-lg py-2"
                    role="menu"
                  >
                    <div className="px-3 py-2 text-sm text-[#0F110C]/70 border-b border-[#612940]/20">
                      {session.user?.email}
                    </div>
                    <Link
                      href="/settings"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-[#612940]/10 transition-colors flex items-center gap-2 text-[#0F110C]"
                      onClick={() => setIsUserMenuOpen(false)}
                      role="menuitem"
                    >
                      <Settings className="w-4 h-4 text-[#612940]" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-[#612940]/10 transition-colors flex items-center gap-2 text-[#9D6381]"
                      role="menuitem"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Button
              onClick={() => signIn()}
              className="bg-gradient-to-r from-[#612940] to-[#9D6381] hover:from-[#9D6381] hover:to-[#0F110C] text-[#FDECEF] font-semibold"
            >
              Sign In
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          aria-label="Toggle mobile menu"
          className="md:hidden p-2 text-[#0F110C]"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden bg-[#FDECEF]/90 backdrop-blur-md mt-2 mx-4 rounded-lg p-4 animate-in fade-in slide-in-from-top-5 duration-300 shadow-lg"
          role="menu"
        >
          <div className="flex flex-col space-y-3">
            {session ? (
              <>
                <div className="pb-3 border-b border-[#612940]/20">
                  <p className="text-[#0F110C] font-medium">
                    {session.user?.name || "Account"}
                  </p>
                  <p className="text-[#0F110C]/70 text-sm">
                    {session.user?.email}
                  </p>
                </div>
                {NAV_ITEMS.map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="text-[#0F110C]/80 hover:text-[#612940] transition-colors duration-200 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
                <Link
                  href="/dashboard"
                  className="text-left py-2 text-[#0F110C] hover:text-[#612940]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="text-left py-2 flex items-center gap-2 text-[#9D6381] hover:text-[#612940]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                {NAV_ITEMS.map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="text-[#0F110C]/80 hover:text-[#612940] transition-colors duration-200 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
                <Button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signIn();
                  }}
                  className="bg-gradient-to-r from-[#612940] to-[#9D6381] hover:from-[#9D6381] hover:to-[#0F110C] text-[#FDECEF] font-semibold"
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
