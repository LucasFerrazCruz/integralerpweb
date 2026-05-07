import { api } from "./api";

export const produtoService = {
  async listar(params?: {
    centroId?: number;
    categoria?: number;
    incluirInativos?: boolean;
  }) {
    const { data } = await api.get("/api/produtos", {
      params,
    });
    return data;
  },

  listarComEstoque(params?: {
    centroId?: number;
    categoriaId?: number;
    incluirInativos?: boolean;
  }) {
    return api.get("/api/produtos/estoque", { params }).then((res) => res.data);
  },

  async listarCatalogo(params?: { categoria?: number; q?: string }) {
    const { data } = await api.get("/api/produtos/catalogo", {
      params,
    });
    return data;
  },

  criar: async (produto: ProdutoCreateDTO) => {
    const response = await api.post("/api/produtos", produto);
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

  async alternarStatus(id: number) {
    return api.patch(`/api/produtos/${id}/status`);
  },

  async excluirDefinitivo(id: number) {
    return api.delete(`/api/produtos/${id}/hard`);
  },
};

export type ProdutoCreateDTO = {
  nome: string;
  descricao: string;
  codigoBarras: string;
  estoqueMinimo: number;
  categoriaId: number;
  imagemUrl?: string | null;
};
