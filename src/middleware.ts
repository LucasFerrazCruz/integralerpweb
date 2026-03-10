import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");

  const isLoginPage = request.nextUrl.pathname.startsWith("/login");

  const isERPRoute =
    request.nextUrl.pathname.startsWith("/catalogo") ||
    request.nextUrl.pathname.startsWith("/estoque") ||
    request.nextUrl.pathname.startsWith("/usuarios") ||
    request.nextUrl.pathname.startsWith("/transferencias");

  if (isERPRoute && !token && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/catalogo/:path*",
    "/estoque/:path*",
    "/usuarios/:path*",
    "/transferencias/:path*",
  ],
};
