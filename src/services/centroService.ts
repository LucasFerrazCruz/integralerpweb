import { Centro } from "@/types/Centro";
import { api } from "./api";

export const centroService = {
  async listar(): Promise<Centro[]> {
    const { data } = await api.get("/api/centros");
    return data;
  },
};
