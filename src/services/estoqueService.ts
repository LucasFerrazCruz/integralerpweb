import { api } from "./api";

export const estoqueService = {
  async listar(centroId?: number) {
    if (centroId) {
      const { data } = await api.get(`/estoques/centro/${centroId}`);
      return data;
    }

    const { data } = await api.get("/estoques");
    return data;
  },
};
