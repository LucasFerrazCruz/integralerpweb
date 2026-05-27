"use client";

import { useEffect, useState } from "react";
import { pedidoService } from "@/services/pedidoService";
import { Pedido } from "@/types/Pedido";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { statusPedidoMap } from "@/utils/pedido";
import { Badge, Loader2, ShoppingBag } from "lucide-react";

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    async function carregar() {
      try {
        const data = await pedidoService.listar();
        setPedidos(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "PAGO":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "PENDENTE":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case "CANCELADO":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-3">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="text-xl font-bold">Nenhum pedido encontrado</h1>
        <p className="text-sm text-muted-foreground">
          Você ainda não realizou compras em nossa loja.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Meus Pedidos</h1>

      <div className="space-y-3">
        {pedidos.map((pedido) => (
          <Card
            key={pedido.id}
            className="cursor-pointer hover:border-slate-400 transition shadow-sm"
            onClick={() => router.push(`/pedidos/${pedido.id}`)}
          >
            <CardContent className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <p className="font-semibold text-lg">Pedido #{pedido.id}</p>
                <div className="flex gap-2 items-center">
                  <Badge className={getStatusVariant(pedido.status)}>
                    {statusPedidoMap[pedido.status] || pedido.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    • {pedido.tipo === "MANUAL" ? "Venda Manual" : "E-commerce"}
                  </span>
                </div>
              </div>

              <div className="text-right w-full sm:w-auto">
                <p className="text-lg font-bold text-slate-900">
                  R$ {pedido.total.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Clique para ver detalhes
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
