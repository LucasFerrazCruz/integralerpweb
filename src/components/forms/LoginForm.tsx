"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
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
import { Chrome } from "lucide-react"; // Ícone do Google

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      senha,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      toast.error("Email ou senha inválidos");
    } else {
      toast.success("Login realizado!");
      router.replace("/catalogo/produtos");
      router.refresh();
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          GR Tools
        </CardTitle>
        <CardDescription className="text-center">
          Entre com seu email e senha para acessar sua conta
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="exemplo@servico.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Carregando..." : "Entrar"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Ou continue com
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          type="button"
          className="w-full"
          onClick={() =>
            signIn("google", { callbackUrl: "/catalogo/produtos" })
          }
        >
          <Chrome className="mr-2 h-4 w-4" />
          Google
        </Button>
      </CardContent>
      <CardFooter>
        <p className="text-center text-sm text-muted-foreground w-full">
          Não tem uma conta?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Criar conta
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
