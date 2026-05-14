"use client";

import { Suspense, useEffect, useState } from "react";
import { produtoService } from "@/services/produtoService";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import Image from "next/image";
import ProdutoSkeleton from "@/components/skeleton/ProdutoSkeleton";

function CatalogoProdutosContent() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();

  const categoria = searchParams.get("categoria");
  const busca = searchParams.get("q");

  useEffect(() => {
    carregar();
  }, [categoria, busca]);

  async function carregar() {
    setLoading(true);

    try {
      const data = await produtoService.listarCatalogo({
        categoria: categoria ? Number(categoria) : undefined,
        q: busca?.trim() ? busca : undefined,
      });
      setProdutos(data);
    } finally {
      setLoading(false);
    }
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-5 gap-6">
        {/* SIDEBAR DE FILTROS */}
        <div className="col-span-1 border rounded-xl p-5 bg-white shadow-sm h-fit">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            Filtros
          </h2>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Categoria Selecionada
            </p>
            <p className="text-sm font-medium text-blue-600 bg-blue-50 p-2 rounded-md border border-blue-100">
              {categoria || "Todas as Categorias"}
            </p>
          </div>
        </div>

        {/* ÁREA DE PRODUTOS */}
        <div className="col-span-4 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 4. LÓGICA DE EXIBIÇÃO: LOADING vs PRODUTOS */}
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <ProdutoSkeleton key={i} />
                ))
              : produtos
                  .filter((p: any) => p.ativo === true)
                  .map((produto: any) => {
                    // 1. Definimos a constante de controle baseada no novo campo do DTO
                    const isEsgotado = produto.estoqueDisponivel <= 0;

                    return (
                      <div
                        key={produto.id}
                        // 2. Ajustamos o estilo: se esgotado, tiramos o hover e adicionamos opacidade/grayscale
                        className={`group border rounded-xl p-4 transition-all duration-300 bg-white flex flex-col justify-between 
          ${
            isEsgotado
              ? "opacity-70 grayscale-[0.2]"
              : "hover:shadow-xl cursor-pointer"
          }`}
                        // 3. Impedimos a navegação para a página do produto se estiver esgotado (opcional, conforme sua regra)
                        onClick={() =>
                          router.push(`/catalogo/produtos/${produto.id}`)
                        }
                      >
                        <div>
                          {/* CONTAINER DA IMAGEM */}
                          <div className="h-44 flex items-center justify-center mb-4 bg-gray-100 rounded-lg overflow-hidden relative border border-gray-50">
                            <Image
                              src={produto.imagemUrl}
                              alt={produto.nome}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                              className="object-contain group-hover:scale-110 transition-transform duration-500"
                              priority={false}
                            />

                            {/* Badge de Categoria Flutuante */}
                            <span className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase">
                              {produto.categoriaNome}
                            </span>

                            {/* 4. Overlay de Esgotado sobre a imagem */}
                            {isEsgotado && (
                              <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                                <span className="bg-white text-gray-800 text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-tighter">
                                  Indisponível
                                </span>
                              </div>
                            )}
                          </div>

                          <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                            {produto.nome}
                          </h3>

                          <p className="text-[11px] text-gray-400 mb-2 font-mono">
                            ID: #{produto.id.toString().padStart(4, "0")}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-50">
                          <div className="flex items-baseline gap-1 mb-3">
                            <span className="text-xs font-bold text-green-600 font-mono">
                              R$
                            </span>
                            <span className="font-bold text-xl text-green-600 tracking-tight">
                              {produto.preco?.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>

                          {/* 5. Lógica do Botão: Se esgotado, mostra botão desabilitado, se não, mostra o AddToCart */}
                          {isEsgotado ? (
                            <button
                              disabled
                              className="w-full py-2 bg-gray-100 text-gray-400 text-xs font-bold rounded-lg uppercase border border-gray-200"
                            >
                              Esgotado
                            </button>
                          ) : (
                            <AddToCartButton
                              produtoId={produto.id}
                              produtoNome={produto.nome}
                              preco={produto.preco}
                              imagemUrl={produto.imagemUrl}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
          </div>

          {!loading && produtos.length === 0 && (
            <div className="text-center py-20 text-gray-400 border-2 border-dashed rounded-xl">
              Nenhum item encontrado para sua busca.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CatalogoProdutosPage() {
  return (
    <Suspense fallback={<div className="p-6">Carregando...</div>}>
      <CatalogoProdutosContent />
    </Suspense>
  );
}
