"use client";

import { useEffect, useState } from "react";
import { produtoService } from "@/services/produtoService";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

export default function CatalogoProdutosPage() {
  const [produtos, setProdutos] = useState([]);

  const searchParams = useSearchParams();
  const router = useRouter();

  const categoria = searchParams.get("categoria");
  const busca = searchParams.get("q");

  useEffect(() => {
    carregar();
  }, [categoria, busca]);

  async function carregar() {
    const data = await produtoService.listar({
      categoria,
      q: busca,
    });

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
  ];

  return (
    <div className="p-6">
      <div className="grid grid-cols-5 gap-6">
        {/* SIDEBAR */}
        <div className="col-span-1 border rounded-lg p-4">
          <h2 className="font-semibold mb-4">Filtros</h2>

          <p className="text-sm text-gray-500">
            Categoria: {categoria || "Todas"}
          </p>
        </div>

        {/* PRODUTOS */}
        <div className="col-span-4">
          <div className="mb-4">
            <Input
              placeholder="Buscar produto..."
              defaultValue={busca || ""}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const value = (e.target as HTMLInputElement).value;

                  router.push(`/catalogo/produtos?q=${value}`);
                }
              }}
            />
          </div>

          <div className="grid grid-cols-4 gap-6">
            {produtos.map((produto: any) => (
              <div
                key={produto.id}
                className="border rounded-lg p-4 hover:shadow cursor-pointer"
                onClick={() => router.push(`/catalogo/produtos/${produto.id}`)}
              >
                {produto.imagemUrl ? (
                  <img
                    src={`http://localhost:8080${produto.imagemUrl}`}
                    className="h-32 w-full object-contain mb-2"
                  />
                ) : (
                  <img
                    src="/placeholder.png"
                    className="h-32 w-full object-contain mb-2"
                  />
                )}

                <p className="font-medium">{produto.nome}</p>

                <p className="text-sm text-gray-500">{produto.categoriaNome}</p>

                <p className="font-semibold text-lg text-green-600">
                  R$ {produto.preco?.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
