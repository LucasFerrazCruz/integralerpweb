"use client";

import { useState } from "react";
import { transferenciaService } from "@/services/transferenciaService";
import { useRole } from "@/hooks/useRole";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function RecebimentoPage() {
  const { isDistribuidor, isAdmin } = useRole();

  const [codigo, setCodigo] = useState("");
  const [transferencia, setTransferencia] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  if (!isDistribuidor && !isAdmin) {
    return (
      <div className="p-6">
        <p className="text-red-500">
          Você não tem permissão para acessar esta página.
        </p>
      </div>
    );
  }

  async function buscarTransferencia() {
    if (!codigo) {
      toast.error("Informe o código");
      return;
    }

    try {
      setLoading(true);

      const data = await transferenciaService.buscarPorCodigo(codigo);

      setTransferencia(data);
    } catch {
      toast.error("Transferência não encontrada");
      setTransferencia(null);
    } finally {
      setLoading(false);
    }
  }

  async function confirmar() {
    try {
      setLoading(true);

      await transferenciaService.confirmar(codigo);

      toast.success("Transferência confirmada");

      setCodigo("");
      setTransferencia(null);
    } catch {
      toast.error("Erro ao confirmar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Recebimento de Transferência</h1>

      {/* BUSCA */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm">Código</label>
            <Input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ex: TRF-ABC123"
            />
          </div>

          <Button onClick={buscarTransferencia} disabled={loading}>
            {loading ? "Buscando..." : "Buscar"}
          </Button>
        </CardContent>
      </Card>

      {/* RESULTADO */}
      {transferencia && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between">
              <span>
                Código: <b>{transferencia.codigo}</b>
              </span>

              <span className="text-sm">{transferencia.status}</span>
            </div>

            <div className="text-sm text-muted-foreground">
              {transferencia.origem} → {transferencia.destino}
            </div>

            {/* ITENS */}
            <div className="space-y-2">
              <h3 className="font-medium">Itens</h3>

              {transferencia.itens.map((item: any, i: number) => (
                <div
                  key={i}
                  className="border p-2 rounded flex justify-between"
                >
                  <span>{item.produtoNome}</span>
                  <span>{item.quantidade}</span>
                </div>
              ))}
            </div>

            {/* CONFIRMAR */}
            {transferencia.status === "ENVIADA" && (
              <>
                <Button onClick={confirmar} disabled={loading || isAdmin}>
                  {loading ? "Confirmando..." : "Confirmar recebimento"}
                </Button>

                {isAdmin && (
                  <p className="text-sm text-muted-foreground">
                    Apenas distribuidores podem confirmar recebimento.
                  </p>
                )}
              </>
            )}

            {transferencia.status !== "ENVIADA" && (
              <p className="text-sm text-muted-foreground">
                Esta transferência não pode ser confirmada.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
