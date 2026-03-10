"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getUsuarioLogado } from "@/services/authService";

type Usuario = {
  id: number;
  nome: string;
  role: string;
};

type AuthContextType = {
  usuario: Usuario | null;
  loading: boolean;
  carregarUsuario: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  usuario: null,
  loading: true,
  carregarUsuario: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  async function carregarUsuario() {
    try {
      const data = await getUsuarioLogado();
      setUsuario(data);
    } catch {
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const tokenExiste = localStorage.getItem("token");

    if (tokenExiste) {
      carregarUsuario();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, loading, carregarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
