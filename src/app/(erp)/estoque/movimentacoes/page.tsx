"use client";

import { useEffect, useState } from "react";
import { produtoService } from "@/services/produtoService";
import { movimentacaoService } from "@/services/movimentacaoService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useRole } from "@/hooks/useRole";
import { useSearchParams, useRouter } from "next/navigation";

export default function MovimentacoesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [produtoId, setProdutoId] = useState<string>("");
  const [quantidade, setQuantidade] = useState("");
  const [movimentacoes, setMovimentacoes] = useState<any[]>([]);
  const [page, setPage] = useState(Number(searchParams.get("page") || 0));
  const [totalPages, setTotalPages] = useState(0);

  const [tipoFiltro, setTipoFiltro] = useState(
    searchParams.get("tipo") || "ALL",
  );
  const [produtoFiltro, setProdutoFiltro] = useState(
    searchParams.get("produtoId") || "ALL",
  );

  const { isAdmin, isDistribuidor } = useRole();

  useEffect(() => {
    const params = new URLSearchParams();

    if (tipoFiltro !== "ALL") {
      params.set("tipo", tipoFiltro);
    }

    if (produtoFiltro !== "ALL") {
      params.set("produtoId", produtoFiltro);
    }

    if (page > 0) {
      params.set("page", page.toString());
    }

    router.push(`/estoque/movimentacoes?${params.toString()}`);

    carregarProdutos();
    carregarMovimentacoes();
  }, [page, tipoFiltro, produtoFiltro]);

  if (!isAdmin && !isDistribuidor) {
    return (
      <div className="p-6">
        <p className="text-red-500">
          Você não tem permissão para acessar esta página.
        </p>
      </div>
    );
  }

  async function carregarProdutos() {
    const data = await produtoService.listar({
      incluirInativos: false,
    });
    setProdutos(data);
  }

  async function carregarMovimentacoes() {
    const data = await movimentacaoService.listar({
      tipo: tipoFiltro === "ALL" ? undefined : tipoFiltro,
      produtoId:
        produtoFiltro === "ALL"
          ? undefined
          : produtoFiltro
            ? Number(produtoFiltro)
            : undefined,
      page,
      size: 5,
    });
    setMovimentacoes(data.content);
    setTotalPages(data.totalPages);
  }

  async function handleEntrada() {
    if (!produtoId || !quantidade) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await movimentacaoService.entrada(Number(produtoId), Number(quantidade));

      await carregarMovimentacoes();

      toast.success("Entrada realizada com sucesso");

      setQuantidade("");
      setProdutoId("");
    } catch (err) {
      toast.error("Erro ao realizar entrada");
    }
  }

  function handleTipoChange(value: string) {
    setTipoFiltro(value);
    setPage(0);
  }

  function handleProdutoChange(value: string) {
    setProdutoFiltro(value);
    setPage(0);
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">Movimentação de Estoque</h1>

      {isDistribuidor && (
        <p className="text-sm text-muted-foreground mb-4">
          Você pode visualizar as movimentações, mas não pode realizar entradas
          de estoque.
        </p>
      )}

      {isAdmin && (
        <Card>
          <CardContent className="p-6 flex flex-col gap-4">
            {/* PRODUTO */}
            <div>
              <label className="text-sm">Produto</label>
              <Select value={produtoId} onValueChange={setProdutoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* QUANTIDADE */}
            <div>
              <label className="text-sm">Quantidade</label>
              <Input
                type="number"
                placeholder="Ex: 100"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </div>

            {/* BOTÃO */}
            <Button onClick={handleEntrada}>Confirmar entrada</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-2">
            {/* TIPO */}
            <Select value={tipoFiltro} onValueChange={handleTipoChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                {/* value="" é ideal para o caso "Todos" */}
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="ENTRADA_COMPRA">Entrada</SelectItem>
                <SelectItem value="SAIDA_TRANSFERENCIA">Saída</SelectItem>
              </SelectContent>
            </Select>

            {/* PRODUTO */}
            <Select value={produtoFiltro} onValueChange={handleProdutoChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Produto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {produtos.map((produto) => (
                  <SelectItem key={produto.id} value={produto.id.toString()}>
                    {produto.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <h2 className="font-semibold">Histórico de Movimentações</h2>

          <div className="space-y-2">
            {movimentacoes.map((movimentacao) => (
              <div
                key={movimentacao.id}
                className="border p-3 rounded flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{movimentacao.produtoNome}</div>
                  <div className="text-sm text-muted-foreground">
                    {movimentacao.centroNome}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {new Date(movimentacao.createdAt).toLocaleString("pt-BR")}
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-xs font-semibold ${
                      movimentacao.tipo.includes("ENTRADA")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {movimentacao.tipo}
                  </div>
                  <div className="font-semibold">{movimentacao.quantidade}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              disabled={page === 0}
            >
              Anterior
            </Button>

            <span>
              Página {page + 1} de {totalPages}
            </span>

            <Button
              onClick={() => setPage((p) => p + 1)}
              disabled={page + 1 >= totalPages}
            >
              Próxima
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
