import { useRole } from "@/hooks/useRole";
import { Link } from "lucide-react";
import { signOut } from "next-auth/react";
import { AdminMenu } from "./AdminMenu";
import { SearchInput } from "./SearchInput";
import { CarrinhoIcon } from "./CarrinhoIcon";

export function Header() {
  const { isAdmin, isDistribuidor } = useRole();

  return (
    <header className="flex flex-col w-full">
      {/* BARRA SUPERIOR (Preta/Escura) - Identidade e Conta */}
      <div className="bg-zinc-950 text-white h-10 flex items-center px-6 justify-between text-xs">
        <div className="font-bold tracking-tighter text-sm">GR TOOLS</div>

        <div className="flex items-center gap-4">
          <Link href="/minha-conta" className="hover:underline">
            Minha Conta
          </Link>
          <Link href="/pedidos" className="hover:underline">
            Meus Pedidos
          </Link>
          <button onClick={() => signOut()} className="text-red-400">
            Sair
          </button>
        </div>
      </div>

      {/* BARRA INFERIOR (Branca) - Busca, Carrinho e Menu */}
      <div className="bg-white border-b h-16 flex items-center px-6 gap-8 shadow-sm">
        {/* O "All Products" da Grainger vira seu "Menu Administrativo" */}
        {(isAdmin || isDistribuidor) && <AdminMenu />}

        <div className="flex-1 max-w-2xl">
          <SearchInput />
        </div>

        <div className="flex items-center gap-4">
          <CarrinhoIcon />
        </div>
      </div>
    </header>
  );
}
