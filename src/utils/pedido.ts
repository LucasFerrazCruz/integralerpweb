import { Pedido } from "@/types/Pedido";

export const statusPedidoMap: Record<Pedido["status"], string> = {
  PENDENTE: "Pendente",
  AGUARDANDO_PAGAMENTO: "Aguardando pagamento",
  SEPARANDO: "Separando",
  PAGO: "Pago",
  ENVIADO: "Enviado",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

export const tipoPedidoMap: Record<Pedido["tipo"], string> = {
  MANUAL: "Venda manual",
  ECOMMERCE: "E-commerce",
};
