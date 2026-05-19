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
    <header className="flex flex-col w-full">
      {/* BARRA SUPERIOR - Fundo Preto */}
      <div className="bg-zinc-950 text-white h-10">
        <div className="max-w-[1400px] mx-auto h-full flex items-center justify-between px-8 text-xs">
          <div className="font-bold tracking-tighter text-sm">
            <Link href="/catalogo/categorias">GR Tools</Link>
          </div>
          <div className="flex items-center gap-8">
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
              <Link
                href="/login"
                className="text-sm font-medium hover:underline"
              >
                Entrar
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 font-medium"
              >
                Sair
              </button>
            )}
          </div>
        </div>
      </div>

      {/* BARRA INFERIOR - Fundo Branco */}
      <div className="bg-white border-b h-20 shadow-sm">
        <div className="max-w-[1400px] mx-auto h-full flex items-center px-8">
          {/* LADO ESQUERDO - Menu Administrativo */}
          <div className="w-64 flex-none">
            {showAdminMenu ? <AdminMenu /> : <CategoriesMenu />}
          </div>

          {/* CENTRO - Barra de Pesquisa com mais respiro lateral */}
          <div className="flex-1 flex justify-center px-12">
            <div className="w-full">
              <SearchInput />
            </div>
          </div>

          {/* LADO DIREITO - Carrinho */}
          <div className="w-64 flex-none flex justify-end items-center">
            <CarrinhoIcon />
          </div>
        </div>
      </div>
    </header>
  );
}
