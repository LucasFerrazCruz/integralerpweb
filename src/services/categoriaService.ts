import { api } from "./api";

export const categoriaService = {
  listar: async () => {
    const response = await api.get("/api/categorias");

    return response.data;
  },

  criar: async (nome: string) => {
    const response = await api.post("/api/categorias", { nome });

    return response.data;
  },
};
