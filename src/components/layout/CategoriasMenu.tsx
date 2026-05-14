"use client";

import { ChevronDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Categoria } from "@/types/Categoria";
import { categoriaService } from "@/services/categoriaService";

export function CategoriesMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategorias() {
      try {
        setLoading(true);
        const data = await categoriaService.listar();
        // Ordena alfabeticamente pelo nome
        const sortedData = data.sort((a: Categoria, b: Categoria) =>
          a.nome.localeCompare(b.nome),
        );
        setCategorias(sortedData);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategorias();
  }, []);

  const itemsPerColumn = 10;
  const columns = [];
  for (let i = 0; i < categorias.length; i += itemsPerColumn) {
    columns.push(categorias.slice(i, i + itemsPerColumn));
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="gap-2 font-semibold hover:bg-zinc-100 transition-colors"
          >
            Produtos
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-auto min-w-[200px] p-2 mt-[-4px] shadow-xl border-zinc-200"
          align="start"
          onMouseEnter={() => setOpen(true)}
        >
          {loading ? (
            <div className="flex items-center justify-center py-10 px-8 text-zinc-500 gap-2">
              <Loader2 className="animate-spin" size={20} />
              <span>Carregando...</span>
            </div>
          ) : categorias.length > 0 ? (
            <div className="flex h-full">
              {columns.map((column, colIndex) => (
                <div
                  key={colIndex}
                  className={`flex flex-col gap-0.5 min-w-[200px] p-2 ${
                    colIndex > 0 ? "border-l border-zinc-100" : ""
                  }`}
                >
                  {column.map((cat) => (
                    <DropdownMenuItem
                      key={cat.id}
                      className="cursor-pointer hover:bg-zinc-50 py-1.5 px-3 rounded-sm border-l-2 border-transparent transition-all text-sm"
                      onClick={() => {
                        router.push(`/catalogo/produtos?categoria=${cat.id}`);
                        setOpen(false);
                      }}
                    >
                      {cat.nome}
                    </DropdownMenuItem>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-zinc-400 text-sm">
              Nenhuma categoria encontrada.
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
