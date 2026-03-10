import { api } from "./api";

export async function login(email: string, senha: string) {
  const response = await api.post("/auth/login", {
    email,
    senha,
  });

  const token = response.data.token;

  localStorage.setItem("token", token);

  return token;
}

export async function getUsuarioLogado() {
  const response = await api.get("/auth/me");

  return response.data;
}
