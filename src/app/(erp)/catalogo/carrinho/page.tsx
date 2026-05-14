"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCarrinho } from "@/context/CarrinhoContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function CarrinhoPage() {
  const router = useRouter();
  const { carrinho, atualizarItem, loading } = useCarrinho();
  const [loadingItens, setLoadingItens] = useState<number[]>([]);
  const { data: session } = useSession();

  function setItemLoading(produtoId: number, value: boolean) {
    setLoadingItens((prev) =>
      value ? [...prev, produtoId] : prev.filter((id) => id !== produtoId),
    );
  }

  function isLoading(produtoId: number) {
    return loadingItens.includes(produtoId);
  }

  async function alterarQuantidade(produtoId: number, quantidade: number) {
    if (quantidade < 1) return;
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
      setItemLoading(produtoId, true);
      await atualizarItem(produtoId, 0);
      toast.success("Item removido");
    } catch {
      toast.error("Erro ao remover item");
    } finally {
      setItemLoading(produtoId, false);
    }
  }

  if (loading || !carrinho) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <p className="text-muted-foreground animate-pulse">
          Carregando seu carrinho...
        </p>
      </div>
    );
  }

  if (carrinho.itens.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-100">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <ShoppingBag size={48} className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h1>
        <p className="text-muted-foreground mb-6">
          Adicione produtos para continuar
        </p>
        <Button onClick={() => router.push("/catalogo/produtos")}>
          Voltar para o catálogo
        </Button>
      </div>
    );
  }

  const total = carrinho.itens.reduce(
    (acc: number, item: any) => acc + item.preco * item.quantidade,
    0,
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <ShoppingBag /> Carrinho
      </h1>

      <div className="grid gap-6">
        {carrinho.itens.map((item: any) => (
          <Card
            key={item.produtoId}
            className="overflow-hidden border-gray-100 shadow-sm"
          >
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-items sm:flex-row items-center p-4 gap-6">
                {/* IMAGEM COM SUPABASE FIX */}
                <div className="relative w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                  <Image
                    src={
                      item.imagemUrl && item.imagemUrl !== ""
                        ? item.imagemUrl
                        : "/placeholder.png"
                    }
                    alt={item.produtoNome || "Produto"}
                    fill
                    className="object-contain p-2"
                  />
                </div>

                {/* INFO */}
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-bold text-lg text-gray-800">
                    {item.produtoNome}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Ref: {item.produtoId.toString().padStart(5, "0")}
                  </p>
                  <p className="text-sm font-medium text-blue-600">
                    Unitário: R${" "}
                    {item.preco.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>

                {/* CONTROLES DE QUANTIDADE */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center border rounded-lg bg-gray-50">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      disabled={
                        isLoading(item.produtoId) || item.quantidade <= 1
                      }
                      onClick={() =>
                        alterarQuantidade(item.produtoId, item.quantidade - 1)
                      }
                    >
                      <Minus size={14} />
                    </Button>

                    <span className="w-10 text-center font-semibold text-sm">
                      {item.quantidade}
                    </span>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      disabled={isLoading(item.produtoId)}
                      onClick={() =>
                        alterarQuantidade(item.produtoId, item.quantidade + 1)
                      }
                    >
                      <Plus size={14} />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 text-xs gap-1"
                    disabled={isLoading(item.produtoId)}
                    onClick={() => removerItem(item.produtoId)}
                  >
                    <Trash2 size={14} /> Remover
                  </Button>
                </div>

                {/* TOTAL ITEM */}
                <div className="min-w-30 text-right">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-tighter">
                    Subtotal
                  </p>
                  <p className="font-bold text-xl text-green-600">
                    R${" "}
                    {(item.preco * item.quantidade).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* RESUMO DO PEDIDO */}
      <Card className="mt-10 border-t-4 border-t-black">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-gray-500 uppercase text-xs font-bold tracking-widest">
                Total do Pedido
              </p>
              <p className="text-3xl font-black text-gray-900">
                R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <Button
              size="lg"
              className="bg-black hover:bg-gray-800 text-white px-10 gap-2 h-14 text-lg"
              onClick={() => {
                if (!carrinho.itens.length) return;

                if (!session) {
                  // Se não está logado, vai para login salvando o destino final
                  router.push("/login?callbackUrl=/checkout");
                  return;
                }

                // Se já está logado, vai direto
                router.push("/checkout");
              }}
            >
              Finalizar Compra <ArrowRight size={20} />
            </Button>
          </div>
          <p className="text-xs text-gray-400 text-center sm:text-left">
            * Impostos e frete serão calculados na próxima etapa.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
