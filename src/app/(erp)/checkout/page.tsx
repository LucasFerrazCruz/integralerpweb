"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useCarrinho } from "@/context/CarrinhoContext";
import { pedidoService } from "@/services/pedidoService";
import { freteService } from "@/services/freteService";

interface OpcaoFrete {
  nomeServico: string;
  valor: number;
  prazoEntrega: number;
  empresa: string;
}

export default function CheckoutPage() {
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
  const [formaPagamento, setFormaPagamento] = useState("PIX");

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

  if (loading || !carrinho) {
    return <p className="p-8">Carregando...</p>;
  }

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

  async function finalizarPedido() {
    if (!endereco.cep || !endereco.numero) {
      toast.error("CEP e Número são obrigatórios");
      return;
    }
    if (!freteSelecionado) {
      toast.error("Selecione uma opção de frete");
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

  const valorTotalComFrete = carrinho.total + (freteSelecionado?.valor || 0);

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUNA ESQUERDA: ENDEREÇO E FRETE */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-4 space-y-4">
              <h2 className="font-semibold text-lg border-b pb-2">
                Endereço de Entrega
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                {/* CEP */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">CEP</label>
                  <input
                    className="w-full border rounded p-2 mt-1"
                    placeholder="00000000"
                    maxLength={8}
                    value={endereco.cep}
                    onChange={handleCepChange}
                  />
                  {buscandoCep && (
                    <span className="text-xs text-blue-500 animate-pulse">
                      Buscando CEP...
                    </span>
                  )}
                </div>

                {/* RUA */}
                <div className="md:col-span-4">
                  <label className="text-sm font-medium">
                    Logradouro / Rua
                  </label>
                  <input
                    className="w-full border rounded p-2 mt-1 bg-muted"
                    value={endereco.logradouro}
                    readOnly
                  />
                </div>

                {/* NÚMERO */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Número</label>
                  <input
                    className="w-full border rounded p-2 mt-1 border-primary"
                    placeholder="Ex: 123"
                    value={endereco.numero}
                    onChange={(e) =>
                      setEndereco({ ...endereco, numero: e.target.value })
                    }
                  />
                </div>

                {/* APELIDO */}
                <div className="md:col-span-4">
                  <label className="text-sm font-medium">
                    Apelido (Ex: Trabalho, Casa)
                  </label>
                  <input
                    className="w-full border rounded p-2 mt-1"
                    value={endereco.apelido}
                    onChange={(e) =>
                      setEndereco({ ...endereco, apelido: e.target.value })
                    }
                  />
                </div>

                {/* COMPLEMENTO */}
                <div className="md:col-span-3">
                  <label className="text-sm font-medium">Complemento</label>
                  <input
                    className="w-full border rounded p-2 mt-1"
                    placeholder="Apt, Bloco..."
                    value={endereco.complemento}
                    onChange={(e) =>
                      setEndereco({ ...endereco, complemento: e.target.value })
                    }
                  />
                </div>

                {/* BAIRRO */}
                <div className="md:col-span-3">
                  <label className="text-sm font-medium">Bairro</label>
                  <input
                    className="w-full border rounded p-2 mt-1 bg-muted"
                    value={endereco.bairro}
                    readOnly
                  />
                </div>

                {/* CIDADE E UF */}
                <div className="md:col-span-4">
                  <label className="text-sm font-medium">Cidade</label>
                  <input
                    className="w-full border rounded p-2 mt-1 bg-muted"
                    value={endereco.cidade}
                    readOnly
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">UF</label>
                  <input
                    className="w-full border rounded p-2 mt-1 bg-muted"
                    value={endereco.uf}
                    readOnly
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SELEÇÃO FRETE */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h2 className="font-semibold text-lg border-b pb-2">
                Opções de frete
              </h2>
              {carregandoFrete && (
                <p className="text-sm text-muted-foreground animate-pulse">
                  Calculando melhores prazos...
                </p>
              )}

              {!carregandoFrete &&
                opcoesFrete.length === 0 &&
                !endereco.cep && (
                  <p className="text-sm text-muted-foreground italic">
                    Insira o CEP para ver as opções de entrega.
                  </p>
                )}

              <div className="space-y-2">
                {opcoesFrete.map((op) => (
                  <div
                    key={`${op.empresa}-${op.nomeServico}`}
                    onClick={() => setFreteSelecionado(op)}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                      freteSelecionado?.nomeServico === op.nomeServico
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {op.empresa} - {op.nomeServico}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Prazo: até {op.prazoEntrega} dias úteis
                      </span>
                    </div>
                    <span className="font-bold">R$ {op.valor.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="font-medium text-lg">Pagamento</h2>
            <div className="flex gap-2 flex-wrap">
              {["PIX", "BOLETO", "CARTAO_CREDITO", "CARTAO_DEBITO"].map(
                (fp) => (
                  <Button
                    key={fp}
                    variant={formaPagamento === fp ? "default" : "outline"}
                    onClick={() => setFormaPagamento(fp)}
                  >
                    {fp.replace("_", " ")}
                  </Button>
                ),
              )}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: RESUMO FINANCEIRO */}
        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-bold text-xl border-b pb-2">Resumo</h2>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>R$ {carrinho.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Frete</span>
                  <span
                    className={
                      freteSelecionado
                        ? "text-green-600 font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {freteSelecionado
                      ? `R$ ${freteSelecionado.valor.toFixed(2)}`
                      : "Selecione o frete"}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 flex justify-between font-bold text-xl text-primary">
                <span>Total</span>
                <span>R$ {valorTotalComFrete.toFixed(2)}</span>
              </div>

              {formaPagamento === "PIX" && (
                <Card className="mt-4 border-blue-200 bg-blue-50/30">
                  <CardContent className="p-4 space-y-4">
                    <h3 className="font-semibold text-sm text-blue-800 uppercase tracking-wider">
                      Informações para o QR Code
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase">
                          E-mail do Pagador
                        </label>
                        <input
                          type="email"
                          className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Para onde enviar o comprovante"
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
                        <label className="text-xs font-bold text-muted-foreground uppercase">
                          CPF ou CNPJ
                        </label>
                        <input
                          type="text"
                          className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
                    <p className="text-[10px] text-blue-600/70 italic">
                      * Estes dados são necessários para a emissão do título de
                      pagamento pelo Mercado Pago.
                    </p>
                  </CardContent>
                </Card>
              )}

              <Button
                size="lg"
                className="w-full mt-4"
                disabled={finalizando || !freteSelecionado || carregandoFrete}
                onClick={finalizarPedido}
              >
                {finalizando ? "Processando..." : "Confirmar e Pagar"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
