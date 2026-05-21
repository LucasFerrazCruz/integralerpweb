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
    <div className="p-2 sm:p-6 bg-gray-50 min-h-screen w-full">
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-4 sm:gap-8">
        {/* SIDEBAR DE FILTROS */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="border rounded-xl p-4 sm:p-5 bg-white shadow-sm lg:sticky lg:top-24">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="font-bold text-gray-800 text-sm sm:text-base">
                Filtros
              </h2>
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
                <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Categorias
                </p>
                {/* No mobile as categorias ficam em 2 colunas para poupar rolagem */}
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                  {categorias.map((cat: any) => (
                    <div
                      key={cat.id}
                      className="flex items-center space-x-2 sm:space-x-3"
                    >
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
                        className="text-xs sm:text-sm font-medium leading-none cursor-pointer text-gray-600 hover:text-blue-600 transition-colors truncate"
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

        {/* ÁREA DE PRODUTOS */}
        <main className="flex-grow w-full">
          {/* GRID PROFISSIONAL: 
              - grid-cols-2 no mobile vertical (2 colunas perfeitas)
              - sm:grid-cols-2 ou md:grid-cols-3 no mobile deitado/tablet
              - xl:grid-cols-4 no computador
          */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
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
                        className={`group border rounded-xl p-3 sm:p-4 transition-all duration-300 bg-white flex flex-col justify-between shadow-sm
                        ${isEsgotado ? "opacity-75 grayscale-[0.2]" : "hover:shadow-xl cursor-pointer hover:border-blue-200"}`}
                        onClick={() =>
                          router.push(`/catalogo/produtos/${produto.id}`)
                        }
                      >
                        <div>
                          {/* CONTAINER DA IMAGEM RESPONSIVO */}
                          <div className="h-32 sm:h-44 flex items-center justify-center mb-3 sm:mb-4 bg-gray-100 rounded-lg overflow-hidden relative border border-gray-50">
                            <Image
                              src={produto.imagemUrl}
                              alt={produto.nome}
                              fill
                              sizes="(max-width: 768px) 50vw, 25vw"
                              className="object-contain p-2 sm:p-4 group-hover:scale-105 transition-transform duration-500"
                              priority={false}
                            />
                            <span className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-white/90 backdrop-blur-sm text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm uppercase max-w-[90%] truncate">
                              {produto.categoriaNome}
                            </span>
                            {isEsgotado && (
                              <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                                <span className="bg-white text-gray-800 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full shadow-md uppercase">
                                  Indisponível
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Título menor e controlado no celular */}
                          <h3 className="font-semibold text-gray-800 text-xs sm:text-sm line-clamp-2 mb-0.5 min-h-[32px] sm:min-h-[40px] group-hover:text-blue-600 transition-colors leading-tight">
                            {produto.nome}
                          </h3>
                          <p className="text-[10px] text-gray-400 mb-2 font-mono">
                            ID: #{produto.id.toString().padStart(4, "0")}
                          </p>
                        </div>

                        <div className="mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-50">
                          <div className="flex items-baseline gap-0.5 mb-2 sm:mb-3">
                            <span className="text-[10px] sm:text-xs font-bold text-green-600 font-mono">
                              R$
                            </span>
                            <span className="font-bold text-base sm:text-xl text-green-600 tracking-tight">
                              {produto.preco?.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>

                          {/* Botão de compra menor adaptativo */}
                          <div className="scale-95 sm:scale-100 origin-bottom">
                            {isEsgotado ? (
                              <button
                                disabled
                                className="w-full py-1.5 sm:py-2 bg-gray-100 text-gray-400 text-[10px] sm:text-xs font-bold rounded-lg uppercase border border-gray-200"
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
