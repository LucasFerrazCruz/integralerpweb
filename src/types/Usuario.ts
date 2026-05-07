export type Role = "BASE_ADMIN" | "DISTRIBUIDOR" | "CLIENTE";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: Role;
  token: string;
  centroId?: number;
}
