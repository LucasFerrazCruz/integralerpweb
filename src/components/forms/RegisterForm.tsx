"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { register } from "@/services/authService";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { toast } from "sonner";
import Link from "next/link";

export default function RegisterForm() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Backend cria o usuário
      await register(nome, email, senha);

      // 2. NextAuth faz o login automático
      const result = await signIn("credentials", {
        email,
        senha,
        redirect: false,
      });

      if (result?.ok) {
        toast.success("Conta criada com sucesso!");
        router.replace("/catalogo/produtos");
        router.refresh();
      }
    } catch (err) {
      toast.error("Erro ao cadastrar. Verifique se o email já existe.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Criar Conta
        </CardTitle>
        <CardDescription className="text-center">
          Cadastre-se para começar a gerenciar seus pedidos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Criando conta..." : "Cadastrar"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-center text-sm text-muted-foreground w-full">
          Já tem acesso?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Fazer login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
