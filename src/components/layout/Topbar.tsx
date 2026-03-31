"use client";

import { useAuth } from "@/context/AuthContext";
import { useCarrinho } from "@/context/CarrinhoContext";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export default function Topbar() {
  const { usuario } = useAuth();
  const { quantidade, animando } = useCarrinho();
  const router = useRouter();

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return (
    <div className="h-16 bg-white border-b flex items-center justify-end px-6 gap-6">
      {/* CARRINHO */}
      <div
        className="relative cursor-pointer"
        onClick={() => router.push("/catalogo/carrinho")}
      >
        <ShoppingCart
          className={`w-6 h-6 transition-transform ${
            animando ? "scale-125" : "sacle-100"
          }`}
        />

        {quantidade > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-black text-white text-xs px-2 rounded-full">
            {quantidade}
          </Badge>
        )}
      </div>

      {/* USUARIO */}
      <span className="text-sm text-gray-700">{usuario?.nome}</span>

      {/* LOGOUT */}
      <Button variant="outline" onClick={logout}>
        Sair
      </Button>
    </div>
  );
}
