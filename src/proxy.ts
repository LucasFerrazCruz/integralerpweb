import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuthPage =
      req.nextUrl.pathname.startsWith("/login") ||
      req.nextUrl.pathname.startsWith("/register");

    // Se o usuário está logado e tenta ir para login/register, manda para o catálogo
    if (token && isAuthPage) {
      return NextResponse.redirect(new URL("/catalogo/produtos", req.url));
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
