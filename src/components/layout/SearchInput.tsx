"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "../ui/button";

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [busca, setBusca] = useState(query);

  // Sincroniza o input se o usuário mudar a busca por outro meio (ex: filtros)
  useEffect(() => {
    setBusca(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (busca.trim()) params.set("q", busca);
    else params.delete("q");

    router.push(`/catalogo/produtos?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="relative w-full max-w-2xl mx-auto group"
    >
      <Input
        placeholder="Buscar produtos..."
        className="pl-4 pr-12 h-11 bg-gray-50 border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-600 transition-all rounded-full"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {busca && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-gray-400 hover:text-gray-600"
            onClick={() => {
              setBusca("");
              router.push("/catalogo/produtos");
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        )}

        <Button
          type="submit"
          size="icon"
          variant="ghost"
          className="h-9 w-9 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white transition-colors"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
