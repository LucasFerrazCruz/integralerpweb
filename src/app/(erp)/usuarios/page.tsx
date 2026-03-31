"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/useRole";
import { api } from "@/services/api";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const router = useRouter();
  const { isAdmin } = useRole();

  useEffect(() => {
    if (!isAdmin) return;
    carregar();
  }, [isAdmin]);

  async function carregar() {
    const { data } = await api.get("/api/usuarios");
    setUsuarios(data);
  }

  if (!isAdmin) return null;

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Usuários</h1>

        <Button onClick={() => router.push("/usuarios/novo")}>
          Novo Usuário
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.nome}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
