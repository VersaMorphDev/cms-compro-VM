import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session-token";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-cms-pathname", pathname);

  // Allow login page to handle its own session redirect / form submission
  if (pathname === "/login") {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const rawToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(rawToken);

  if (!session) {
    // Allow Server Actions to reach safeAction() auth guard so the client
    // receives a friendly ActionResult error instead of a broken POST redirect.
    if (request.headers.has("next-action")) {
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    const loginUrl = new URL("/login", request.url);
    if (pathname && pathname !== "/") {
      loginUrl.searchParams.set("next", `${pathname}${search}`);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!api/v1|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
  ],
};
