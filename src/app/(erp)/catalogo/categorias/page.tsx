"use client";

import { useEffect, useState } from "react";
import { categoriaService } from "@/services/categoriaService";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const router = useRouter();

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const data = await categoriaService.listar();
    setCategorias(data);
  }

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold">Categorias</h1>

        <Button onClick={() => router.push("/catalogo/categorias/nova")}>
          Nova Categoria
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categorias.map((cat: any) => (
          <div
            key={cat.id}
            className="border rounded-lg p-4 hover:shadow cursor-pointer"
            onClick={() =>
              router.push(`/catalogo/produtos?categoria=${cat.id}`)
            }
          >
            <img
              src={cat.imagem || "/placeholder.png"}
              className="h-24 mx-auto mb-2 object-contain"
            />

            <p className="text-center font-medium">{cat.nome}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
