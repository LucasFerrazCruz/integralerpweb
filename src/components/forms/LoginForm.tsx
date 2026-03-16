"use client";

import { useState } from "react";
import { login } from "@/services/authService";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function LoginForm() {
  const router = useRouter();
  const { carregarUsuario } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    console.log("LOGIN SUBMIT");

    try {
      await login(email, senha);

      await carregarUsuario();

      router.replace("/catalogo/produtos");
    } catch {
      setErro("Email ou senha inválidos");
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <h1>Integral Service</h1>

      <Input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />

      <Button type="submit">Entrar</Button>

      {erro && <p>{erro}</p>}
    </form>
  );
}
