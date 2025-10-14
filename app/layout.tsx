import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "HabitTracker - AI-Powered Habit Tracking",
  description: "Transform your habits with AI-powered insights and beautiful tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        <AuthProvider>
        <Navbar/>
        <main className="min-h-screen">
        {children}
        </main>
        <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
