"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { produtoService } from "@/services/produtoService";
import { categoriaService } from "@/services/categoriaService";
import { Categoria } from "@/types/Categoria";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ProdutoForm({ produtoId }: { produtoId?: string }) {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [estoqueMinimo, setEstoqueMinimo] = useState("");
  const [categoriaId, setCategoriaId] = useState("");

  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    carregarCategorias();

    if (produtoId) {
      carregarProduto();
    }
  }, []);

  async function carregarCategorias() {
    const data = await categoriaService.listar();

    setCategorias(data);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();

    await produtoService.criar({
      nome,
      descricao,
      codigoBarras,
      estoqueMinimo: Number(estoqueMinimo),
      categoriaId: Number(categoriaId),
    });

    router.push("/catalogo/produtos");
  }

  async function criarCategoria() {
    const nomeCategoria = prompt("Nome da categoria");

    if (!nomeCategoria) return;

    await categoriaService.criar(nomeCategoria);

    await carregarCategorias();
  }

  async function carregarProduto() {
    const data = await produtoService.buscarPorId(produtoId);

    setNome(data.nome);
    setDescricao(data.descricao);
    setCodigoBarras(data.codigoBarras);
    setEstoqueMinimo(data.estoqueMinimo);
    setCategoriaId(String(data.categoriaId));
  }

  return (
    <div style={{ maxWidth: 500 }}>
      <h1>Novo Produto</h1>

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
            <Button onClick={criarCategoria}>+ Categoria</Button>
          </span>
        </div>

        <Button>Salvar</Button>
      </form>
    </div>
  );
}
