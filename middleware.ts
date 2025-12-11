import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";

// No authentication required for hackathon demo
export default convexAuthNextjsMiddleware(async () => {
  // Allow all routes without authentication
  return;
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
