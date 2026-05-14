"use client";

import { useAuth } from "@/context/AuthContext";
import { useCarrinho } from "@/context/CarrinhoContext";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { SearchInput } from "./SearchInput";
import { signOut } from "next-auth/react";

export default function Topbar() {
  const { usuario } = useAuth();
  const { quantidade, animando } = useCarrinho();
  const router = useRouter();

  async function handleLogout() {
    // signOut limpa os cookies do NextAuth automaticamente
    await signOut({
      redirect: true,
      callbackUrl: "/login", // Para onde o usuário vai após sair
    });
  }

  return (
    <div className="h-16 bg-white border-b flex items-center px-6">
      <div className="flex-2 flex justify-center">
        <SearchInput />
      </div>

      {/* 3. LADO DIREITO (Ações) */}
      <div className="flex-1 flex items-center justify-end gap-6">
        <div
          className="relative cursor-pointer"
          onClick={() => router.push("/catalogo/carrinho")}
        >
          <ShoppingCart
            className={`w-6 h-6 ${animando ? "scale-125" : "scale-100"}`}
          />
          {quantidade > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-black text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {quantidade}
            </Badge>
          )}
        </div>

        <div className="flex flex-col items-end border-l pl-6">
          <span className="text-sm font-bold text-gray-800 leading-none">
            {usuario?.nome}
          </span>
          <span className="text-[10px] text-gray-400 uppercase">
            {usuario?.role}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-red-500 hover:bg-red-50"
        >
          Sair
        </Button>
      </div>
    </div>
  );
}
