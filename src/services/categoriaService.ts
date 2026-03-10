import { api } from "./api";

export const categoriaService = {
  listar: async () => {
    const response = await api.get("/categorias");

    return response.data;
  },

  criar: async (nome: string) => {
    const response = await api.post("/categorias", { nome });

    return response.data;
  },
};
