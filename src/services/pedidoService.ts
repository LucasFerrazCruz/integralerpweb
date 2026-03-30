import { api } from "./api";

export const pedidoService = {
  async criar(enderecoEntrega: string) {
    const { data } = await api.post("/api/pedidos", {
      enderecoEntrega,
    });

    return data;
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
