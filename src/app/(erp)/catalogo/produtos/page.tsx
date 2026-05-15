"use client";

import { Suspense, useEffect, useState } from "react";
import { produtoService } from "@/services/produtoService";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import Image from "next/image";
import ProdutoSkeleton from "@/components/skeleton/ProdutoSkeleton";
import { categoriaService } from "@/services/categoriaService";
import { Checkbox } from "@/components/ui/checkbox";

function CatalogoProdutosContent() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();

  const categoriasSelecionadas =
    searchParams.get("categoria")?.split(",") || [];
  const busca = searchParams.get("q") || "";

  useEffect(() => {
    carregarCategorias();
  }, []);

  useEffect(() => {
    carregarProdutos();
  }, [searchParams]);

  async function carregarCategorias() {
    try {
      const data = await categoriaService.listar();
      setCategorias(data);
    } catch (error) {
      console.error("Erro ao carregar categorias", error);
    }
  }

  async function carregarProdutos() {
    setLoading(true);
    try {
      const data = await produtoService.listarCatalogo({
        categoria: searchParams.get("categoria") || undefined,
        q: busca.trim() || undefined,
      });
      setProdutos(data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleCategoria = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    let novasCategorias = [...categoriasSelecionadas];

    if (novasCategorias.includes(id)) {
      novasCategorias = novasCategorias.filter((c) => c !== id);
    } else {
      novasCategorias.push(id);
    }

    if (novasCategorias.length > 0) {
      params.set("categoria", novasCategorias.join(","));
    } else {
      params.delete("categoria");
    }

    router.push(`/catalogo/produtos?${params.toString()}`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 1. Container Principal com limite de largura para evitar espalhamento */}
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-8">
        {/* SIDEBAR DE FILTROS - Largura fixa no desktop */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="border rounded-xl p-5 bg-white shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-gray-800">Filtros</h2>
              {categoriasSelecionadas.length > 0 && (
                <button
                  onClick={() => router.push("/catalogo/produtos")}
                  className="text-[10px] text-blue-600 hover:underline font-normal"
                >
                  Limpar
                </button>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Categorias
                </p>
                <div className="space-y-3">
                  {categorias.map((cat: any) => (
                    <div key={cat.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`cat-${cat.id}`}
                        checked={categoriasSelecionadas.includes(
                          cat.id.toString(),
                        )}
                        onCheckedChange={() =>
                          handleToggleCategoria(cat.id.toString())
                        }
                      />
                      <label
                        htmlFor={`cat-${cat.id}`}
                        className="text-sm font-medium leading-none cursor-pointer text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        {cat.nome}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ÁREA DE PRODUTOS - Flex Grow para ocupar o centro */}
        <main className="flex-grow">
          {/* GRID CORRIGIDO: 
              - Mobile: 1 coluna
              - Tablet: 2 ou 3 colunas
              - Desktop: Máximo de 4 colunas (removido grid-cols-5)
          */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <ProdutoSkeleton key={i} />
                ))
              : produtos
                  .filter((p: any) => p.ativo === true)
                  .map((produto: any) => {
                    const isEsgotado = produto.estoqueDisponivel <= 0;

                    return (
                      <div
                        key={produto.id}
                        className={`group border rounded-xl p-4 transition-all duration-300 bg-white flex flex-col justify-between shadow-sm
                        ${isEsgotado ? "opacity-75 grayscale-[0.2]" : "hover:shadow-xl cursor-pointer hover:border-blue-200"}`}
                        onClick={() =>
                          router.push(`/catalogo/produtos/${produto.id}`)
                        }
                      >
                        <div>
                          <div className="h-44 flex items-center justify-center mb-4 bg-gray-100 rounded-lg overflow-hidden relative border border-gray-50">
                            <Image
                              src={produto.imagemUrl}
                              alt={produto.nome}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                              className="object-contain group-hover:scale-110 transition-transform duration-500"
                              priority={false}
                            />
                            <span className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase">
                              {produto.categoriaNome}
                            </span>
                            {isEsgotado && (
                              <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                                <span className="bg-white text-gray-800 text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase">
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
        </main>
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
