"use client";

import { useEffect, useState } from "react";
import { produtoService } from "@/services/produtoService";
import { ProdutosTable } from "@/components/tables/produtos-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/useRole";
import { centroService } from "@/services/centroService";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Centro } from "@/types/Centro";

export default function ProdutosEstoquePage() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const router = useRouter();
  const { isAdmin, isDistribuidor } = useRole();

  const [centros, setCentros] = useState<Centro[]>([]);
  const [centroSelecionado, setCentroSelecionado] = useState<
    number | undefined
  >(undefined);

  const [produtoParaExcluir, setProdutoParaExcluir] = useState<any>(null);
  const [confirmacao, setConfirmacao] = useState("");

  const [incluirInativos, setIncluirInativos] = useState(false);
  const [somenteBaixoEstoque, setSomenteBaixoEstoque] = useState(false);

  // ======================================================
  // LOAD CENTROS
  // ======================================================
  useEffect(() => {
    if (isAdmin) {
      carregarCentros();
    }
  }, [isAdmin]);

  // ======================================================
  // LOAD PRODUTOS
  // ======================================================
  useEffect(() => {
    if (isAdmin && !centroSelecionado) return;

    carregar();
  }, [centroSelecionado, incluirInativos, isAdmin]);

  async function carregar() {
    if (isAdmin && centroSelecionado == null) return;

    const data = await produtoService.listarComEstoque({
      centroId: isAdmin ? centroSelecionado : undefined,
      incluirInativos,
    });

    setProdutos(data);
  }

  // ======================================================
  // CENTRO BASE DEFAULT
  // ======================================================
  async function carregarCentros() {
    const data: Centro[] = await centroService.listar();
    setCentros(data);

    if (data.length > 0) {
      const centroBase = data.find((c) => c.tipo === "BASE");

      if (centroBase) {
        setCentroSelecionado(centroBase.id);
      } else {
        setCentroSelecionado(data[0].id);
      }
    }
  }

  // ======================================================
  // AÇÕES
  // ======================================================
  async function alternarStatus(id: number) {
    try {
      await produtoService.alternarStatus(id);
      await carregar();
    } catch {
      console.error("Erro ao alterar status");
    }
  }

  async function handleExcluirDefinitivo() {
    if (!produtoParaExcluir) return;

    try {
      await produtoService.excluirDefinitivo(produtoParaExcluir.id);

      setProdutoParaExcluir(null);
      setConfirmacao("");

      await carregar();
    } catch {
      console.error("Erro ao excluir");
    }
  }

  // ======================================================
  // FILTROS
  // ======================================================
  const produtosBaixoEstoque = produtos.filter(
    (p) => p.quantidade <= p.estoqueMinimo,
  );

  const produtosFiltrados = somenteBaixoEstoque
    ? produtosBaixoEstoque
    : produtos;

  // Ordena por menor estoque (prioridade visual)
  const produtosOrdenados = [...produtosFiltrados].sort(
    (a, b) => a.quantidade - b.quantidade,
  );

  // ======================================================
  // TABLE
  // ======================================================
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "nome",
      header: "Produto",
    },
    {
      accessorKey: "categoriaNome",
      header: "Categoria",
    },
    {
      id: "estoque",
      header: "Estoque",
      cell: ({ row }) => {
        const quantidade = row.original.quantidade;
        const minimo = row.original.estoqueMinimo;

        if (quantidade === 0) {
          return (
            <Badge variant="destructive" title="Sem estoque">
              Sem estoque (0 / min: {minimo})
            </Badge>
          );
        }

        if (quantidade < minimo) {
          return (
            <Badge variant="destructive" title="Abaixo do mínimo">
              Baixo ({quantidade} / min: {minimo})
            </Badge>
          );
        }

        if (quantidade === minimo) {
          return (
            <Badge variant="secondary" title="No limite mínimo">
              No limite ({quantidade})
            </Badge>
          );
        }

        return (
          <Badge variant="default" title="Estoque OK">
            OK ({quantidade})
          </Badge>
        );
      },
    },
    {
      accessorKey: "ativo",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.ativo ? "default" : "destructive"}>
          {row.original.ativo ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      id: "acoes",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {isAdmin && (
            <Button
              size="sm"
              onClick={() =>
                router.push(`/estoque/produtos/${row.original.id}`)
              }
            >
              Editar
            </Button>
          )}

          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => alternarStatus(row.original.id)}
            >
              {row.original.ativo ? "Desativar" : "Ativar"}
            </Button>
          )}

          {isAdmin && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setProdutoParaExcluir(row.original)}
            >
              Excluir
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isAdmin || isDistribuidor) {
    return (
      <div className="p-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Produtos</h1>

          {isAdmin && (
            <Button onClick={() => router.push("/estoque/produtos/novo")}>
              Novo Produto
            </Button>
          )}
        </div>

        {/* ALERTA */}
        {produtosBaixoEstoque.length > 0 && (
          <div className="mb-4 p-3 border rounded bg-red-50 text-red-700">
            ⚠️ {produtosBaixoEstoque.length} produto(s) com estoque baixo
          </div>
        )}

        {/* FILTROS */}
        <div className="flex flex-wrap gap-4 items-center mb-4">
          {isAdmin && (
            <Select
              value={centroSelecionado?.toString()}
              onValueChange={(value) => setCentroSelecionado(Number(value))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Centro" />
              </SelectTrigger>

              <SelectContent>
                {centros.map((centro) => (
                  <SelectItem key={centro.id} value={centro.id.toString()}>
                    {centro.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm">Inativos</span>
            <Switch
              checked={incluirInativos}
              onCheckedChange={setIncluirInativos}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">Baixo estoque</span>
            <Switch
              checked={somenteBaixoEstoque}
              onCheckedChange={setSomenteBaixoEstoque}
            />
          </div>

          {/* INFO CENTRO */}
          {isAdmin && centroSelecionado && (
            <span className="text-sm text-muted-foreground ml-auto">
              Visualizando:{" "}
              <b>{centros.find((c) => c.id === centroSelecionado)?.nome}</b>
            </span>
          )}
        </div>

        {/* TABELA */}
        <ProdutosTable columns={columns} data={produtosOrdenados} />

        {/* DIALOG EXCLUSÃO */}
        <Dialog
          open={!!produtoParaExcluir}
          onOpenChange={() => {
            setProdutoParaExcluir(null);
            setConfirmacao("");
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir produto</DialogTitle>
            </DialogHeader>

            <p className="text-sm text-muted-foreground">
              Digite o nome do produto para confirmar:
            </p>

            <p className="font-semibold">{produtoParaExcluir?.nome}</p>

            <Input
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              placeholder="Digite o nome exatamente"
            />

            <Button
              variant="destructive"
              disabled={confirmacao !== produtoParaExcluir?.nome}
              onClick={handleExcluirDefinitivo}
            >
              Confirmar exclusão
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return null;
}
