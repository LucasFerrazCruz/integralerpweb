"use client";

import { useEffect, useState } from "react";
import { produtoService } from "@/services/produtoService";
import { centroService } from "@/services/centroService";
import { transferenciaService } from "@/services/transferenciaService";

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

export default function TransferenciasPage() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [centros, setCentros] = useState<any[]>([]);
  const [destinoId, setDestinoId] = useState<string>("");

  const [itens, setItens] = useState<any[]>([
    { produtoId: "", quantidade: "" },
  ]);

  const [transferencias, setTransferencias] = useState<any[]>([]);
  const { isAdmin } = useRole();

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const [produtosData, centrosData, transfData] = await Promise.all([
      produtoService.listar({ incluirInativos: false }),
      centroService.listar(),
      transferenciaService.listar(),
    ]);

    setProdutos(produtosData);

    // remover BASE da lista de destino
    setCentros(centrosData.filter((c: any) => c.tipo !== "BASE"));

    setTransferencias(transfData);
  }

  function adicionarItem() {
    setItens([...itens, { produtoId: "", quantidade: "" }]);
  }

  function atualizarItem(index: number, campo: string, valor: string) {
    const novos = [...itens];
    novos[index][campo] = valor;
    setItens(novos);
  }

  async function criarTransferencia() {
    if (!destinoId) {
      toast.error("Selecione o destino");
      return;
    }

    const itensValidos = itens.filter((i) => i.produtoId && i.quantidade);

    if (itensValidos.length === 0) {
      toast.error("Adicione ao menos um item");
      return;
    }

    try {
      await transferenciaService.criar({
        destinoId: Number(destinoId),
        itens: itensValidos.map((i) => ({
          produtoId: Number(i.produtoId),
          quantidade: Number(i.quantidade),
        })),
      });

      toast.success("Transferência criada");

      setItens([{ produtoId: "", quantidade: "" }]);
      setDestinoId("");

      carregar();
    } catch {
      toast.error("Erro ao criar");
    }
  }

  async function enviarTransferencia(id: number) {
    try {
      await transferenciaService.enviar(id);
      toast.success("Transferência enviada");
      carregar();
    } catch {
      toast.error("Erro ao enviar");
    }
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <p className="text-red-500">
          Você não tem permissão para acessar esta página.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Transferências</h1>

      {/* FORM */}
      <Card>
        <CardContent className="p-6 space-y-4">
          {/* DESTINO */}
          <div>
            <label className="text-sm">Destino</label>
            <Select value={destinoId} onValueChange={setDestinoId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o distribuidor" />
              </SelectTrigger>
              <SelectContent>
                {centros.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ITENS */}
          {itens.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Select
                value={item.produtoId}
                onValueChange={(v) => atualizarItem(index, "produtoId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="Qtd"
                value={item.quantidade}
                onChange={(e) =>
                  atualizarItem(index, "quantidade", e.target.value)
                }
              />
            </div>
          ))}

          <Button variant="outline" onClick={adicionarItem}>
            + Adicionar item
          </Button>

          <Button onClick={criarTransferencia}>Criar transferência</Button>
        </CardContent>
      </Card>

      {/* LISTA */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="font-semibold">Transferências</h2>

          {transferencias.map((t) => (
            <div key={t.id} className="border p-3 rounded space-y-2">
              <div className="flex justify-between">
                <span>
                  Código: <b>{t.codigo}</b>
                </span>

                <span>{t.status}</span>
              </div>

              <div className="text-sm text-muted-foreground">
                {t.origem} → {t.destino}
              </div>

              <div className="text-sm">
                {t.itens.map((i: any, idx: number) => (
                  <div key={idx}>
                    {i.produtoNome} - {i.quantidade}
                  </div>
                ))}
              </div>

              {t.status === "CRIADA" && (
                <Button size="sm" onClick={() => enviarTransferencia(t.id)}>
                  Enviar
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
