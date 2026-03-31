import { api } from "./api";

export const usuarioService = {
  async listar() {
    const { data } = await api.get("/api/usuarios");
    return data;
  },

  async criarDistribuidor(payload: {
    nomeDistribuidor: string;
    email: string;
    senha: string;
    nomeCentro: string;
  }) {
    return api.post("/api/usuarios/distribuidor", payload);
  },
};
