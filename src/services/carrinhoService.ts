import { api } from "./api";

export const carrinhoService = {
  async adicionar(produtoId: number) {
    return api.post("/api/carrinho/adicionar", {
      produtoId,
      quantidade: 1,
    });
  },

  async buscar() {
    const { data } = await api.get("/api/carrinho");
    return data;
  },

  async remover(produtoId: number) {
    return api.delete(`/api/carrinho/remover/${produtoId}`);
  },

  async atualizar(produtoId: number, quantidade: number) {
    return api.patch("/api/carrinho/atualizar", null, {
      params: { produtoId, quantidade },
    });
  },
};
