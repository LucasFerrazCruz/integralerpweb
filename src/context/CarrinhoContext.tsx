"use client";

import { carrinhoService } from "@/services/carrinhoService";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";

type Item = {
  produtoId: number;
  produtoNome: string;
  preco: number;
  quantidade: number;
  imagemUrl?: string;
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
  const { data: session, status } = useSession();
  const [carrinho, setCarrinho] = useState<Carrinho | null>({
    itens: [],
    total: 0,
  });
  const quantidade =
    carrinho?.itens.reduce((acc, item) => acc + item.quantidade, 0) || 0;
  const [loading, setLoading] = useState(true);
  const [animando, setAnimando] = useState(false);

  async function carregarCarrinho() {
    if (status === "loading") return;

    if (session) {
      try {
        setLoading(true);
        const data = await carrinhoService.buscar();
        setCarrinho(data);
      } catch {
        console.error("Erro ao carregar carrinho");
      } finally {
        setLoading(false);
      }
    } else {
      const localData = localStorage.getItem("carrinho_provisorio");

      if (localData) {
        const itens = JSON.parse(localData);
        const total = itens.reduce(
          (acc: number, item: any) => acc + item.preco * item.quantidade,
          0,
        );
        setCarrinho({ itens, total });
      }
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated" && session) {
      const sincronizar = async () => {
        const localData = localStorage.getItem("carrinho_provisorio");

        try {
          await carrinhoService.buscar();

          if (localData) {
            const itens = JSON.parse(localData);
            // 2. Sincroniza um por um
            for (const item of itens) {
              await carrinhoService.atualizar(item.produtoId, item.quantidade);
            }
            localStorage.removeItem("carrinho_provisorio");
          }
        } catch (err) {
          console.error("Erro na sincronização:", err);
        } finally {
          // 3. Só carrega o estado final após garantir a sincronização
          await carregarCarrinho();
        }
      };
      sincronizar();
    } else if (status === "unauthenticated") {
      carregarCarrinho();
    }
  }, [session, status]);

  async function atualizarItem(
    produtoId: number,
    quantidade: number,
    produtoInfo?: any,
  ) {
    if (session) {
      // Logado: Vai direto para o banco
      console.log("Enviando para API:", { produtoId, quantidade });
      await carrinhoService.atualizar(produtoId, quantidade);
      await carregarCarrinho();
    } else {
      // Deslogado: Manipula LocalStorage
      const itensAtuais = [...(carrinho?.itens || [])];
      const index = itensAtuais.findIndex((i) => i.produtoId === produtoId);

      if (index > -1) {
        if (quantidade <= 0) {
          itensAtuais.splice(index, 1);
        } else {
          itensAtuais[index].quantidade = quantidade;
        }
      } else if (quantidade > 0 && produtoInfo) {
        // Se for um item novo, adiciona com as infos do produto
        itensAtuais.push({
          produtoId,
          produtoNome: produtoInfo.nome,
          preco: produtoInfo.preco,
          quantidade,
          imagemUrl: produtoInfo.imagemUrl,
        });
      }

      localStorage.setItem("carrinho_provisorio", JSON.stringify(itensAtuais));
      const total = itensAtuais.reduce(
        (acc, item) => acc + item.preco * item.quantidade,
        0,
      );
      setCarrinho({ itens: itensAtuais, total });
    }
    animar();
  }

  function animar() {
    setAnimando(true);
    setTimeout(() => setAnimando(false), 300);
  }

  async function limparCarrinho() {
    if (session) {
      setCarrinho({ itens: [], total: 0 });
    } else {
      localStorage.removeItem("carrinho_provisorio");
      setCarrinho({ itens: [], total: 0 });
    }
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
