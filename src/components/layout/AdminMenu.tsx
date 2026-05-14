"use client";

import { Menu, ChevronDown, Package, Warehouse } from "lucide-react";
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

export function AdminMenu() {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 border-zinc-300">
          <Menu size={18} /> Administrativo <ChevronDown size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Gestão do Sistema</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Agrupamos o que era "Seção" na Sidebar */}
        <DropdownMenuGroup title="Catálogo">
          <DropdownMenuItem onClick={() => router.push("/catalogo/produtos")}>
            <Package className="mr-2 h-4 w-4" /> Produtos
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuGroup title="Estoque">
          <DropdownMenuItem onClick={() => router.push("/estoque/produtos")}>
            <Warehouse className="mr-2 h-4 w-4" /> Estoque
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {/* ... demais itens */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
