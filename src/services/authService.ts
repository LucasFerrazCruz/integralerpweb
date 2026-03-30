import { api } from "./api";

export async function login(email: string, senha: string) {
  const response = await api.post("/auth/login", {
    email,
    senha,
  });

  console.log("LOGIN RESPONSE", response.data);

  const token = response.data.token;

  localStorage.setItem("token", token);

  return token;
}

export async function register(nome: string, email: string, senha: string) {
  return api.post("/auth/register", {
    nome,
    email,
    senha,
  });
}

export async function getUsuarioLogado() {
  const response = await api.get("/auth/me");

  return response.data;
}
