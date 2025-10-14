// lib/auth-utils.ts
import { getServerSession } from "next-auth";
import { authConfig } from "./auth";

export async function getCurrentUser() {
  const session = await getServerSession(authConfig);
  
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }
  
  return session.user;
}