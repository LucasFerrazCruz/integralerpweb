"use client";

import { carrinhoService } from "@/services/carrinhoService";
import { createContext, useContext, useEffect, useState } from "react";

type Item = {
  produtoId: number;
  quantidade: number;
};

type Carrinho = {
  itens: Item[];
  total: number;
};

type CarrinhoContextType = {
  carrinho: Carrinho | null;
  quantidade: number;
  loading: boolean;
  carregarCarrinho: () => Promise<void>;
  atualizarItem: (produtoId: number, quantidade: number) => Promise<void>;
  animar: () => void;
  animando: boolean;
  limparCarrinho: () => Promise<void>;
};

const CarrinhoContext = createContext<CarrinhoContextType | null>(null);

export function CarrinhoProvider({ children }: any) {
  const [carrinho, setCarrinho] = useState<Carrinho | null>(null);
  const [loading, setLoading] = useState(true);
  const [animando, setAnimando] = useState(false);

  async function carregarCarrinho() {
    try {
      setLoading(true);
      const data = await carrinhoService.buscar();
      setCarrinho(data);
    } catch {
      console.error("Erro ao carregar carrinho");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetch = async () => {
      await carregarCarrinho();
    };

    fetch();
  }, []);

  // Quantidade total
  const quantidade =
    carrinho?.itens.reduce((acc, item) => acc + item.quantidade, 0) || 0;

  // Atualizar item(fonte única)
  async function atualizarItem(produtoId: number, quantidade: number) {
    try {
      await carrinhoService.atualizar(produtoId, quantidade);

      setCarrinho((prev: any) => {
        if (!prev) return prev;

        const itensAtualizados = prev.itens
          .map((item: any) =>
            item.produtoId === produtoId ? { ...item, quantidade } : item,
          )
          .filter((item: any) => item.quantidade > 0);

        return { ...prev, itens: itensAtualizados };
      });

      animar();
    } catch (err) {
      console.error(err);
    }
  }

  function animar() {
    setAnimando(true);
    setTimeout(() => setAnimando(false), 300);
  }

  async function limparCarrinho() {
    await carregarCarrinho();
  }

  return (
    <CarrinhoContext.Provider
      value={{
        carrinho,
        quantidade,
        loading,
        carregarCarrinho,
        atualizarItem,
        animar,
        animando,
        limparCarrinho,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  const context = useContext(CarrinhoContext);

  if (!context) {
    throw new Error("useCarrinho deve ser usado dentro de CarrinhoProvider");
  }

  return context;
}
