"use client";

import { Button } from "@/components/ui/button";
import { useCarrinho } from "@/context/CarrinhoContext";
import { pagamentoService } from "@/services/pagamentoService";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PagamentoPage() {
  const params = useSearchParams();
  const router = useRouter();
  const pedidoId = params.get("pedidoId");
  const [pix, setPix] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  // const [limparCarrinho] = useCarrinho();

  useEffect(() => {
    async function carregarPix() {
      if (!pedidoId) return;

      const data = await pagamentoService.gerarPix(Number(pedidoId));
      setPix(data);
    }

    carregarPix();
  }, [pedidoId]);

  async function simularPagamento() {
    try {
      setLoading(true);

      await pagamentoService.simular(Number(pedidoId));

      toast.success("Pagamento aprovado!");

      router.push("/pedidos");
    } catch {
      toast.error("Erro no pagamento");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Pagamento</h1>

      <p className="text-muted-foreground">Pedido #{pedidoId}</p>

      <Button
        className="w-full bg-black text-white"
        onClick={simularPagamento}
        disabled={loading}
      >
        {loading ? "Processando..." : "Pagar agora"}
      </Button>

      {pix && (
        <div className="space-y-4">
          <img
            src={`data:image/png;base64,${pix.qrCodeBase64}`}
            className="w-64 mx-auto"
          />

          <textarea
            className="w-full border p-2 text-sm"
            value={pix.qrCode}
            readOnly
          />

          <p className="text-center text-sm text-muted-foreground">
            Escaneie ou copie o código PIX
          </p>
        </div>
      )}
    </div>
  );
}
