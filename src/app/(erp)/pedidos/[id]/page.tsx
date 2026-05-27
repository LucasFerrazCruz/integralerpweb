"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { pedidoService } from "@/services/pedidoService";
import { Pedido } from "@/types/Pedido";
import { statusPedidoMap } from "@/utils/pedido";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  ArrowLeft,
  Badge,
  Calendar,
  Loader2,
  MapPin,
  Package,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PedidoDetalhePage() {
  const { id } = useParams();
  const router = useRouter();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        const data = await pedidoService.buscarPorId(Number(id));
        setPedido(data);
      } catch (error) {
        toast.error("Erro ao carregar detalhes do pedido.");
      }
    }

    if (id) carregar();
  }, [id]);

  const handleCancelarPedido = async () => {
    if (!window.confirm("Tem certeza que deseja cancelar este pedido?")) return;

    setCancelando(true);
    try {
      // 📝 Certifique-se de expor esse método 'cancelar' no seu pedidoService
      await pedidoService.cancelar(Number(id));

      toast.success("Pedido cancelado com sucesso!");

      // Atualiza o estado local para refletir a mudança imediatamente na tela
      setPedido((prev) => (prev ? { ...prev, status: "CANCELADO" } : null));
    } catch (error: any) {
      toast.error(error.message || "Erro ao tentar cancelar o pedido.");
    } finally {
      setCancelando(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "PAGO":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "AGUARDANDO_PAGAMENTO":
      case "PENDENTE":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case "CANCELADO":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-slate-100 text-slate-800";
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
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      {/* Botão Voltar */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground hover:text-foreground"
        onClick={() => router.push("/pedidos")}
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para meus pedidos
      </Button>

      {/* Cabeçalho do Pedido */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Pedido #{pedido.id}
          </h1>
          <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
            <Badge className={getStatusVariant(pedido.status)}>
              {statusPedidoMap[pedido.status] || pedido.status}
            </Badge>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {pedido.tipo === "MANUAL" ? "Venda Manual" : "Compra Online"}
            </span>
          </div>
        </div>

        {/* 🚨 BOTÃO DE CANCELAMENTO CONDICIONAL */}
        {pedido.status === "AGUARDANDO_PAGAMENTO" && (
          <Button
            variant="destructive"
            size="sm"
            className="gap-1.5 shadow-sm"
            onClick={handleCancelarPedido}
            disabled={cancelando}
          >
            <XCircle className="h-4 w-4" />
            {cancelando ? "Cancelando..." : "Cancelar Pedido"}
          </Button>
        )}
      </div>

      {/* Grid de Informações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lado Esquerdo: Itens do Pedido */}
        <div className="md:col-span-2 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 font-semibold">
                <Package className="h-4 w-4 text-muted-foreground" /> Produtos
                adquiridos
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y p-6 pt-0">
              {pedido.itens.map((item) => (
                <div
                  key={item.id}
                  className="py-4 flex justify-between items-center text-sm"
                >
                  <div className="space-y-0.5">
                    <p className="font-medium text-slate-900">
                      {item.produtoNome}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Quantidade: {item.quantidade}
                    </p>
                  </div>
                  <span className="font-semibold text-slate-900">
                    R$ {item.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}

              {/* Bloco de Totais */}
              <div className="pt-4 space-y-2 text-sm">
                <div className="flex justify-between font-bold text-base text-slate-900 pt-2">
                  <span>Total Geral</span>
                  <span>R$ {pedido.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lado Direito: Endereço de Entrega */}
        <div className="space-y-4">
          <Card className="shadow-sm bg-slate-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 font-semibold">
                <MapPin className="h-4 w-4 text-muted-foreground" /> Endereço de
                entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-slate-700">
              <p className="font-semibold text-slate-900">
                {pedido.endereco.apelido || "Meu Endereço"}
              </p>
              <div className="space-y-1 text-muted-foreground">
                <p>
                  {pedido.endereco.logradouro}, {pedido.endereco.numero}
                </p>
                {pedido.endereco.complemento && (
                  <p>Bl / Apt: {pedido.endereco.complemento}</p>
                )}
                <p>{pedido.endereco.bairro}</p>
                <p>
                  {pedido.endereco.cidade} - {pedido.endereco.uf}
                </p>
                <p className="text-xs font-mono pt-1">{pedido.endereco.cep}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
