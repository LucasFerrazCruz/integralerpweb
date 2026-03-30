"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useCarrinho } from "@/context/CarrinhoContext";
import { useRouter } from "next/navigation";

export default function CarrinhoPage() {
  const router = useRouter();
  const { carrinho, atualizarItem, loading } = useCarrinho();
  const [loadingItens, setLoadingItens] = useState<number[]>([]);

  function setItemLoading(produtoId: number, value: boolean) {
    setLoadingItens((prev) =>
      value ? [...prev, produtoId] : prev.filter((id) => id !== produtoId),
    );
  }

  function isLoading(produtoId: number) {
    return loadingItens.includes(produtoId);
  }

  async function alterarQuantidade(produtoId: number, quantidade: number) {
    try {
      setItemLoading(produtoId, true);

      await atualizarItem(produtoId, quantidade);
    } catch {
      toast.error("Erro ao atualizar quantidade");
    } finally {
      setItemLoading(produtoId, false);
    }
  }

  async function removerItem(produtoId: number) {
    try {
      await atualizarItem(produtoId, 0);
      toast.success("Item removido do carrinho");
    } catch {
      toast.error("Erro ao remover item");
    }
  }

  if (loading || !carrinho) {
    return <p className="p-8">Carregando...</p>;
  }

  if (carrinho.itens.length === 0) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h1>
        <p className="text-muted-foreground">
          Adicione produtos para continuar
        </p>
      </div>
    );
  }

  const total = carrinho.itens.reduce(
    (acc: number, item: any) => acc + item.preco * item.quantidade,
    0,
  );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Carrinho</h1>

      <div className="grid gap-4">
        {carrinho.itens.map((item: any) => (
          <Card key={item.id}>
            <CardContent className="flex items-center justify-between p-4 gap-4">
              {/* IMAGEM */}
              <img
                src={
                  item.imagemUrl
                    ? `http://localhost:8080${item.imagemUrl}`
                    : "/placeholder.png"
                }
                className="w-20 h-20 object-contain"
              />

              {/* INFO */}
              <div className="flex-1">
                <p className="font-medium">{item.produtoNome}</p>

                <p className="text-sm text-muted-foreground">
                  {item.quantidade} x R$ {item.preco.toFixed(2)}
                </p>
              </div>

              {/* AÇÕES */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  {/* TOTAL ITEM */}
                  <p className="font-semibold text-green-600">
                    R$ {(item.preco * item.quantidade).toFixed(2)}
                  </p>

                  {/* BOTÃO -*/}
                  <Button
                    size="icon"
                    variant="outline"
                    disabled={isLoading(item.produtoId)}
                    onClick={() =>
                      alterarQuantidade(item.produtoId, item.quantidade - 1)
                    }
                  >
                    -
                  </Button>

                  <span className="w-6 text-center">{item.quantidade}</span>

                  {/* BOTÃO +*/}
                  <Button
                    size="icon"
                    variant="outline"
                    disabled={isLoading(item.produtoId)}
                    onClick={() =>
                      alterarQuantidade(item.produtoId, item.quantidade + 1)
                    }
                  >
                    +
                  </Button>

                  {/* REMOVER */}
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isLoading(item.produtoId)}
                    onClick={() => removerItem(item.produtoId)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* TOTAL */}
      <div className="mt-8 flex justify-between items-center border-t pt-6">
        <p className="text-lg font-semibold">Total</p>

        <p className="text-2xl font-bold text-green-600">
          R$ {total.toFixed(2)}
        </p>
      </div>

      {/* BOTÃO FINALIZAR */}
      <div className="mt-6 flex justify-end">
        <Button
          size="lg"
          className="bg-black text-white"
          onClick={() => {
            if (!carrinho.itens.length) {
              toast.error("Carrinho vazio");
              return;
            }

            router.push("/checkout");
          }}
        >
          Finalizar pedido
        </Button>
      </div>
    </div>
  );
}
