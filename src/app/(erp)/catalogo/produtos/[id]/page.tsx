"use client";

import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { produtoService } from "@/services/produtoService";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProdutoPage() {
  const params = useParams();
  const id = Number(params.id);
  const [produto, setProduto] = useState<any>(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const data = await produtoService.buscarPorId(id);
    setProduto(data);
  }

  if (!produto) return <p>Carregando...</p>;

  return (
    <div className="p-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* IMAGEM */}
      <div className="bg-white rounded-xl p-6 flex items-center justify-center">
        <img
          src={`http://localhost:8080${produto.imagemUrl}`}
          className="max-h-[400px] object-contain"
        />
      </div>

      {/* INFO */}
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold mb-2">{produto.nome}</h1>

        <p className="text-sm text-muted-foreground mb-4">
          {produto.categoriaNome}
        </p>

        <p className="text-3xl font-semibold text-green-600 mb-6">
          R$ {produto.preco?.toFixed(2)}
        </p>

        <p className="text-gray-700 mb-6">{produto.descricao}</p>

        <div className="max-w-xs">
          <AddToCartButton produtoId={produto.id} />
        </div>
      </div>
    </div>
  );
}
