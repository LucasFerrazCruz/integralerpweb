"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { produtoService } from "@/services/produtoService";
import { pedidoService } from "@/services/pedidoService";
import { toast } from "sonner";

export default function VendaManualPage() {
  const [busca, setBusca] = useState("");
  const [produtos, setProdutos] = useState<any[]>([]);
  const [itens, setItens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [clienteNome, setClienteNome] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("DINHEIRO");

  async function buscarProdutos() {
    const data = await produtoService.listarCatalogo({ q: busca });
    setProdutos(data);
  }

  useEffect(() => {
    const delay = setTimeout(() => {
      buscarProdutos();
    }, 300);

    return () => clearTimeout(delay);
  }, [busca]);

  function adicionarProduto(produto: any) {
    toast.success(`${produto.nome} adicionado`);

    setItens((prev) => {
      const existente = prev.find((i) => i.produtoId === produto.id);

      if (existente) {
        return prev.map((i) =>
          i.produtoId === produto.id
            ? { ...i, quantidade: i.quantidade + 1 }
            : i,
        );
      }

      return [
        ...prev,
        {
          produtoId: produto.id,
          nome: produto.nome,
          preco: produto.preco,
          quantidade: 1,
        },
      ];
    });
  }

  function alterarQuantidade(produtoId: number, quantidade: number) {
    setItens((prev) =>
      prev
        .map((i) => (i.produtoId === produtoId ? { ...i, quantidade } : i))
        .filter((i) => i.quantidade > 0),
    );
  }

  async function finalizarVenda() {
    try {
      setLoading(true);

      await pedidoService.criarManual({
        itens: itens.map((i) => ({
          produtoId: i.produtoId,
          quantidade: i.quantidade,
        })),
        clienteNome,
        formaPagamento,
      });

      toast.success("Venda realizada com sucesso!");
      setItens([]);
      setClienteNome("");
      setFormaPagamento("Dinheiro");
    } catch {
      toast.error("Erro ao realizar venda");
    } finally {
      setLoading(false);
    }
  }

  const total = itens.reduce((acc, i) => acc + i.preco * i.quantidade, 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Venda Manual</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PRODUTOS */}
        <div className="lg:col-span-2 space-y-4">
          {/* BUSCA */}
          <div className="flex gap-2">
            <Input
              placeholder="Buscar produto..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <Button onClick={buscarProdutos}>Buscar</Button>
          </div>

          {/* LISTA DE PRODUTOS */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {produtos.map((p) => (
              <Card
                key={p.id}
                className="cursor-pointer hover:shadow-md transition"
                onClick={() => adicionarProduto(p)}
              >
                <CardContent className="p-4 space-y-2">
                  <p className="font-medium line-clamp-2">{p.nome}</p>

                  <p className="text-green-600 font-bold">
                    R$ {p.preco.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* RESUMO DA VENDA */}
        <div className="border rounded-xl p-4 space-y-4 h-fit sticky top-6">
          <h2 className="text-lg font-semibold">Resumo</h2>

          {/* ITENS */}
          <div className="space-y-3 max-h-100 overflow-auto">
            {itens.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum item adicionado
              </p>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente (opcional)</label>
              <Input
                placeholder="Nome do cliente"
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Forma de pagamento</label>

              <div className="grid grid-cols-3 gap-2">
                {["DINHEIRO", "PIX", "CARTAO"].map((fp) => (
                  <Button
                    key={fp}
                    variant={formaPagamento === fp ? "default" : "outline"}
                    onClick={() => setFormaPagamento(fp)}
                  >
                    {fp}
                  </Button>
                ))}
              </div>
            </div>

            {itens.map((item) => (
              <div key={item.produtoId} className="flex items-center gap-2">
                <span className="flex-1 text-sm">{item.nome}</span>

                {/* CONTROLES */}
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      alterarQuantidade(item.produtoId, item.quantidade - 1)
                    }
                  >
                    -
                  </Button>

                  <span className="w-6 text-center">{item.quantidade}</span>

                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      alterarQuantidade(item.produtoId, item.quantidade + 1)
                    }
                  >
                    +
                  </Button>
                </div>

                {/* SUBTOTAL */}
                <span className="w-20 text-right text-green-600 font-semibold text-sm">
                  R$ {(item.preco * item.quantidade).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* TOTAL */}
          <div className="border-t pt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-green-600">R$ {total.toFixed(2)}</span>
          </div>

          {/* BOTÕES */}
          <div className="space-y-2">
            <Button
              className="w-full bg-black text-white"
              disabled={!itens.length || loading}
              onClick={finalizarVenda}
            >
              {loading ? "Finalizando..." : "Finalizar Venda"}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setItens([])}
            >
              Limpar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
