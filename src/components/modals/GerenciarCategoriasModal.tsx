"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { categoriaService } from "@/services/categoriaService";
import { Trash2, Edit2, Plus, Loader2 } from "lucide-react";
import { ModalNovaCategoria } from "./NovaCategoriaModal";

export function GerenciarCategoriasModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isNovaOpen, setIsNovaOpen] = useState(false);
  const [categoriaParaEditar, setCategoriaParaEditar] = useState<any>(null);

  useEffect(() => {
    if (isOpen) carregar();
  }, [isOpen]);

  const abrirParaCriar = () => {
    setCategoriaParaEditar(null);
    setIsNovaOpen(true);
  };

  const abrirParaEditar = (cat: any) => {
    setCategoriaParaEditar(cat);
    setIsNovaOpen(true);
  };

  async function carregar() {
    setLoading(true);
    const data = await categoriaService.listar();
    setCategorias(data);
    setLoading(false);
  }

  async function handleExcluir(id: number) {
    if (
      !confirm(
        "Tem certeza? Esta ação só funcionará se não houver produtos vinculados.",
      )
    )
      return;
    try {
      await categoriaService.excluir(id);
      carregar();
    } catch (error) {
      alert(
        "Não foi possível excluir: verifique se existem produtos nesta categoria.",
      );
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Gerenciar Categorias</DialogTitle>
          <Button size="sm" onClick={(abrirParaCriar) => setIsNovaOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Nova
          </Button>
        </DialogHeader>

        <div className="space-y-2 mt-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            categorias.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={cat.imagemUrl || "/placeholder.png"}
                    className="w-8 h-8 object-contain"
                  />
                  <span className="font-medium">{cat.nome}</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => abrirParaEditar(cat)}
                  >
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleExcluir(cat.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <ModalNovaCategoria
          isOpen={isNovaOpen}
          onClose={() => setIsNovaOpen(false)}
          onSuccess={carregar}
          categoriaParaEditar={categoriaParaEditar}
        />
      </DialogContent>
    </Dialog>
  );
}
