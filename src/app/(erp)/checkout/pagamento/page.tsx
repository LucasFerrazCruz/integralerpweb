"use client";

import CartaoBrick from "@/components/forms/CartaoBrick";
import { BoletoArea } from "@/components/layout/BoletoArea";
import { Button } from "@/components/ui/button";
import { pagamentoService } from "@/services/pagamentoService";
import { pedidoService } from "@/services/pedidoService";
import { BoletoData } from "@/types/Pagamento";
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
  const [pixCarregado, setPixCarregado] = useState(false);
  const [tempoRestante, setTempoRestante] = useState<string>("");
  const [boleto, setBoleto] = useState<BoletoData | null>(null);
  const [boletoCarregado, setBoletoCarregado] = useState(false);

  console.log("Tipo atual:", tipo);

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
    if (!pedidoId || tipo != "PIX" || pixCarregado) return;

    async function carregarPix() {
      try {
        setPixCarregado(true);
        const data = await pagamentoService.gerarPix(Number(pedidoId));

        if (data.qrCode) {
          setPix(data);
        } else {
          toast.error("Ocorreu um erro ao gerar o QR Code da operadora.");
        }
      } catch (e: any) {
        console.error(e);
        toast.error("Erro ao conectar com o serviço de pagamento");
      }
    }

    carregarPix();
  }, [pedidoId, tipo, pixCarregado]);

  // STATUS (PIX polling)
  useEffect(() => {
    if (!pedidoId || tipo != "PIX" || tempoRestante === "Expirado") return;

    const interval = setInterval(async () => {
      try {
        const status = await pagamentoService.status(Number(pedidoId));

        if (status.status === "APROVADO") {
          toast.success("Pagamento aprovado!");
          router.push("/pedidos");
        }

        if (status.status === "CANCELADO") {
          setTempoRestante("Expirado");
          toast.error("Este pagamento expirou ou foi cancelado.");
          clearInterval(interval);
        }
      } catch (e) {
        console.error("Erro ao checar status", e);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [pedidoId, tipo, router, tempoRestante]);

  useEffect(() => {
    if (!pix?.dataExpiracao) return;

    // Convertemos a string de expiração para um número fixo (timestamp)
    const dataExpiracaoTimestamp = new Date(pix.dataExpiracao).getTime();

    const interval = setInterval(() => {
      const agora = new Date().getTime();
      const diferenca = dataExpiracaoTimestamp - agora;

      if (diferenca <= 0) {
        setTempoRestante("Expirado");
        clearInterval(interval);
        return;
      }

      // Cálculo preciso de minutos e segundos
      const totalSegundos = Math.floor(diferenca / 1000);
      const minutos = Math.floor(totalSegundos / 60);
      const segundos = totalSegundos % 60;

      setTempoRestante(`${minutos}:${segundos < 10 ? "0" : ""}${segundos}`);

      console.log(pix.dataExpiracao);
      console.log(new Date().toISOString());
    }, 1000);

    return () => clearInterval(interval);
  }, [pix?.dataExpiracao]);

  // renderizar boleto
  useEffect(() => {
    if (!pedidoId || tipo !== "BOLETO" || boletoCarregado) return;

    async function dispararCargaBoleto() {
      setBoletoCarregado(true);
      try {
        await carregarBoleto();
      } catch (e) {
        console.error("Erro ao carregar boleto", e);
        toast.error("Erro ao gerar boleto bancário");
      }
    }

    dispararCargaBoleto();
  }, [pedidoId, tipo, boletoCarregado]);

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

        console.log("DEBUG: Dados brutos do Brick:", data);

        const payload = {
          pedidoId: Number(pedidoId),
          token: data.token,
          paymentMethodId: data.paymentMethodId,
          installments: data.installments,
          email: data.cardholderEmail,
        };

        console.log("DEBUG: Payload enviado para o Java:", payload);

        const res = await pagamentoService.pagarCartao(
          Number(pedidoId),
          payload,
        );

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

  async function carregarBoleto() {
    const data = await pagamentoService.gerarBoleto(Number(pedidoId));
    console.log("Chegou do Java:", data);
    setBoleto(data);
  }

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
              {/* Banner de Expiração */}
              {tempoRestante === "Expirado" ? (
                <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm">
                  <p className="font-bold text-lg">O código Pix expirou!</p>
                  <p className="text-sm mb-4">
                    Para concluir a compra, gere um novo código.
                  </p>
                  <Button
                    onClick={() => {
                      setPix(null);
                      setPixCarregado(false);
                      setTempoRestante("");
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Gerar novo código
                  </Button>
                </div>
              ) : (
                <>
                  {/* Cronômetro Ativo */}
                  <div className="bg-slate-50 border border-dashed border-slate-300 p-4 rounded-xl">
                    <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">
                      Aguardando pagamento...
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-3xl font-mono font-bold text-blue-600">
                        {tempoRestante}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">
                      O código expira em 30 minutos
                    </p>
                  </div>

                  <p className="text-lg font-semibold">
                    Total: R$ {Number(pix.valor).toFixed(2)}
                  </p>

                  {pix.qrCodeBase64 && (
                    <img
                      src={`data:image/png;base64,${pix.qrCodeBase64}`}
                      className="w-64 mx-auto border p-2 rounded-lg bg-white"
                      alt="QR Code Pix"
                    />
                  )}

                  <div className="space-y-2">
                    <p className="text-xs text-left text-muted-foreground">
                      Copia e cola:
                    </p>
                    <textarea
                      className="w-full border p-2 text-[10px] rounded bg-gray-50 font-mono"
                      value={pix.qrCode || ""}
                      readOnly
                      rows={3}
                    />
                  </div>

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
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* =============== CARTÃO (CRÉDITO OU DÉBITO) =============== */}

      {(tipo === "CARTAO_CREDITO" || tipo === "CARTAO_DEBITO") && (
        <>
          {totalPedido > 0 ? (
            <CartaoBrick
              key={`${pedidoId}-${tipo}`}
              amount={totalPedido}
              onToken={handleCartao}
            />
          ) : (
            <p className="text-center">Carregando formulário de pagamento...</p>
          )}
        </>
      )}

      {/* =============== BOLETO =============== */}
      {/* Só renderiza o BoletoArea se 'tipo' for BOLETO E se 'boleto' existir */}
      {tipo === "BOLETO" && boleto && <BoletoArea boleto={boleto} />}

      {/* Se tipo for BOLETO mas o boleto ainda não carregou, mostra o loading */}
      {tipo === "BOLETO" && !boleto && (
        <p className="text-center animate-pulse">Gerando seu boleto...</p>
      )}
    </div>
  );
}
