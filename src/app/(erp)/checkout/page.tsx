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
import { Barcode, CreditCard, QrCode } from "lucide-react";

interface OpcaoFrete {
  nomeServico: string;
  valor: number;
  prazoEntrega: number;
  empresa: string;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const { carrinho, loading, limparCarrinho } = useCarrinho();

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
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [finalizando, setFinalizando] = useState(false);

  const [formaPagamento, setFormaPagamento] = useState<string>("");

  const [opcoesFrete, setOpcoesFrete] = useState<OpcaoFrete[]>([]);
  const [carregandoFrete, setCarregandoFrete] = useState(false);
  const [freteSelecionado, setFreteSelecionado] = useState<OpcaoFrete | null>(
    null,
  );
  const [dadosPagador, setDadosPagador] = useState({
    cpfCnpj: "",
    email: "",
  });

  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Você precisa estar logado para finalizar a compra.");
      router.push("/login?callbackUrl=/checkout"); // Redireciona e volta após login
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p>Validando acesso e carregando carrinho...</p>
      </div>
    );
  }

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

  async function calcularFrete(cepDestino: string) {
    try {
      setCarregandoFrete(true);
      setFreteSelecionado(null);
      const dados = await freteService.calcular({ cepDestino });
      setOpcoesFrete(dados);
    } catch (error) {
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
      } catch (error) {
        toast.error("Erro ao buscar CEP.");
      } finally {
        setBuscandoCep(false);
      }
    }
  };

  async function finalizarPedido() {
    if (!endereco.cep || !endereco.numero) {
      toast.error("CEP e Número são obrigatórios");
      return;
    }
    if (!freteSelecionado) {
      toast.error("Selecione uma opção de frete");
      return;
    }
    if (!formaPagamento) {
      toast.error("Selecione uma forma de pagamento");
      return;
    }
    if (
      (formaPagamento === "PIX" || formaPagamento === "BOLETO") &&
      (!dadosPagador.email || !dadosPagador.cpfCnpj)
    ) {
      toast.error(
        "E-mail e CPF/CNPJ são obrigatórios para esta forma de pagamento",
      );
      return;
    }

    try {
      setFinalizando(true);

      const pedido = await pedidoService.criar({
        endereco: endereco,
        formaPagamento,
        // valorFrete: freteSelecionado.valor,
        valorFrete: 0,
        transportadora: `${freteSelecionado.empresa} - ${freteSelecionado.nomeServico}`,
      });

      if (limparCarrinho) {
        await limparCarrinho();
      }

      const params = new URLSearchParams({
        pedidoId: pedido.id.toString(),
        tipo: formaPagamento,
        email: dadosPagador.email, // Passando o e-mail digitado
        cpf: dadosPagador.cpfCnpj, // Passando o CPF digitado
      });

      router.push(`/checkout/pagamento?${params.toString()}`);
    } catch {
      toast.error("Erro ao finalizar pedido");
    } finally {
      setFinalizando(false);
    }
  }

  const valorTotalComFrete = carrinho.total + (freteSelecionado?.valor || 0);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Finalizar Compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* COLUNA ESQUERDA: DADOS DE ENTREGA E PAGAMENTO */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. ENDEREÇO */}
          <Card className="shadow-sm">
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
          <Card className="shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold text-lg flex items-center gap-2 border-b pb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  2
                </span>
                Opções de Entrega
              </h2>
              {carregandoFrete && (
                <p className="text-sm text-muted-foreground animate-pulse">
                  Calculando opções...
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

          {/* 3. PAGAMENTO ESTILO PAYMENT BRICK */}
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
                onValueChange={(value) => setFormaPagamento(value)}
                className="space-y-3"
              >
                {/* OPÇÃO: PIX */}
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
                    <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded animate-pulse">
                      Aprovação imediata
                    </span>
                  </label>

                  {/* CONTEÚDO EXPANSÍVEL PIX */}
                  {formaPagamento === "PIX" && (
                    <div className="p-4 border-t bg-muted/10 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="space-y-1">
                        <Label className="text-xs">
                          E-mail para o comprovante
                        </Label>
                        <Input
                          type="email"
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
                          CPF ou CNPJ do pagador
                        </Label>
                        <Input
                          type="text"
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
                  )}
                </div>

                {/* OPÇÃO: CARTÃO DE CRÉDITO */}
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

                  {/* CONTEÚDO EXPANSÍVEL CARTÃO */}
                  {formaPagamento === "CARTAO_CREDITO" && (
                    <div className="p-4 border-t bg-muted/10 text-xs text-muted-foreground animate-in fade-in duration-200">
                      Os dados do seu cartão serão solicitados com total
                      segurança na próxima etapa de confirmação.
                    </div>
                  )}
                </div>

                {/* OPÇÃO: BOLETO */}
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

                  {/* CONTEÚDO EXPANSÍVEL BOLETO */}
                  {formaPagamento === "BOLETO" && (
                    <div className="p-4 border-t bg-muted/10 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="space-y-1">
                        <Label className="text-xs">
                          E-mail para envio do boleto
                        </Label>
                        <Input
                          type="email"
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
                  )}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* COLUNA DIREITA: RESUMO DE COMPRA FIXO */}
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
                <span>Total à pagar</span>
                <span>R$ {valorTotalComFrete.toFixed(2)}</span>
              </div>

              <Button
                size="lg"
                className="w-full mt-2 font-semibold shadow-sm"
                disabled={
                  finalizando ||
                  !freteSelecionado ||
                  !formaPagamento ||
                  carregandoFrete
                }
                onClick={finalizarPedido}
              >
                {finalizando
                  ? "Processando..."
                  : formaPagamento === "CARTAO_CREDITO"
                    ? "Ir para Dados do Cartão"
                    : "Confirmar e Gerar Código"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
