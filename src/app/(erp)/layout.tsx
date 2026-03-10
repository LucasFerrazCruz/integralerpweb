"use client";

import Link from "next/link";
import { ReactNode } from "react";
import Topbar from "@/components/Topbar";

export default function ERPLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* SIDEBAR */}

      <aside
        style={{
          width: 220,
          background: "#111",
          color: "white",
          padding: 20,
        }}
      >
        <h2>Integral ERP</h2>

        <nav style={{ marginTop: 30 }}>
          <div>
            <Link href="/dashboard">Dashboard</Link>
          </div>

          <div style={{ marginTop: 20, fontWeight: "bold" }}>Catálogo</div>

          <div>
            <Link href="/catalogo/produtos">Produtos</Link>
          </div>

          <div>
            <Link href="/catalogo/categorias">Categorias</Link>
          </div>

          <div style={{ marginTop: 20, fontWeight: "bold" }}>Estoque</div>

          <div>
            <Link href="/estoque">Centros</Link>
          </div>

          <div>
            <Link href="/movimentacoes">Movimentações</Link>
          </div>

          <div style={{ marginTop: 20, fontWeight: "bold" }}>Vendas</div>

          <div>
            <Link href="/pedidos">Pedidos</Link>
          </div>

          <div>
            <Link href="/clientes">Clientes</Link>
          </div>

          <div style={{ marginTop: 20, fontWeight: "bold" }}>Administração</div>

          <div>
            <Link href="/usuarios">Usuários</Link>
          </div>
        </nav>
      </aside>

      {/* AREA DIREITA */}

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Topbar />

        <main style={{ flex: 1, padding: 20 }}>{children}</main>
      </div>
    </div>
  );
}
