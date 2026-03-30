import { api } from "./api";

export async function criarDistribuidor(data: any) {
  return api.post("/api/distribuidores", data);
}
