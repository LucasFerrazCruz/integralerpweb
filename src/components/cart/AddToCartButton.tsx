"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { carrinhoService } from "@/services/carrinhoService";
import { useCarrinho } from "@/context/CarrinhoContext";
import { Loader2, ShoppingCart } from "lucide-react";
import { useState } from "react";

type Props = {
  produtoId: number;
};

export function AddToCartButton({ produtoId }: Props) {
  const { carregarCarrinho, animar } = useCarrinho();
  const [loading, setLoading] = useState(false);

  async function handleAdd(e?: React.MouseEvent) {
    e?.stopPropagation();

    try {
      setLoading(true);

      await carrinhoService.adicionar(produtoId);

      await carregarCarrinho();
      animar();

      toast.success("Produto adicionado ao carrinho 🛒");
    } catch {
      toast.error("Erro ao adicionar produto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleAdd}
      disabled={loading}
      className="w-full flex items-center gap-2"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <ShoppingCart className="w-4 h-4" />
      )}
      {loading ? "Adicionando..." : "Adicionar"}
    </Button>
  );
}
