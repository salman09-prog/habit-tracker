// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Add additional protection logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect dashboard routes
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token; // User must be authenticated
        }
        
        // Allow access to public routes
        return true;
      },
    },
  }
);

// Specify which routes to protect
export const config = {
  matcher: [
    "/dashboard/:path*", // Protect all dashboard routes
    "/api/habits/:path*", // Protect habit API routes
  ],
};