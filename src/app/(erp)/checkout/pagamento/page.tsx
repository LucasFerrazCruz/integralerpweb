"use client";

import { BoletoArea } from "@/components/layout/BoletoArea";
import { Button } from "@/components/ui/button";
import { pagamentoService } from "@/services/pagamentoService";
import { pedidoService } from "@/services/pedidoService";
import { BoletoData } from "@/types/Pagamento";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function PagamentoContent() {
  const params = useSearchParams();
  const router = useRouter();

  const pedidoId = params.get("pedidoId");
  const tipo = params.get("tipo");

  // Captura os dados que vieram do formulário da CheckoutPage
  const nomePagador = params.get("nomePagador") || "";
  const email = params.get("email") || "";
  const cpf = params.get("cpf") || "";

  const [pix, setPix] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [totalPedido, setTotalPedido] = useState(0);
  const [pixCarregado, setPixCarregado] = useState(false);
  const [tempoRestante, setTempoRestante] = useState<string>("");
  const [boleto, setBoleto] = useState<BoletoData | null>(null);
  const [boletoCarregado, setBoletoCarregado] = useState(false);

  const idPedidoNum = Number(pedidoId);
  const carregandoPixRef = useRef(false);

  // 1. Validar e carregar dados básicos do pedido
  useEffect(() => {
    if (!pedidoId) return;

    async function carregarDadosPedido() {
      try {
        const pedido = await pedidoService.buscarPorId(idPedidoNum);

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
  }, [pedidoId, idPedidoNum, router]);

  // 2. Fluxo de geração do PIX
  useEffect(() => {
    if (!pedidoId || tipo !== "PIX" || pixCarregado || carregandoPixRef.current)
      return;

    async function carregarPix() {
      try {
        carregandoPixRef.current = true;
        setPixCarregado(true);

        // 🚀 AGORA PASSANDO O NOME CORRETAMENTE PARA O BACKEND
        const data = await pagamentoService.gerarPix(idPedidoNum, {
          nomePagador: nomePagador,
          emailPagador: email,
          cpfPagador: cpf,
        });

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
  }, [pedidoId, tipo, pixCarregado, idPedidoNum, nomePagador, email, cpf]);

  // 3. Polling de checagem de status do PIX (5 em 5 segundos)
  useEffect(() => {
    if (!pedidoId || tipo !== "PIX" || !pix || tempoRestante === "Expirado")
      return;

    const interval = setInterval(async () => {
      try {
        const status = await pagamentoService.status(idPedidoNum);

        if (status.status === "APROVADO" || status.status === "approved") {
          toast.success("Pagamento aprovado com sucesso!");
          clearInterval(interval);
          router.push("/pedidos");
        }

        if (status.status === "CANCELADO" || status.status === "cancelled") {
          setTempoRestante("Expirado");
          toast.error("Este pagamento expirou ou foi cancelado.");
          clearInterval(interval);
        }
      } catch (e) {
        console.error("Erro ao checar status", e);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [pedidoId, idPedidoNum, tipo, router, tempoRestante, pix]);

  // 4. Countdown do Cronômetro do PIX
  useEffect(() => {
    if (!pix?.dataExpiracao) return;

    const dataExpiracaoTimestamp = new Date(pix.dataExpiracao).getTime();

    const interval = setInterval(() => {
      const agora = new Date().getTime();
      const diferenca = dataExpiracaoTimestamp - agora;

      if (diferenca <= 0) {
        setTempoRestante("Expirado");
        clearInterval(interval);
        return;
      }

      const totalSegundos = Math.floor(diferenca / 1000);
      const minutos = Math.floor(totalSegundos / 60);
      const segundos = totalSegundos % 60;

      setTempoRestante(`${minutos}:${segundos < 10 ? "0" : ""}${segundos}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [pix?.dataExpiracao]);

  // 5. Fluxo de geração do BOLETO
  useEffect(() => {
    if (!pedidoId || tipo !== "BOLETO" || boletoCarregado) return;

    async function dispararCargaBoleto() {
      setBoletoCarregado(true);
      try {
        const data = await pagamentoService.gerarBoleto(idPedidoNum);
        setBoleto(data);
      } catch (e) {
        console.error("Erro ao carregar boleto", e);
        toast.error("Erro ao gerar boleto bancário");
      }
    }

    dispararCargaBoleto();
  }, [pedidoId, idPedidoNum, tipo, boletoCarregado]);

  // Simulador local para testes em ambiente de desenvolvimento
  async function simularPagamento() {
    try {
      setLoading(true);
      await pagamentoService.simular(idPedidoNum);
      toast.success("Pagamento simulado e aprovado!");
      router.push("/pedidos");
    } catch {
      toast.error("Erro ao simular pagamento");
    } finally {
      setLoading(false);
    }
  }

  if (!pedidoId || !tipo) {
    return (
      <p className="p-8 text-center text-red-500">
        Dados de pagamento inválidos
      </p>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Finalize o seu Pagamento
        </h1>
        <p className="text-muted-foreground text-sm">Pedido #{pedidoId}</p>
      </div>

      {/* ===================== RENDERIZAÇÃO PIX ==================== */}
      {tipo === "PIX" && (
        <div className="space-y-4">
          {!pix ? (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground animate-pulse">
                Gerando seu QR Code Pix do Mercado Pago...
              </p>
            </div>
          ) : (
            <div className="space-y-5 text-center">
              {tempoRestante === "Expirado" ? (
                <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm space-y-3">
                  <p className="font-bold text-lg">O código Pix expirou!</p>
                  <p className="text-xs">
                    Para concluir a sua compra, será necessário gerar um novo
                    código de pagamento.
                  </p>
                  <Button
                    onClick={() => {
                      setPix(null);
                      setPixCarregado(false);
                      setTempoRestante("");
                      carregandoPixRef.current = false;
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Gerar novo código
                  </Button>
                </div>
              ) : (
                <>
                  <div className="bg-slate-50 border border-dashed border-slate-300 p-4 rounded-xl">
                    <p className="text-xs uppercase tracking-widest text-slate-500 mb-1 flex items-center justify-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin text-blue-600" />{" "}
                      Aguardando detecção do pagamento...
                    </p>
                    <div className="text-3xl font-mono font-bold text-blue-600 mt-1">
                      {tempoRestante || "30:00"}
                    </div>
                  </div>

                  <div className="text-xl font-bold text-foreground">
                    Total a pagar: R${" "}
                    {Number(pix.valor || totalPedido).toFixed(2)}
                  </div>

                  {pix.qrCodeBase64 && (
                    <div className="bg-white p-3 border rounded-xl inline-block shadow-sm">
                      <img
                        src={`data:image/png;base64,${pix.qrCodeBase64}`}
                        className="w-56 h-56 mx-auto"
                        alt="QR Code Pix Mercado Pago"
                      />
                    </div>
                  )}

                  <div className="space-y-1 text-left">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Código Copia e Cola:
                    </label>
                    <textarea
                      className="w-full border p-2 text-[11px] rounded-lg bg-slate-50 font-mono text-slate-600 focus:outline-none"
                      value={pix.qrCode || ""}
                      readOnly
                      rows={3}
                    />
                  </div>

                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                    onClick={() => {
                      navigator.clipboard.writeText(pix.qrCode);
                      toast.success("Código Copia e Cola copiado!");
                    }}
                  >
                    Copiar Código Pix
                  </Button>

                  <div className="pt-2 border-t border-dashed">
                    <Button
                      variant="ghost"
                      className="w-full text-xs text-muted-foreground hover:text-foreground"
                      onClick={simularPagamento}
                      disabled={loading}
                    >
                      {loading
                        ? "Processando..."
                        : "Ambiente de Teste: Ativar Simulação de Pagamento"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================== RENDERIZAÇÃO BOLETO ==================== */}
      {tipo === "BOLETO" && (
        <div className="space-y-4">
          {boleto ? (
            <BoletoArea boleto={boleto} />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              <p className="text-sm text-muted-foreground animate-pulse">
                Registrando e gerando boleto bancário...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PagamentoPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-muted-foreground">
          Carregando módulo de pagamento...
        </div>
      }
    >
      <PagamentoContent />
    </Suspense>
  );
}
