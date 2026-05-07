import { BoletoData } from "@/types/Pagamento";
import { api } from "./api";

export const pagamentoService = {
  async simular(pedidoId: number) {
    return api.post(`/api/pagamentos/${pedidoId}/simular`);
  },

  async gerarPix(pedidoId: number) {
    const { data } = await api.post(`/api/pagamentos/${pedidoId}/pix`);
    return data;
  },

  async pagarCartao(pedidoId: number, data: any) {
    const response = await api.post(`/api/pagamentos/${pedidoId}/cartao`, data);
    return response.data;
  },

  async gerarBoleto(pedidoId: number): Promise<BoletoData> {
    const { data } = await api.post(`/api/pagamentos/${pedidoId}/boleto`);
    return data;
  },

  async status(pedidoId: number) {
    const { data } = await api.get(`/api/pagamentos/${pedidoId}/status`);
    return data;
  },
};
