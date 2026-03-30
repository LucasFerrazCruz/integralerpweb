import { api } from "./api";

export const transferenciaService = {
  async listar() {
    const response = await api.get("/api/transferencias");
    return response.data;
  },

  async criar(data: {
    destinoId: number;
    itens: {
      produtoId: number;
      quantidade: number;
    }[];
  }) {
    const response = await api.post("/api/transferencias", data);
    return response.data;
  },

  async enviar(id: number) {
    await api.post(`/api/transferencias/${id}/enviar`);
  },

  async confirmar(codigo: string) {
    const response = await api.post("/api/transferencias/confirmar", {
      codigo,
    });

    return response.data;
  },

  async buscarPorCodigo(codigo: string) {
    const response = await api.get(`/api/transferencias/codigo/${codigo}`);
    return response.data;
  },
};
