import { api } from "./api";

export async function login(email: string, senha: string) {
  const response = await api.post("/auth/login", {
    email,
    senha,
  });

  console.log("LOGIN RESPONSE", response.data);

  const token = response.data.token;

  document.cookie = `token=${token}; path=/`;

  localStorage.setItem("token", token);

  return token;
}

export async function getUsuarioLogado() {
  const response = await api.get("/auth/me");

  return response.data;
}
