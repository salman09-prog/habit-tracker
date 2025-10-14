// app/api/auth/[...nextauth]/route.ts
import { authConfig } from "@/lib/auth";
import NextAuth from "next-auth";

// Create the NextAuth handler
const handler = NextAuth(authConfig);

// Export named HTTP methods for App Router compatibility
export { handler as GET, handler as POST };