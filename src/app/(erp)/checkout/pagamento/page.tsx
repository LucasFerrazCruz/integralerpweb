"use client";

import CartaoBrick from "@/components/forms/CartaoBrick";
import { Button } from "@/components/ui/button";
import { pagamentoService } from "@/services/pagamentoService";
import { pedidoService } from "@/services/pedidoService";
import { traduzirStatusMercadoPago } from "@/utils/mercadoPagoErrors";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function PagamentoPage() {
  const params = useSearchParams();
  const router = useRouter();

  const pedidoId = params.get("pedidoId");
  const tipo = params.get("tipo");

  const [pix, setPix] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [totalPedido, setTotalPedido] = useState(0);

  useEffect(() => {
    if (!pedidoId) return;

    async function carregarDadosPedido() {
      try {
        const pedido = await pedidoService.buscarPorId(Number(pedidoId));

        if (pedido.status === "PAGO") {
          toast.info("Este pedido já foi pago!");
          router.push("/pedidos");
          return;
        }

        setTotalPedido(pedido.total);
      } catch (e) {
        console.error("Erro ao carregar valor de pedido", e);
        toast.error("Erro ao carregar dados do pedido");
      }
    }

    carregarDadosPedido();
  }, [pedidoId]);

  // pix
  useEffect(() => {
    if (!pedidoId || tipo != "PIX") return;

    async function carregarPix() {
      try {
        const data = await pagamentoService.gerarPix(Number(pedidoId));

        if (data.qrCode) {
          setPix(data);
        } else {
          toast.error("Ocorreu um erro ao gerar o QR Code da operadora.");
        }
      } catch (e) {
        console.error(e);
        toast.error("Erro ao conectar com o serviço de pagamento");
      }
    }

    carregarPix();
  }, [pedidoId, tipo]);

  // STATUS (PIX polling)
  useEffect(() => {
    if (!pedidoId || tipo != "PIX") return;

    const interval = setInterval(async () => {
      try {
        const status = await pagamentoService.status(Number(pedidoId));

        if (status.status === "APROVADO") {
          toast.success("Pagamento aprovado!");
          router.push("/pedidos");
        }
      } catch (e) {
        console.error("Erro ao checar status", e);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [pedidoId, tipo, router]);

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

  const handleCartao = useCallback(
    async (data: any) => {
      try {
        setLoading(true);
        const res = await pagamentoService.pagarCartao(Number(pedidoId), {
          token: data.token,
          paymentMethodId: data.paymentMethodId,
          installments: data.installments,
          email: data.cardholderEmail,
        });

        if (res.status === "approved") {
          toast.success("Pagamento aprovado!");
          router.push("/pedidos");
        } else {
          const erroTecnico = res.statusDetail || res.detalheStatus || "";
          const mensagemAmigavel = traduzirStatusMercadoPago(erroTecnico);

          toast.error(`Pagamento recusado: ${mensagemAmigavel}`, {
            duration: 6000, // Dá mais tempo para o usuário ler instruções como "ligar para o banco"
          });
        }
      } catch (e) {
        console.error(e);
        toast.error("Erro ao pagar com cartão");
      } finally {
        setLoading(false);
      }
    },
    [pedidoId, router],
  );

  if (!pedidoId || !tipo) {
    return <p className="p-8">Dados de pagamento inválidos</p>;
  }

  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Pagamento</h1>
      <p className="text-muted-foreground">Pedido #{pedidoId}</p>

      {/* ===================== PIX ==================== */}
      {tipo === "PIX" && (
        <div className="space-y-4">
          {!pix ? (
            <p className="text-center animate-pulse">Gerando QR Code...</p>
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-lg font-semibold">
                Total: R$ {Number(pix.valor).toFixed(2)}
              </p>

              {pix.qrCodeBase64 && (
                <img
                  src={`data:image/png;base64,${pix.qrCodeBase64}`}
                  className="w-64 mx-auto border p-2 rounded-lg"
                  alt="QR Code Pix"
                />
              )}

              <textarea
                className="w-full border p-2 text-sm rounded bg-gray-50 font-mono"
                value={pix.qrCode || ""}
                readOnly
                rows={3}
              />

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  navigator.clipboard.writeText(pix.qrCode);
                  toast.success("Código copiado!");
                }}
              >
                Copiar Código Pix
              </Button>

              <hr />

              <Button
                variant="outline"
                className="w-full"
                onClick={simularPagamento}
                disabled={loading}
              >
                {loading ? "Processando..." : "Já paguei (Simular)"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* =============== CARTÃO =============== */}

      {tipo === "CARTAO" && (
        <>
          {totalPedido > 0 ? (
            <CartaoBrick amount={totalPedido} onToken={handleCartao} />
          ) : (
            <p className="text-center">Carregando formulário de pagamento...</p>
          )}
        </>
      )}

      {/* =============== BOLETO =============== */}
      {tipo === "BOLETO" && (
        <div className="p-4 border rounded bg-yellow-50 text-yellow-800">
          Boleto ainda não implementado
        </div>
      )}
    </div>
  );
}
