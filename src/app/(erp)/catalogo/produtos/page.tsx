"use client";

import { useEffect, useState } from "react";
import { produtoService } from "@/services/produtoService";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

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
                className="border rounded-x1 p-4 hover:shadow-lg transition cursor-pointer bg-white"
                onClick={() => router.push(`/catalogo/produtos/${produto.id}`)}
              >
                <div className="h-40 flex items-center justify-center mb-3">
                  <img
                    src={
                      produto.imagemUrl
                        ? `http://localhost:8080${produto.imagemUrl}`
                        : "/placeholder.png"
                    }
                    className="max-h-full object-contain"
                  />
                </div>

                <p className="font-medium text-sm line-clamp-2">
                  {produto.nome}
                </p>

                <p className="text-xs text-muted-foreground mb-2">
                  {produto.categoriaNome}
                </p>

                <p className="font-semibold text-lg text-green-600 mb-3">
                  R$ {produto.preco?.toFixed(2)}
                </p>

                <AddToCartButton produtoId={produto.id} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
