"use client";

import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { Button } from "@/components/ui/button";
import { produtoService } from "@/services/produtoService";
import { ChevronLeft, Package, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProdutoPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [produto, setProduto] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregar();
  }, [id]);

  async function carregar() {
    try {
      setLoading(true);
      const data = await produtoService.buscarPorId(id);
      setProduto(data);
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return <div className="p-20 text-center">Carregando detalhes...</div>;
  if (!produto)
    return <div className="p-20 text-center">Produto não encontrado.</div>;

  const isEsgotado = produto.estoqueDisponivel <= 0;

  if (!produto || produto.ativo === false) {
    return (
      <div className="p-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">
          Produto Indisponível
        </h2>
        <p className="text-gray-500">
          Este item não está mais disponível em nosso catálogo.
        </p>
        <Button onClick={() => router.push("/catalogo/produtos")}>
          Voltar para a Loja
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* BOTÃO VOLTAR & BREADCRUMB */}
      <Button
        onClick={() => router.back()}
        className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ChevronLeft size={18} /> Voltar para o catálogo
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        {/* LADO ESQUERDO: IMAGEM */}
        <div
          className={`relative h-100 md:h-125 w-full bg-gray-50 rounded-xl overflow-hidden border border-gray-50 transition-all ${isEsgotado && "grayscale-[0.4] opacity-80"}`}
        >
          <Image
            src={produto.imagemUrl || "/placeholder.png"}
            alt={produto.nome}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain p-4"
          />
          {isEsgotado && (
            <div className="absolute top-4 right-4 bg-white border-2 border-red-500 text-red-500 font-black px-4 py-1 rounded-full shadow-xl uppercase tracking-tighter text-sm z-10">
              Produto Indisponível
            </div>
          )}
        </div>

        {/* LADO DIREITO: INFO */}
        <div className="flex flex-col">
          <div className="mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {produto.categoriaNome}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-3 leading-tight">
              {produto.nome}
            </h1>
            <div className="flex gap-4 mt-2">
              <p className="text-sm text-gray-400 font-mono">
                REF: {produto.id.toString().padStart(5, "0")}
              </p>
              <p className="text-sm text-gray-400 font-mono">
                UND: {produto.unidade || "UN"}
              </p>
            </div>
          </div>

          <div className="my-6 py-6 border-y border-gray-100">
            {/* Lógica de Preço Diferenciado */}
            {produto.precoPix ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-green-600">
                    R${" "}
                    {produto.precoPix.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  <span className="text-sm text-gray-400 font-medium uppercase">
                    no PIX
                  </span>
                </div>

                <p className="text-sm text-gray-500 mt-1">
                  Ou R$ {produto.preco?.toLocaleString("pt-BR")} em até 10x de
                  R$ {(produto.preco / 10).toFixed(2)} no cartão
                </p>
              </>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">
                  R${" "}
                  {produto.preco?.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4 mb-8">
            {/* 2. Alteração dinâmica da Disponibilidade */}
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Package
                size={18}
                className={isEsgotado ? "text-gray-400" : "text-blue-500"}
              />
              <span>
                Disponibilidade:{" "}
                {isEsgotado ? (
                  <strong className="text-red-500">Esgotado no momento</strong>
                ) : (
                  <strong className="text-green-600">Em estoque</strong>
                )}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Truck size={18} className="text-blue-500" />
              <span>
                {isEsgotado
                  ? "Previsão de reposição em breve"
                  : "Envio imediato para todo o Brasil"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <ShieldCheck size={18} className="text-blue-500" />
              <span>Garantia de fábrica e Nota Fiscal inclusa</span>
            </div>
          </div>

          {/* 3. Lógica do Botão de Compra */}
          <div className="mt-auto">
            {isEsgotado ? (
              <div className="space-y-3">
                <Button
                  disabled
                  className="w-full h-14 bg-gray-100 text-gray-400 border-gray-200 text-lg font-bold uppercase"
                >
                  Indisponível
                </Button>
                <p className="text-xs text-center text-gray-400">
                  Este item não pode ser adicionado ao carrinho pois o estoque
                  está zerado.
                </p>
              </div>
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

      {/* DESCRIÇÃO E ESPECIFICAÇÕES TÉCNICAS */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">
            Descrição do Produto
          </h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {produto.descricao ||
              "Nenhuma descrição detalhada disponível para este item."}
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 h-fit">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            Dados Técnicos
          </h2>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between border-b pb-1">
              <span className="text-gray-500">Fabricante</span>
              <span className="font-medium">{produto.fabricante || "N/A"}</span>
            </li>
            <li className="flex justify-between border-b pb-1">
              <span className="text-gray-500">Material</span>
              <span className="font-medium text-right">
                {produto.material || "N/A"}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-500">Unidade</span>
              <span className="font-medium">{produto.unidade || "N/A"}</span>
            </li>
            {Number(produto.peso) > 0 && (
              <li className="flex justify-between border-b pb-1">
                <span className="text-gray-500">Peso</span>
                <span className="font-medium">{produto.peso} kg</span>
              </li>
            )}
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              Dimensões
            </h2>
            {Number(produto.diametro) > 0 && (
              <li className="flex justify-between border-b pb-1">
                <span className="text-gray-500">Diâmetro</span>
                <span className="font-medium">{produto.diametro} cm</span>
              </li>
            )}
            {Number(produto.largura) > 0 && (
              <li className="flex justify-between border-b pb-1">
                <span className="text-gray-500">Largura</span>
                <span className="font-medium">{produto.largura} cm</span>
              </li>
            )}
            {Number(produto.altura) > 0 && (
              <li className="flex justify-between border-b pb-1">
                <span className="text-gray-500">Altura</span>
                <span className="font-medium">{produto.altura} cm</span>
              </li>
            )}
            {Number(produto.comprimento) > 0 && (
              <li className="flex justify-between border-b pb-1">
                <span className="text-gray-500">Comprimento</span>
                <span className="font-medium">{produto.comprimento} cm</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
