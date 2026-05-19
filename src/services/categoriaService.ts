import { Categoria } from "@/types/Categoria";
import { api } from "./api";

export const categoriaService = {
  listar: async () => {
    const response = await api.get("/api/categorias");
    return response.data;
  },

  criar: async (dados: Categoria) => {
    const response = await api.post("/api/categorias", dados);
    return response.data;
  },

  excluir: async (id: number) => {
    return await api.delete(`/api/categorias/${id}`);
  },

  atualizar: async (id: number, dados: Categoria) => {
    return await api.put(`/api/categorias/${id}`, dados);
  },
};
