"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
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
      <Button
        type="submit"
        size="icon"
        variant="ghost"
        className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
      >
        <Search className="w-5 h-5" />
      </Button>
    </form>
  );
}
