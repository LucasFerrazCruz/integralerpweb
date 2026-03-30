import { api } from "./api";

export const centroService = {
  async listar() {
    const { data } = await api.get("/api/centros");
    return data;
  },
};
