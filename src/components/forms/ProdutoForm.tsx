"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { produtoService } from "@/services/produtoService";
import { categoriaService } from "@/services/categoriaService";
import { Categoria } from "@/types/Categoria";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { imagemService } from "@/services/imagemService";

export default function ProdutoForm({ produtoId }: { produtoId?: string }) {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [estoqueMinimo, setEstoqueMinimo] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [imagem, setImagem] = useState<File | null>(null);
  const [preco, setPreco] = useState("");

  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    carregarCategorias();

    if (produtoId) {
      carregarProduto();
    }
    console.log("produtoId recebido:", produtoId);
  }, [produtoId]);

  async function carregarCategorias() {
    const data = await categoriaService.listar();

    setCategorias(data);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();

    let imagemUrl = null;

    if (imagem) {
      imagemUrl = await uploadImagem();
    }

    const payload = {
      nome,
      descricao,
      codigoBarras,
      estoqueMinimo: Number(estoqueMinimo),
      categoriaId: Number(categoriaId),
      imagemUrl,
      preco,
    };

    if (produtoId) {
      await produtoService.atualizar(Number(produtoId), payload);
    } else {
      await produtoService.criar(payload);
    }

    router.push("/estoque/produtos");
  }

  async function criarCategoria() {
    const nomeCategoria = prompt("Nome da categoria");

    if (!nomeCategoria) return;

    await categoriaService.criar(nomeCategoria);

    await carregarCategorias();
  }

  async function uploadImagem() {
    if (!imagem) return null;

    const url = await imagemService.upload(imagem);

    return url;
  }

  async function carregarProduto() {
    const data = await produtoService.buscarPorId(Number(produtoId));

    setNome(data.nome);
    setDescricao(data.descricao);
    setCodigoBarras(data.codigoBarras);
    setEstoqueMinimo(String(data.estoqueMinimo));
    setCategoriaId(String(data.categoriaId));
    setPreco(data.preco);
  }

  return (
    <div style={{ maxWidth: 500 }}>
      <form onSubmit={salvar}>
        <div style={{ marginBottom: 10 }}>
          <Input
            value={nome}
            placeholder="Nome do produto"
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <Input
            value={descricao}
            placeholder="Descrição"
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>

        <div>
          <Input
            type="file"
            onChange={(e) => setImagem(e.target.files?.[0] || null)}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <Input
            value={codigoBarras}
            placeholder="Código de barras"
            onChange={(e) => setCodigoBarras(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <Input
            value={estoqueMinimo}
            placeholder="Estoque mínimo"
            onChange={(e) => setEstoqueMinimo(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <Input
            value={preco}
            placeholder="Preço"
            onChange={(e) => setPreco(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
          >
            <option value="">Selecione categoria</option>

            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nome}
              </option>
            ))}
          </select>

          <span style={{ marginLeft: 10 }}>
            <Button type="button" onClick={criarCategoria}>
              + Categoria
            </Button>
          </span>
        </div>

        <Button> Salvar </Button>
      </form>
    </div>
  );
}
