import { useSession } from "next-auth/react";

export function useRole() {
  const { data: session, status } = useSession();

  const role = (session?.user as any)?.role;

  return {
    isAdmin: role === "BASE_ADMIN",
    isDistribuidor: role === "DISTRIBUIDOR",
    isCliente: role === "CLIENTE",
    status,
  };
}
