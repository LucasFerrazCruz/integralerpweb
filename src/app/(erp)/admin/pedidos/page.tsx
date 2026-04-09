"use client";

import { useEffect, useState } from "react";
import { pedidoService } from "@/services/pedidoService";
import { useRole } from "@/hooks/useRole";
import { Pedido } from "@/types/Pedido";
import { statusPedidoMap, tipoPedidoMap } from "@/utils/pedido";

export default function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const { isAdmin } = useRole();

  useEffect(() => {
    pedidoService.listarTodos().then(setPedidos);
  }, []);

  if (isAdmin) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Pedidos (Admin)</h1>

        {pedidos.map((pedido: any) => (
          <div key={pedido.id} className="border p-4 mb-4">
            <p>Pedido #{pedido.id}</p>
            <p>Status: {statusPedidoMap[pedido.status]}</p>
            <p>
              {tipoPedidoMap[pedido.tipo] === "MANUAL"
                ? "Venda manual"
                : "E-commerce"}
            </p>
            <p>Total: R$ {pedido.total}</p>
          </div>
        ))}
      </div>
    );
  }
}
