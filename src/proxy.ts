import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuthPage =
      req.nextUrl.pathname.startsWith("/login") ||
      req.nextUrl.pathname.startsWith("/register");

    if (token && isAuthPage) {
      const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");

      const targetUrl = callbackUrl || "/catalogo/produtos";

      return NextResponse.redirect(new URL(targetUrl, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // O middleware só executa se a função abaixo retornar true
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Rotas que NÃO precisam de login
        if (
          pathname === "/" ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/register") ||
          pathname.startsWith("/forgot-password") ||
          pathname.startsWith("/catalogo")
        ) {
          return true;
        }

        // Para todas as outras rotas, exige o token (estar logado)
        return !!token;
      },
    },
  },
);

// Define em quais rotas o middleware deve agir
export const config = {
  matcher: [
    "/catalogo/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/estoque/:path*",
    "/pedidos/:path*",
    "/usuarios",
  ],
};
