"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pedidoService } from "@/services/pedidoService";
import { Pedido } from "@/types/Pedido";
import { ArrowLeft, Loader2, Package, Truck } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function AdminPedidoDetalhePage() {
  const { id } = useParams();
  const router = useRouter();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [processandoFrete, setProcessandoFrete] = useState(false);

  useEffect(() => {
    if (id) {
      pedidoService.buscarPorId(Number(id)).then(setPedido);
    }
  }, [id]);

  const handleGerarEtiqueta = async () => {
    setProcessandoFrete(true);
    try {
      // Aqui entrará a integração futura que planejou!
      toast.info("Abrindo painel de cubagem de caixas...");

      // Simulação de abertura do fluxo
      // await melhorEnvioService.comprar(...)
    } catch (e) {
      toast.error("Erro ao processar frete");
    } finally {
      setProcessandoFrete(false);
    }
  };

  if (!pedido) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="gap-1"
        onClick={() => router.push("/admin/pedidos")}
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para a lista
      </Button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Painel do Pedido #{pedido.id}</h1>
          <p className="text-sm text-muted-foreground">
            Gerenciamento interno de separação e envio.
          </p>
        </div>

        {pedido.status === "PAGO" && (
          <Button
            className="bg-blue-600 hover:bg-blue-700 gap-2 shadow-sm"
            onClick={handleGerarEtiqueta}
            disabled={processandoFrete}
          >
            <Truck className="h-4 w-4" />
            {processandoFrete ? "Processando..." : "Preparar Envio / Etiqueta"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal: Itens do pedido */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" /> Itens do
                Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {pedido.itens.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex justify-between text-sm"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {item.produtoNome}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qtd: {item.quantidade}
                    </p>
                  </div>
                  <span className="font-semibold text-slate-900">
                    R$ {item.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="pt-4 flex justify-between font-bold text-base text-slate-900">
                <span>Total Recebido</span>
                <span>R$ {pedido.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Lateral: Dados Logísticos e de Entrega */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Dados do Cliente & Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">
                  Status Interno
                </span>
                <span className="font-semibold uppercase text-blue-600">
                  {pedido.status}
                </span>
              </div>
              <div className="border-t pt-2">
                <span className="text-xs text-muted-foreground block">
                  Destinatário
                </span>
                <span className="font-medium">
                  {pedido.endereco.apelido || "Endereço Cadastrado"}
                </span>
                <p className="text-slate-600 mt-1">
                  {pedido.endereco.logradouro}, {pedido.endereco.numero}
                  {pedido.endereco.complemento &&
                    ` - ${pedido.endereco.complemento}`}
                  <br />
                  {pedido.endereco.bairro} - {pedido.endereco.cidade}/
                  {pedido.endereco.uf}
                </p>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  {pedido.endereco.cep}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
