import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const publicPaths = [
  "/",
  "/pricing",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/auth/callback",
];

const authPaths = ["/login", "/signup", "/forgot-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  const appDomain = process.env.NEXT_PUBLIC_LANDING_PAGE_DOMAIN || "launchproof.com";

  // Subdomain routing: slug.launchproof.com → /lp/slug
  const subdomain = hostname.replace(`.${appDomain}`, "");
  if (
    subdomain &&
    subdomain !== hostname &&
    subdomain !== "www" &&
    subdomain !== appDomain
  ) {
    const url = request.nextUrl.clone();
    url.pathname = `/lp/${subdomain}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  // Skip middleware for static files and API routes that don't need auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/api/signups") ||
    pathname.startsWith("/lp/") ||
    pathname.match(/\.(ico|png|jpg|svg|css|js)$/)
  ) {
    return NextResponse.next();
  }

  const { user, supabaseResponse } = await updateSession(request);

  // Redirect authenticated users away from auth pages
  if (user && authPaths.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Protect platform routes
  const isPublicPath = publicPaths.some(
    (p) => pathname === p || pathname.startsWith("/api/")
  );
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
