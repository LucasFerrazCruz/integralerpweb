"use client";

import { useCarrinho } from "@/context/CarrinhoContext";
import { useRouter } from "next/navigation";
import { Badge } from "../ui/badge";
import { ShoppingCart } from "lucide-react";

export function CarrinhoIcon() {
  const router = useRouter();
  const { quantidade, animando } = useCarrinho();

  return (
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
  );
}
