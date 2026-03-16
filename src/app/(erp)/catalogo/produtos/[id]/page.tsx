"use client";

import { produtoService } from "@/services/produtoService";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProdutoPage() {
  const params = useParams();
  const [produto, setProduto] = useState<any>(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const data = await produtoService.buscarPorId(params.id);
    setProduto(data);
  }

  if (!produto) return <p>Carregando...</p>;

  return (
    <div className="p-8 max-w-6xl mx-auto grid grid-cols-2 gap-10">
      {/*IMAGEM*/}
      <div>
        <img
          src={`http://localhost:8080${produto.imagemUrl}`}
          className="w-full rounded-lg"
        />
      </div>

      {/* INFO */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{produto.nome}</h1>

        <p className="text-gray-500 mb-4">{produto.categoriaNome}</p>

        <p className="text-3xl font-semibold text-green-600 mb-6">
          R$ {produto.preco?.toFixed(2)}
        </p>

        <p className="text-gray-700">{produto.descricao}</p>
      </div>
    </div>
  );
}
