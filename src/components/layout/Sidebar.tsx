"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-[220px] bg-black text-white p-5">
      <h2 className="text-lg font-bold">Integral ERP</h2>

      <nav className="mt-6 space-y-4">
        <div>
          <Link href="/dashboard">Dashboard</Link>
        </div>

        <div className="mt-6 font-semibold">Catálogo</div>

        <div>
          <Link href="/catalogo/produtos">Produtos</Link>
        </div>

        <div>
          <Link href="/catalogo/categorias">Categorias</Link>
        </div>

        <div className="mt-6 font-semibold">Estoque</div>

        <div>
          <Link href="/estoque/produtos">Centros</Link>
        </div>

        <div>
          <Link href="/movimentacoes">Movimentações</Link>
        </div>

        <div className="mt-6 font-semibold">Vendas</div>

        <div>
          <Link href="/pedidos">Pedidos</Link>
        </div>

        <div>
          <Link href="/clientes">Clientes</Link>
        </div>

        <div className="mt-6 font-semibold">Administração</div>

        <div>
          <Link href="/usuarios">Usuários</Link>
        </div>
      </nav>
    </aside>
  );
}
