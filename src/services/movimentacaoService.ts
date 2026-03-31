import { api } from "./api";

export const movimentacaoService = {
  entrada: async (produtoId: number, quantidade: number) => {
    const { data } = await api.post("/api/movimentacoes/entrada", {
      produtoId,
      quantidade,
    });
    return data;
  },

  async listar(params: {
    tipo?: string;
    produtoId?: number;
    dataInicio?: string;
    dataFim?: string;
    page?: number;
    size?: number;
  }) {
    const response = await api.get("/api/movimentacoes", { params });
    return response.data;
  },
};
