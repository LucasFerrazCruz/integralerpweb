"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { pedidoService } from "@/services/pedidoService";
import { Pedido } from "@/types/Pedido";
import { Card, CardContent } from "@/components/ui/card";

export default function PedidoDetalhePage() {
  const { id } = useParams();
  const [pedido, setPedido] = useState<Pedido | null>(null);

  useEffect(() => {
    async function carregar() {
      const data = await pedidoService.buscarPorId(Number(id));
      setPedido(data);
    }

    if (id) carregar();
  }, [id]);

  if (!pedido) return <p className="p-8">Carregando...</p>;

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Pedido #{pedido.id}</h1>

      <Card>
        <CardContent className="p-4 space-y-4">
          <p>
            <strong>Status:</strong> {pedido.status}
          </p>
          <p>
            <strong>Endereço:</strong> {pedido.enderecoEntrega}
          </p>

          <div className="border-t pt-4 space-y-2">
            {pedido.itens.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.produtoNome} x {item.quantidade}
                </span>

                <span className="font-semibold">
                  R$ {item.subtotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>R$ {pedido.total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
