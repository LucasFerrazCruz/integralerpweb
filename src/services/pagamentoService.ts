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
    const res = await api.post(`/api/pagamentos/${pedidoId}/cartao`, data);
    return res.data;
  },

  async status(pedidoId: number) {
    const { data } = await api.get(`/api/pagamentos/${pedidoId}/status`);
    return data;
  },
};
