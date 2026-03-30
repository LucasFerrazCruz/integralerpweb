"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/useRole";
import { api } from "@/services/api";

export default function NovoUsuarioPage() {
  const router = useRouter();
  const { isAdmin } = useRole();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await api.post("/api/usuarios/distribuidor", {
        nomeDistribuidor: nome,
        email,
        senha,
      });

      router.push("/usuarios");
    } catch (err) {
      console.error("Erro ao criar distribuidor");
    }
  }

  if (!isAdmin) return null;

  return (
    <div className="p-6 max-w-md">
      <h1 className="text-2xl font-semibold mb-4">Novo Distribuidor</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Nome do distribuidor"
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

        <Button type="submit" className="w-full">
          Criar Distribuidor
        </Button>
      </form>
    </div>
  );
}
