"use client";

import { useEffect, useState } from "react";
import { categoriaService } from "@/services/categoriaService";
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
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Navegue por Categorias
          </h1>
        </div>

        {/* Grid inspirado na Grainger */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 border-t border-l border-gray-200 bg-white">
          {categorias.map((cat: any) => (
            <div
              key={cat.id}
              className="group flex flex-col items-center p-6 border-r border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer text-center h-48"
              onClick={() =>
                router.push(`/catalogo/produtos?categoria=${cat.id}`)
              }
            >
              <div className="flex-1 flex items-center justify-center w-full mb-4">
                <img
                  src={cat.imagemUrl || "/placeholder.png"}
                  alt={cat.nome}
                  className="max-h-24 object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <p className="text-sm font-semibold text-gray-700 leading-tight">
                {cat.nome}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
