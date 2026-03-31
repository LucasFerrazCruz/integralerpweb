"use client";

import { useRole } from "@/hooks/useRole";
import { cn } from "@/lib/utils";
import {
  ArrowLeftRight,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Tags,
  Users,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = {
  label: string;
  href: string;
  icon: any;
};

function MenuItem({ item }: { item: Item }) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(item.href);
  const { isAdmin, isDistribuidor } = useRole();

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
        "hover:bg-gray-800 hover:text-white",
        isActive ? "bg-gray-800 text-white font-medium" : "text-gray-400",
      )}
    >
      <item.icon className="w-4 h-4" />
      {item.label}
    </Link>
  );
}

function Section({ title, items }: { title: string; items: Item[] }) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase text-gray-500 px-2">{title}</p>

      <div className="space-y-1">
        {items.map((item) => (
          <MenuItem key={item.href} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="w-[260px] bg-zinc-950 text-white h-screen p-4 border-zinc-800 flex flex-col">
      {/* LOGO */}
      <div className="mb-6 px-2">
        <h2 className="text-lg font-semibold tracking-tight">Integral ERP</h2>
      </div>

      <div className="flex flex-col gap-6">
        <Section
          title="Geral"
          items={[
            {
              label: "Dashboard",
              href: "/dashboard",
              icon: LayoutDashboard,
            },
          ]}
        />

        <Section
          title="Catálogo"
          items={[
            {
              label: "Produtos",
              href: "/catalogo/produtos",
              icon: Package,
            },
            {
              label: "Categorias",
              href: "/catalogo/categorias",
              icon: Tags,
            },
          ]}
        />
        <Section
          title="Estoque"
          items={[
            {
              label: "Estoque",
              href: "/estoque/produtos",
              icon: Warehouse,
            },
            {
              label: "Movimentações",
              href: "/estoque/movimentacoes",
              icon: ArrowLeftRight,
            },
            {
              label: "Transferências",
              href: "/estoque/transferencias",
              icon: ArrowLeftRight,
            },
            {
              label: "Recebimento",
              href: "/estoque/recebimento",
              icon: ArrowLeftRight,
            },
          ]}
        />
        <Section
          title="Vendas"
          items={[
            {
              label: "Pedidos",
              href: "/pedidos",
              icon: ShoppingCart,
            },
            {
              label: "Clientes",
              href: "/clientes",
              icon: Users,
            },
          ]}
        />
        <Section
          title="Administração"
          items={[
            {
              label: "Usuários",
              href: "/usuarios",
              icon: Settings,
            },
          ]}
        />
      </div>
    </aside>
  );
}
