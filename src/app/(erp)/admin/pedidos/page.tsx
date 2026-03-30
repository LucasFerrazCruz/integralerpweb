"use client";

import { useEffect, useState } from "react";
import { pedidoService } from "@/services/pedidoService";
import { useRole } from "@/hooks/useRole";

export default function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState([]);
  const { isAdmin } = useRole();

  useEffect(() => {
    pedidoService.listarTodos().then(setPedidos);
  }, []);

  if (isAdmin) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Pedidos (Admin)</h1>

        {pedidos.map((p: any) => (
          <div key={p.id} className="border p-4 mb-4">
            <p>Pedido #{p.id}</p>
            <p>Status: {p.status}</p>
            <p>Total: R$ {p.total}</p>
          </div>
        ))}
      </div>
    );
  }
}
