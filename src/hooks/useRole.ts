import { useAuth } from "@/context/AuthContext";

export function useRole() {
  const { usuario } = useAuth();

  return {
    isAdmin: usuario?.role === "BASE_ADMIN",
    isDistribuidor: usuario?.role === "DISTRIBUIDOR",
    isCliente: usuario?.role === "CLIENTE",
  };
}
