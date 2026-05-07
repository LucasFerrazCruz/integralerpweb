"use client";

import { createContext, useContext, ReactNode } from "react";
import { Role, Usuario } from "@/types/Usuario";
import { SessionProvider, signOut, useSession } from "next-auth/react";

type AuthContextType = {
  usuario: Usuario | null;
  loading: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  usuario: null,
  loading: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthInternalProvider>{children}</AuthInternalProvider>
    </SessionProvider>
  );
}

function AuthInternalProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const usuarioFormatado: Usuario | null = session?.user
    ? {
        id: Number(session.user.id),
        nome: session.user.name || "",
        email: session.user.email || "",
        role: session.user.role as Role,
        token: session.accessToken as string,
      }
    : null;

  const logout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <AuthContext.Provider
      value={{
        usuario: usuarioFormatado,
        loading: status === "loading",
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
