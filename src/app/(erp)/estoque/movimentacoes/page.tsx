"use client";

import { Suspense, useEffect, useState } from "react";
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

function MovimentacoesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [produtoId, setProdutoId] = useState<string>("");
  const [quantidade, setQuantidade] = useState("");
  const [movimentacoes, setMovimentacoes] = useState<any[]>([]);
  const [page, setPage] = useState(Number(searchParams.get("page") || 0));
  const [totalPages, setTotalPages] = useState(0);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const [tipoFiltro, setTipoFiltro] = useState(
    searchParams.get("tipo") || "ALL",
  );
  const [produtoFiltro, setProdutoFiltro] = useState(
    searchParams.get("produtoId") || "ALL",
  );

  const { isAdmin, isDistribuidor } = useRole();

  useEffect(() => {
    const params = new URLSearchParams();

    if (tipoFiltro !== "ALL") params.set("tipo", tipoFiltro);

    if (produtoFiltro !== "ALL") params.set("produtoId", produtoFiltro);

    if (dataInicio) params.set("dataInicio", dataInicio);

    if (dataFim) params.set("dataFim", dataFim);

    if (page > 0) params.set("page", page.toString());

    router.push(`/estoque/movimentacoes?${params.toString()}`);

    carregarProdutos();
    carregarMovimentacoes();
  }, [page, tipoFiltro, produtoFiltro, dataInicio, dataFim]);

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
      dataInicio: dataInicio ? `${dataInicio}T00:00:00` : undefined,
      dataFim: dataFim ? `${dataFim}T23:59:59` : undefined,
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

  function aplicarPeriodo(dias: number) {
    const hoje = new Date();
    const inicio = new Date();

    inicio.setDate(hoje.getDate() - dias);

    const format = (date: Date) => date.toISOString().slice(0, 10);

    setDataInicio(format(inicio));
    setDataFim(format(hoje));
    setPage(0);
  }

  function aplicarHoje() {
    const hoje = new Date().toISOString().slice(0, 10);
    setDataInicio(hoje);
    setDataFim(hoje);
    setPage(0);
  }

  function limparDatas() {
    setDataInicio("");
    setDataFim("");
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
          <div className="flex flex-wrap gap-2 items-center">
            {/* TIPO */}
            <Select value={tipoFiltro} onValueChange={handleTipoChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="ENTRADA_COMPRA">Entrada</SelectItem>
                <SelectItem value="SAIDA_TRANSFERENCIA">Saída</SelectItem>
              </SelectContent>
            </Select>

            {/* PRODUTO */}
            <Select value={produtoFiltro} onValueChange={handleProdutoChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Produto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {produtos.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* DATAS */}
            <Input
              type="date"
              value={dataInicio}
              onChange={(e) => {
                setDataInicio(e.target.value);
                setPage(0);
              }}
            />

            <Input
              type="date"
              value={dataFim}
              onChange={(e) => {
                setDataFim(e.target.value);
                setPage(0);
              }}
            />

            {/* BOTÕES RÁPIDOS */}
            <Button variant="outline" size="sm" onClick={aplicarHoje}>
              Hoje
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => aplicarPeriodo(7)}
            >
              7 dias
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => aplicarPeriodo(30)}
            >
              30 dias
            </Button>

            <Button variant="ghost" size="sm" onClick={limparDatas}>
              Limpar
            </Button>
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

export default function MovimentacoesPage() {
  return (
    <Suspense fallback={<div className="p-6">Carregando...</div>}>
      <MovimentacoesContent />
    </Suspense>
  );
}
