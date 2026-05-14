"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCarrinho } from "@/context/CarrinhoContext";
import { Loader2, ShoppingCart } from "lucide-react";
import { useState } from "react";

type Props = {
  produtoId: number;
  produtoNome?: string;
  preco?: number;
  imagemUrl?: string;
};

export function AddToCartButton({
  produtoId,
  produtoNome,
  preco,
  imagemUrl,
}: Props) {
  const { atualizarItem, carrinho, animar } = useCarrinho();
  const [loading, setLoading] = useState(false);

  async function handleAdd(e?: React.MouseEvent) {
    e?.stopPropagation();
    if (!produtoId) return;

    try {
      setLoading(true);

      const itensAtuais = carrinho?.itens || [];
      const itemExistente = carrinho?.itens.find(
        (i) => i.produtoId === produtoId,
      );
      const novaQuantidade = (itemExistente?.quantidade || 0) + 1;

      await atualizarItem(produtoId, novaQuantidade, {
        nome: produtoNome,
        preco: preco,
        imagemUrl: imagemUrl,
      });

      toast.success("Produto adicionado ao carrinho 🛒");
    } catch (error: any) {
      console.error("Erro ao adicionar:", error);
      toast.error(error.response?.data?.message || "Erro ao adicionar produto");
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
