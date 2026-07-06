import { NextResponse, NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("adminAccessToken")?.value;
  const { pathname } = request.nextUrl;

  const isPublicRoute = pathname.startsWith("/login");

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};