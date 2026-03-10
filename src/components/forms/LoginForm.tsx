"use client";

import { useState } from "react";
import { login } from "@/services/authService";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginForm() {
  const router = useRouter();
  const { carregarUsuario } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      await login(email, senha);

      await carregarUsuario();

      router.replace("/catalogo/produtos");
    } catch {
      setErro("Email ou senha inválidos");
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <h1>Integral Service</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />

      <button type="submit">Entrar</button>

      {erro && <p>{erro}</p>}
    </form>
  );
}
