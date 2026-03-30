"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useCarrinho } from "@/context/CarrinhoContext";
import { pedidoService } from "@/services/pedidoService";

export default function CheckoutPage() {
  const { carrinho, loading, limparCarrinho } = useCarrinho();
  const [endereco, setEndereco] = useState("");
  const [finalizando, setFinalizando] = useState(false);

  const router = useRouter();

  if (loading || !carrinho) {
    return <p className="p-8">Carregando...</p>;
  }

  if (carrinho.itens.length === 0) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Carrinho vazio</h1>
        <p className="text-muted-foreground">
          Adicione produtos antes de continuar
        </p>
      </div>
    );
  }

  async function finalizarPedido() {
    if (!endereco.trim()) {
      toast.error("Informe o endereço de entrega");
      return;
    }

    try {
      setFinalizando(true);

      await pedidoService.criar(endereco);

      // 🔥 SINCRONIZA COM BACKEND
      await limparCarrinho();

      toast.success("Pedido realizado com sucesso!");

      router.push("/pedidos");
    } catch {
      toast.error("Erro ao finalizar pedido");
    } finally {
      setFinalizando(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Checkout</h1>

      {/* RESUMO */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {carrinho.itens.map((item) => (
            <div key={item.produtoId} className="flex justify-between">
              <div>
                <p className="font-medium">{item.produtoNome}</p>
                <p className="text-sm text-muted-foreground">
                  {item.quantidade} x R$ {item.preco.toFixed(2)}
                </p>
              </div>

              <p className="font-semibold text-green-600">
                R$ {(item.preco * item.quantidade).toFixed(2)}
              </p>
            </div>
          ))}

          <div className="border-t pt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>R$ {carrinho.total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* ENDEREÇO */}
      <Card>
        <CardContent className="p-4">
          <p className="font-medium mb-2">Endereço de entrega</p>

          <textarea
            className="w-full border rounded p-3"
            placeholder="Digite seu endereço completo"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* FINALIZAR */}
      <Button
        size="lg"
        className="w-full bg-black text-white"
        disabled={finalizando}
        onClick={finalizarPedido}
      >
        {finalizando ? "Finalizando..." : "Finalizar Pedido"}
      </Button>
    </div>
  );
}
