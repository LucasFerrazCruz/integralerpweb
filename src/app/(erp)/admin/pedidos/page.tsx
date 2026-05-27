"use client";

import { useEffect, useState } from "react";
import { pedidoService } from "@/services/pedidoService";
import { useRole } from "@/hooks/useRole";
import { Pedido } from "@/types/Pedido";
import { statusPedidoMap } from "@/utils/pedido";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin) return;
    pedidoService
      .listarTodos()
      .then(setPedidos)
      .finally(() => setLoading(false));
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-12 text-center space-y-3 max-w-sm mx-auto">
        <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="text-lg font-bold">Acesso Negado</h1>
        <p className="text-sm text-muted-foreground">
          Você não tem permissão para visualizar esta página corporativa.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gerenciamento de Pedidos
          </h1>
          <p className="text-sm text-muted-foreground">
            Controle global de vendas, faturamento e logística.
          </p>
        </div>
      </div>

      {/* Tabela Administrativa */}
      <div className="border rounded-xl bg-white overflow-x-auto shadow-sm">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs uppercase bg-slate-50 text-slate-700 border-b">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pedidos.map((pedido) => (
              <tr
                key={pedido.id}
                className="hover:bg-slate-50/70 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-slate-900">
                  #{pedido.id}
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-medium">
                    {pedido.tipo === "MANUAL" ? "📝 Manual" : "🌐 E-commerce"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Badge
                    variant={pedido.status === "PAGO" ? "default" : "secondary"}
                  >
                    {statusPedidoMap[pedido.status] || pedido.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-900">
                  R$ {pedido.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => router.push(`/admin/pedidos/${pedido.id}`)}
                  >
                    <Eye className="h-3.5 w-3.5" /> Gerenciar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
