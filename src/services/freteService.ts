import { api } from "./api";

export const freteService = {
  calcular: async (dados: { cepDestino: string }) => {
    const response = await api.post("/api/frete/calcular", dados);
    return response.data;
  },
};
