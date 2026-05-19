"use client";

import { ReactNode, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/Header";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full overflow-x-hidden">
      {/* O Header agora contém toda a navegação */}
      <Header />

      <main className="flex-1 w-full flex flex-col">
        <div className="p-4 md:p-8 max-w-[1440px] mx-auto w-full flex-1">
          <Suspense
            fallback={<div className="text-center py-10">Carregando...</div>}
          >
            {children}
          </Suspense>
        </div>
      </main>

      <Toaster
        richColors
        closeButton
        position="bottom-right"
        duration={2500}
        visibleToasts={3}
      />
    </div>
  );
}
