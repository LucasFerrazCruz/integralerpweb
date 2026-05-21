import { useRole } from "@/hooks/useRole";
import { signOut } from "next-auth/react";
import { AdminMenu } from "./AdminMenu";
import { SearchInput } from "./SearchInput";
import { CarrinhoIcon } from "./CarrinhoIcon";
import Link from "next/link";
import { CategoriesMenu } from "./CategoriasMenu";

export function Header() {
  const { isAdmin, isDistribuidor, status } = useRole();

  const showAdminMenu = isAdmin || isDistribuidor;
  const isLoggedOut = status === "unauthenticated";
  const isCliente = !showAdminMenu && !isLoggedOut;

  async function handleLogout() {
    // signOut limpa os cookies do NextAuth automaticamente
    await signOut({
      redirect: true,
      callbackUrl: "/login", // Para onde o usuário vai após sair
    });
  }

  return (
    <header className="flex flex-col w-full bg-white">
      {/* BARRA SUPERIOR - Fundo Preto */}
      <div className="bg-zinc-950 text-white min-h-10 py-2 sm:py-0 flex items-center">
        <div className="max-w-[1440px] w-full mx-auto flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 gap-2 text-xs">
          <div className="font-bold tracking-tighter text-sm">
            <Link href="/catalogo/categorias" className="hover:opacity-80">
              GR Tools
            </Link>
          </div>
          <div className="flex items-center gap-6 sm:gap-8 font-medium">
            <Link
              href="/usuarios"
              className="hover:text-gray-300 transition-colors"
            >
              Minha Conta
            </Link>
            <Link
              href="/pedidos"
              className="hover:text-gray-300 transition-colors"
            >
              Meus Pedidos
            </Link>
            {isLoggedOut ? (
              <Link href="/login" className="font-semibold hover:underline">
                Entrar
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 font-semibold transition-colors"
              >
                Sair
              </button>
            )}
          </div>
        </div>
      </div>

      {/* BARRA INFERIOR - Fundo Branco */}
      <div className="bg-white border-b min-h-20 py-4 sm:py-0 flex items-center shadow-sm">
        <div className="max-w-[1440px] w-full mx-auto flex flex-col md:flex-row items-center justify-between px-4 sm:px-8 gap-4">
          {/* LADO ESQUERDO - Menu (Oculto em telas menores que MD para não amassar) */}
          <div className="w-full md:w-64 flex-none hidden md:block">
            {showAdminMenu ? <AdminMenu /> : <CategoriesMenu />}
          </div>

          {/* CENTRO - Barra de Pesquisa (Ocupa 100% no mobile) */}
          <div className="w-full md:flex-1 flex justify-center order-3 md:order-2">
            <div className="w-full max-w-xl md:px-6">
              <SearchInput />
            </div>
          </div>

          {/* LADO DIREITO - Carrinho e Menu Simplificado Mobile */}
          <div className="w-full md:w-64 flex-none flex justify-between md:justify-end items-center order-2 md:order-3">
            {/* Menu Administrativo visível apenas no Mobile aqui */}
            <div className="block md:hidden scale-90 origin-left">
              {showAdminMenu ? <AdminMenu /> : <CategoriesMenu />}
            </div>

            <div className="flex items-center">
              <CarrinhoIcon />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
