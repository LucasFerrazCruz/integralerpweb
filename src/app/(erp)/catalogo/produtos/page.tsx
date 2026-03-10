"use client";

import { useEffect, useState } from "react";
import { produtoService } from "@/services/produtoService";
import { categoriaService } from "@/services/categoriaService";
import { Produto } from "@/types/Produto";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Table from "@/components/ui/Table";
import { useRouter } from "next/navigation";

export default function ProdutosPage() {
  const router = useRouter();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    const data = await produtoService.listar();

    setProdutos(data);
  }

  async function excluirProduto(id: number) {
    if (!confirm("Deseja excluir este produto?")) return;

    await produtoService.excluir(id);

    carregarProdutos();
  }

  async function criarCategoria() {
    const nome = prompt("Nome da categoria");

    if (!nome) return;

    await categoriaService.criar(nome);
  }

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div style={{ padding: 20 }}>
      <h1>Catálogo de Produtos</h1>

      <div style={{ marginBottom: 20 }}>
        <Input
          value={busca}
          placeholder="Buscar produto..."
          onChange={(e) => setBusca(e.target.value)}
        />

        <span style={{ marginLeft: 10 }}>
          <Button onClick={() => router.push("/catalogo/produtos/novo")}>
            Novo Produto
          </Button>
        </span>

        <span style={{ marginLeft: 10 }}>
          <Button onClick={criarCategoria}>Nova Categoria</Button>
        </span>
      </div>

      <Table>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Categoria</th>
            <th>Estoque</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {produtosFiltrados.map((produto) => (
            <tr key={produto.id}>
              <td>{produto.nome}</td>

              <td>{produto.categoria?.nome || "-"}</td>

              <td>{produto.estoque ?? "-"}</td>

              <td>
                <Button
                  onClick={() =>
                    router.push(`/catalogo/produtos/${produto.id}`)
                  }
                >
                  Editar
                </Button>

                <span style={{ marginLeft: 10 }}>
                  <Button onClick={() => excluirProduto(produto.id)}>
                    Excluir
                  </Button>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
