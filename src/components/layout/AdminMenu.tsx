"use client";

import {
  Menu,
  ChevronDown,
  Package,
  Warehouse,
  Layers,
  ArrowLeftRight,
  Replace,
  ClipboardCheck,
  FileText,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useState } from "react";

export function AdminMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`gap-2 border-zinc-300 transition-colors ${open ? "bg-zinc-100" : ""}`}
          >
            Administrativo{" "}
            <ChevronDown
              size={14}
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-56 mt-[-4px]"
          align="start"
          onMouseEnter={() => setOpen(true)}
        >
          <DropdownMenuLabel>Gestão do Sistema</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* GRUPO: CATÁLOGO */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground font-bold px-2 py-1">
              Catálogo
            </DropdownMenuLabel>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                router.push("/catalogo/produtos");
                setOpen(false);
              }}
            >
              <Package className="mr-2 h-4 w-4" /> Produtos
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                router.push("/catalogo/categorias");
                setOpen(false);
              }}
            >
              <Layers className="mr-2 h-4 w-4" /> Categorias
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* GRUPO: ESTOQUE E LOGÍSTICA */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground font-bold px-2 py-1">
              Estoque
            </DropdownMenuLabel>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                router.push("/estoque/produtos");
                setOpen(false);
              }}
            >
              <Warehouse className="mr-2 h-4 w-4" /> Saldos
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                router.push("/estoque/movimentacoes");
                setOpen(false);
              }}
            >
              <ArrowLeftRight className="mr-2 h-4 w-4" /> Movimentações
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                router.push("/estoque/transferencias");
                setOpen(false);
              }}
            >
              <Replace className="mr-2 h-4 w-4" /> Transferências
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                router.push("/estoque/recebimento");
                setOpen(false);
              }}
            >
              <ClipboardCheck className="mr-2 h-4 w-4" /> Recebimento
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* GRUPO: ADMINISTRAÇÃO */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground font-bold px-2 py-1">
              Administração
            </DropdownMenuLabel>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                router.push("/admin/pedidos");
                setOpen(false);
              }}
            >
              <FileText className="mr-2 h-4 w-4" /> Pedidos de Compra
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                router.push("/usuarios");
                setOpen(false);
              }}
            >
              <Users className="mr-2 h-4 w-4" /> Usuários
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
