"use client";

import { useEffect, useState } from "react";
import { pedidoService } from "@/services/pedidoService";
import { Pedido } from "@/types/Pedido";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    async function carregar() {
      try {
        const data = await pedidoService.listar();
        setPedidos(data);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  if (loading) return <p className="p-8">Carregando pedidos...</p>;

  if (pedidos.length === 0) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Nenhum pedido encontrado</h1>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-4">
      <h1 className="text-2xl font-bold">Meus Pedidos</h1>

      {pedidos.map((pedido) => (
        <Card
          key={pedido.id}
          className="cursor-pointer hover:shadow-md transition"
          onClick={() => router.push(`/pedidos/${pedido.id}`)}
        >
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">Pedido #{pedido.id}</p>
              <p className="text-sm text-muted-foreground">
                Status: {pedido.status}
              </p>
            </div>

            <p className="font-bold text-green-600">
              R$ {pedido.total.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
