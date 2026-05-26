"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useCarrinho } from "@/context/CarrinhoContext";
import { pedidoService } from "@/services/pedidoService";
import { freteService } from "@/services/freteService";
import { useSession } from "next-auth/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Barcode, CreditCard, Loader2, QrCode } from "lucide-react";
import CartaoBrick from "@/components/forms/CartaoBrick";
import { pagamentoService } from "@/services/pagamentoService";
import { traduzirStatusMercadoPago } from "@/utils/mercadoPagoErrors";

interface OpcaoFrete {
  nomeServico: string;
  valor: number;
  prazoEntrega: number;
  empresa: string;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const { carrinho, limparCarrinho } = useCarrinho();
  const router = useRouter();

  const [endereco, setEndereco] = useState({
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    apelido: "Casa",
  });
  const [dadosPagador, setDadosPagador] = useState({
    nomeCompleto: "",
    cpfCnpj: "",
    email: "",
  });
  const [formaPagamento, setFormaPagamento] = useState<string>("");

  const [buscandoCep, setBuscandoCep] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [processandoPagamento, setProcessandoPagamento] = useState(false);
  const [pedidoCriado, setPedidoCriado] = useState<any>(null);

  const [opcoesFrete, setOpcoesFrete] = useState<OpcaoFrete[]>([]);
  const [carregandoFrete, setCarregandoFrete] = useState(false);
  const [freteSelecionado, setFreteSelecionado] = useState<OpcaoFrete | null>(
    null,
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Você precisa estar logado para finalizar a compra.");
      router.push("/login?callbackUrl=/checkout");
    }
  }, [status, router]);

  // Handler do processamento assíncrono via Cartão de Crédito (Mercado Pago)
  async function handleCartao(data: any) {
    if (!pedidoCriado) return;

    try {
      setProcessandoPagamento(true);

      const payload = {
        pedidoId: Number(pedidoCriado.id),
        token: data.token,
        paymentMethodId: data.paymentMethodId,
        installments: Number(data.installments),
        email:
          data.cardholderEmail || dadosPagador.email || session?.user?.email,
        cpf: dadosPagador.cpfCnpj,
      };

      const res = await pagamentoService.pagarCartao(
        Number(pedidoCriado.id),
        payload,
      );

      if (res.status === "approved") {
        toast.success("Pagamento aprovado!");
        if (limparCarrinho) await limparCarrinho();
        router.push("/pedidos");
      } else {
        const erroTecnico = res.statusDetail || res.detalheStatus || "";
        const mensagemAmigavel = traduzirStatusMercadoPago(erroTecnico);

        toast.error(`Pagamento recusado: ${mensagemAmigavel}`, {
          duration: 6000,
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao pagar com cartão");
    } finally {
      setProcessandoPagamento(false);
    }
  }

  // Validações antes de criar o pedido backend
  function validarDados() {
    if (!endereco.cep || !endereco.numero)
      return "CEP e Número são obrigatórios";
    if (!freteSelecionado) return "Selecione uma opção de frete";
    if (!formaPagamento) return "Selecione uma forma de pagamento";
    if (
      (formaPagamento === "PIX" || formaPagamento === "BOLETO") &&
      (!dadosPagador.email ||
        !dadosPagador.cpfCnpj ||
        !dadosPagador.nomeCompleto)
    ) {
      return "Nome, E-mail e CPF/CNPJ são obrigatórios para esta forma de pagamento";
    }
    return null;
  }

  // Registra o pedido e decide se exibe o Brick local ou empurra para a PagamentoPage
  async function iniciarFluxoFinalizacao() {
    const erroValidacao = validarDados();
    if (erroValidacao) {
      toast.error(erroValidacao);
      return;
    }

    // Atualização dinâmica do valor do frete
    const freteValorCalculado = freteSelecionado?.valor || 0;

    try {
      setFinalizando(true);

      const pedido = await pedidoService.criar({
        endereco: endereco,
        formaPagamento,
        valorFrete: freteValorCalculado,
        transportadora: `${freteSelecionado?.empresa} - ${freteSelecionado?.nomeServico}`,
      });

      setPedidoCriado(pedido);

      if (formaPagamento === "CARTAO_CREDITO") {
        toast.success(
          "Pedido registrado! Insira os dados do cartão para finalizar.",
        );
      } else {
        // Se for PIX ou BOLETO, limpa carrinho de imediato e delega para a PagamentoPage
        if (limparCarrinho) await limparCarrinho();

        // 🚀 CORREÇÃO: Adicionado o 'nomePagador' na query string para o Pix/Boleto usar
        const urlParams = new URLSearchParams({
          pedidoId: pedido.id.toString(),
          tipo: formaPagamento,
          nomePagador: dadosPagador.nomeCompleto,
          email: dadosPagador.email,
          cpf: dadosPagador.cpfCnpj,
          zipCode: endereco.cep,
        });
        router.push(`/checkout/pagamento?${urlParams.toString()}`);
      }
    } catch (err) {
      toast.error("Erro ao registrar pedido.");
    } finally {
      setFinalizando(false);
    }
  }

  async function calcularFrete(cepDestino: string) {
    try {
      setCarregandoFrete(true);
      setFreteSelecionado(null);
      const dados = await freteService.calcular({ cepDestino });
      setOpcoesFrete(dados);
    } catch {
      toast.error("Não foi possível calcular o frete.");
    } finally {
      setCarregandoFrete(false);
    }
  }

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, "");
    setEndereco({ ...endereco, cep });

    if (cep.length === 8) {
      try {
        setBuscandoCep(true);
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
          toast.error("CEP não encontrado.");
          return;
        }

        setEndereco((prev) => ({
          ...prev,
          logradouro: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          uf: data.uf,
        }));

        calcularFrete(cep);
      } catch {
        toast.error("Erro ao buscar CEP.");
      } finally {
        setBuscandoCep(false);
      }
    }
  };

  if (status === "unauthenticated") return null;
  if (!carrinho)
    return <p className="p-8">Erro ao carregar dados do carrinho.</p>;

  if (carrinho.itens.length === 0) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Carrinho vazio</h1>
        <p className="text-muted-foreground">
          Adicione produtos antes de continuar
        </p>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Carregando checkout...</p>
      </div>
    );
  }

  const valorTotalComFrete = carrinho.total + (freteSelecionado?.valor || 0);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Finalizar Compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* COLUNA ESQUERDA: FORMULÁRIOS */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. ENDEREÇO */}
          <Card
            className={`shadow-sm ${pedidoCriado ? "opacity-60 pointer-events-none" : ""}`}
          >
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold text-lg flex items-center gap-2 border-b pb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  1
                </span>
                Endereço de Entrega
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    maxLength={8}
                    placeholder="00000000"
                    value={endereco.cep}
                    onChange={handleCepChange}
                    className="mt-1"
                  />
                  {buscandoCep && (
                    <span className="text-xs text-blue-500 animate-pulse">
                      Buscando...
                    </span>
                  )}
                </div>
                <div className="md:col-span-4">
                  <Label htmlFor="rua">Logradouro / Rua</Label>
                  <Input
                    id="rua"
                    value={endereco.logradouro}
                    readOnly
                    className="mt-1 bg-muted"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    placeholder="Ex: 123"
                    value={endereco.numero}
                    onChange={(e) =>
                      setEndereco({ ...endereco, numero: e.target.value })
                    }
                    className="mt-1 border-primary"
                  />
                </div>
                <div className="md:col-span-4">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    placeholder="Apt, Bloco..."
                    value={endereco.complemento}
                    onChange={(e) =>
                      setEndereco({ ...endereco, complemento: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={endereco.bairro}
                    readOnly
                    className="mt-1 bg-muted"
                  />
                </div>
                <div className="md:col-span-3">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={endereco.cidade}
                    readOnly
                    className="mt-1 bg-muted"
                  />
                </div>
                <div className="md:col-span-1">
                  <Label htmlFor="uf">UF</Label>
                  <Input
                    id="uf"
                    value={endereco.uf}
                    readOnly
                    className="mt-1 bg-muted"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. FRETE */}
          <Card
            className={`shadow-sm ${pedidoCriado ? "opacity-60 pointer-events-none" : ""}`}
          >
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold text-lg flex items-center gap-2 border-b pb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  2
                </span>
                Opções de Entrega
              </h2>
              {carregandoFrete && (
                <p className="text-sm text-muted-foreground animate-pulse">
                  Calculando...
                </p>
              )}
              {!carregandoFrete && opcoesFrete.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  Digite um CEP válido para calcular o frete.
                </p>
              )}
              <div className="space-y-2">
                {opcoesFrete.map((op) => (
                  <div
                    key={`${op.empresa}-${op.nomeServico}`}
                    onClick={() => setFreteSelecionado(op)}
                    className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                      freteSelecionado?.nomeServico === op.nomeServico
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {op.empresa} - {op.nomeServico}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Prazo: até {op.prazoEntrega} dias úteis
                      </p>
                    </div>
                    <span className="font-bold text-sm">
                      R$ {op.valor.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 3. FORMA DE PAGAMENTO */}
          <Card className="shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold text-lg flex items-center gap-2 border-b pb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  3
                </span>
                Forma de Pagamento
              </h2>

              <RadioGroup
                value={formaPagamento}
                onValueChange={(value) =>
                  !pedidoCriado && setFormaPagamento(value)
                }
                className={`space-y-3 ${pedidoCriado ? "opacity-60 pointer-events-none" : ""}`}
              >
                {/* Opcional: PIX */}
                <div
                  className={`border rounded-xl transition-all ${formaPagamento === "PIX" ? "border-primary ring-2 ring-primary/20 bg-muted/20" : "hover:bg-muted/30"}`}
                >
                  <label className="flex items-center justify-between p-4 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="PIX" id="pix" />
                      <div className="flex items-center gap-2 font-medium text-sm">
                        <QrCode className="h-4 w-4 text-blue-600" /> Pix
                      </div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded">
                      Aprovação imediata
                    </span>
                  </label>
                  {formaPagamento === "PIX" && (
                    <div className="p-4 border-t bg-muted/10 grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Nome Completo</Label>
                        <Input
                          type="text"
                          disabled={!!pedidoCriado}
                          placeholder="Nome igual ao do banco"
                          value={dadosPagador.nomeCompleto}
                          onChange={(e) =>
                            setDadosPagador({
                              ...dadosPagador,
                              nomeCompleto: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs">E-mail</Label>
                          <Input
                            type="email"
                            disabled={!!pedidoCriado}
                            placeholder="nome@email.com"
                            value={dadosPagador.email}
                            onChange={(e) =>
                              setDadosPagador({
                                ...dadosPagador,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">CPF/CNPJ</Label>
                          <Input
                            type="text"
                            disabled={!!pedidoCriado}
                            placeholder="000.000.000-00"
                            value={dadosPagador.cpfCnpj}
                            onChange={(e) =>
                              setDadosPagador({
                                ...dadosPagador,
                                cpfCnpj: e.target.value.replace(/\D/g, ""),
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Opcional: CARTÃO DE CRÉDITO */}
                <div
                  className={`border rounded-xl transition-all ${formaPagamento === "CARTAO_CREDITO" ? "border-primary ring-2 ring-primary/20 bg-muted/20" : "hover:bg-muted/30"}`}
                >
                  <label className="flex items-center justify-between p-4 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="CARTAO_CREDITO" id="cartao" />
                      <div className="flex items-center gap-2 font-medium text-sm">
                        <CreditCard className="h-4 w-4 text-purple-600" />{" "}
                        Cartão de Crédito
                      </div>
                    </div>
                  </label>
                </div>

                {/* Opcional: BOLETO */}
                <div
                  className={`border rounded-xl transition-all ${formaPagamento === "BOLETO" ? "border-primary ring-2 ring-primary/20 bg-muted/20" : "hover:bg-muted/30"}`}
                >
                  <label className="flex items-center justify-between p-4 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="BOLETO" id="boleto" />
                      <div className="flex items-center gap-2 font-medium text-sm">
                        <Barcode className="h-4 w-4 text-amber-600" /> Boleto
                        Bancário
                      </div>
                    </div>
                  </label>
                  {formaPagamento === "BOLETO" && (
                    <div className="p-4 border-t bg-muted/10 grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">
                          Nome Completo do Titular
                        </Label>
                        <Input
                          type="text"
                          disabled={!!pedidoCriado}
                          placeholder="Nome completo impresso no boleto"
                          value={dadosPagador.nomeCompleto}
                          onChange={(e) =>
                            setDadosPagador({
                              ...dadosPagador,
                              nomeCompleto: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs">
                            E-mail para envio do boleto
                          </Label>
                          <Input
                            type="email"
                            disabled={!!pedidoCriado}
                            placeholder="nome@email.com"
                            value={dadosPagador.email}
                            onChange={(e) =>
                              setDadosPagador({
                                ...dadosPagador,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">
                            CPF ou CNPJ do titular
                          </Label>
                          <Input
                            type="text"
                            disabled={!!pedidoCriado}
                            placeholder="000.000.000-00"
                            value={dadosPagador.cpfCnpj}
                            onChange={(e) =>
                              setDadosPagador({
                                ...dadosPagador,
                                cpfCnpj: e.target.value.replace(/\D/g, ""),
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </RadioGroup>

              {/* AREA EXPANSÍVEL DO BRICK DE CARTÃO SÓ APÓS CRIAR O PEDIDO */}
              {formaPagamento === "CARTAO_CREDITO" && pedidoCriado && (
                <div className="p-4 border border-purple-300 rounded-xl bg-white mt-4 animate-in slide-in-from-top-2 duration-200">
                  <h3 className="text-sm font-semibold text-purple-800 mb-3">
                    Dados do Cartão (Pedido #{pedidoCriado.id})
                  </h3>
                  <CartaoBrick
                    key={`card-brick-${pedidoCriado.id}`}
                    amount={valorTotalComFrete}
                    onToken={handleCartao}
                  />
                  {processandoPagamento && (
                    <div className="flex items-center justify-center gap-2 mt-2 text-xs text-purple-600">
                      <Loader2 className="h-3 w-3 animate-spin" /> Processando
                      transação com o banco...
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* COLUNA DIREITA: RESUMO */}
        <div className="space-y-4 lg:sticky lg:top-4">
          <Card className="shadow-sm border-t-4 border-t-primary">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-bold text-lg border-b pb-2">
                Resumo do Pedido
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Itens do carrinho</span>
                  <span>R$ {carrinho.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Custo do Frete</span>
                  <span>
                    {freteSelecionado
                      ? `R$ ${freteSelecionado.valor.toFixed(2)}`
                      : "Calcule o CEP"}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 flex justify-between font-bold text-lg text-foreground">
                <span>Total a pagar</span>
                <span>R$ {valorTotalComFrete.toFixed(2)}</span>
              </div>

              {!pedidoCriado && (
                <Button
                  size="lg"
                  className="w-full mt-2 font-semibold shadow-sm"
                  disabled={
                    finalizando ||
                    !freteSelecionado ||
                    !formaPagamento ||
                    carregandoFrete
                  }
                  onClick={iniciarFluxoFinalizacao}
                >
                  {finalizando ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Registrando...
                    </>
                  ) : formaPagamento === "CARTAO_CREDITO" ? (
                    "Liberar Dados do Cartão"
                  ) : (
                    "Confirmar e Gerar Código"
                  )}
                </Button>
              )}

              {pedidoCriado && formaPagamento === "CARTAO_CREDITO" && (
                <p className="text-center text-xs text-muted-foreground mt-2 font-medium text-purple-600 animate-pulse">
                  Preencha o formulário acima para concluir o pagamento.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
