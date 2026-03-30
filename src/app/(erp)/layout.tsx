"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { Toaster } from "@/components/ui/sonner";

export default function ERPLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Topbar />

        <main className="flex-1 p-6 overflow-auto">
          {children}
          <Toaster />
        </main>
      </div>
    </div>
  );
}
