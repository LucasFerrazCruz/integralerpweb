import { api } from "./api";

export const pedidoService = {
  async criar(data: { enderecoEntrega: string; formaPagamento: string }) {
    const response = await api.post("/api/pedidos", data);

    return response.data;
  },

  async criarManual(data: {
    itens: { produtoId: number; quantidade: number }[];
    clienteNome?: string;
    formaPagamento: string;
  }) {
    const response = await api.post("/api/vendas/manual", data);
    return response.data;
  },

  async listar() {
    const { data } = await api.get("/api/pedidos");
    return data;
  },

  async buscarPorId(id: number) {
    const { data } = await api.get(`/api/pedidos/${id}`);
    return data;
  },

  async listarTodos() {
    const { data } = await api.get("/api/admin/pedidos");
    return data;
  },
};
