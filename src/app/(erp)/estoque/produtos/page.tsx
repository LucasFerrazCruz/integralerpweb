"use client";

import { useEffect, useState } from "react";
import { produtoService } from "@/services/produtoService";
import { ProdutosTable } from "@/components/tables/produtos-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ProdutosEstoquePage() {
  const [produtos, setProdutos] = useState([]);
  const router = useRouter();

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const data = await produtoService.listar();
    setProdutos(data);
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "nome",
      header: "Produto",
    },
    {
      accessorKey: "categoria",
      header: "Categoria",
    },
    {
      accessorKey: "estoque",
      header: "Estoque",
    },
    {
      id: "acoes",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => router.push(`/estoque/produtos/${row.original.id}`)}
          >
            Editar
          </Button>

          <Button size="sm" variant="destructive">
            Excluir
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Produtos</h1>

        <Button onClick={() => router.push("/estoque/produtos/novo")}>
          Novo Produto
        </Button>
      </div>

      <ProdutosTable columns={columns} data={produtos} />
    </div>
  );
}
