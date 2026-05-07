"use client";

import { ReactNode, Suspense } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { Toaster } from "@/components/ui/sonner";

export default function ERPLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Suspense fallback={<div className="w-64 bg-white border-r" />}>
          <Topbar />
        </Suspense>

        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Suspense fallback={<div>Carregando...</div>}>{children}</Suspense>
          </div>
        </main>
      </div>

      <Toaster richColors closeButton position="top-right" />
    </div>
  );
}
