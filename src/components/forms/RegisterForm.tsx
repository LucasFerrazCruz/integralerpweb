"use client";

import { useState } from "react";
import { register, login } from "@/services/authService";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";

export default function RegisterForm() {
  const router = useRouter();
  const { carregarUsuario } = useAuth();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      // 1. cria conta
      await register(nome, email, senha);

      // 2. loga automaticamente
      await login(email, senha);

      // 3. carrega usuário no context
      await carregarUsuario();

      toast.success("Conta criada com sucesso!");

      // 4. redireciona
      router.replace("/catalogo/produtos");
    } catch {
      toast.error("Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <h1 className="text-xl font-bold">Criar conta</h1>

      <Input
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />

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

      <Button type="submit" disabled={loading}>
        {loading ? "Criando..." : "Cadastrar"}
      </Button>
    </form>
  );
}
