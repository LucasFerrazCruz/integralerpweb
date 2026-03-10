import { api } from "./api";

export const produtoService = {
  listar: async () => {
    const response = await api.get("/produtos");
    return response.data;
  },

  criar: async (produto: ProdutoCreateDTO) => {
    const response = await api.post("/produtos", produto);
    return response.data;
  },

  excluir: async (id: number) => {
    await api.delete(`/api/produtos/${id}`);
  },

  atualizar: async (id: number, produto: ProdutoCreateDTO) => {
    const response = await api.put(`/api/produtos/${id}`, produto);
    return response.data;
  },

  buscarPorId: async (id: number) => {
    const response = await api.get(`/api/produtos/${id}`);
    return response.data;
  },
};

export type ProdutoCreateDTO = {
  nome: string;
  descricao: string;
  codigoBarras: string;
  estoqueMinimo: number;
  categoriaId: number;
};
