import { api } from "./api";

export const pagamentoService = {
  async simular(pedidoId: number) {
    return api.post(`/api/pagamentos/${pedidoId}/simular`);
  },

  async gerarPix(pedidoId: number) {
    const { data } = await api.post(`/api/pagamentos/${pedidoId}/pix`);
    return data;
  },
};
