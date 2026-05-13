"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { imagemService } from "@/services/imagemService";
import { categoriaService } from "@/services/categoriaService";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoriaParaEditar?: any;
}

export function ModalNovaCategoria({
  isOpen,
  onClose,
  onSuccess,
  categoriaParaEditar,
}: ModalProps) {
  const [nome, setNome] = useState("");
  const [imagem, setImagem] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagem(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (categoriaParaEditar) {
      setNome(categoriaParaEditar.nome);
      setPreview(categoriaParaEditar.imagemUrl);
    } else {
      setNome("");
      setPreview(null);
      setImagem(null);
    }
  }, [categoriaParaEditar, isOpen]);

  const handleSalvar = async () => {
    if (!nome) return alert("Nome é obrigatório");
    setEnviando(true);
    try {
      let imagemUrl = preview || "";

      if (imagem) {
        imagemUrl = await imagemService.upload(imagem);
      }

      if (categoriaParaEditar) {
        // MODO EDIÇÃO
        await categoriaService.atualizar(categoriaParaEditar.id, {
          nome,
          imagemUrl,
        });
      } else {
        // MODO CRIAÇÃO
        await categoriaService.criar({ nome, imagemUrl });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar categoria");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {categoriaParaEditar ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Nome da Categoria</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Ferramentas Elétricas"
            />
          </div>
          <div className="space-y-2">
            <Label>Ícone/Imagem da Categoria</Label>
            <div className="flex items-center gap-4">
              {preview && (
                <div className="relative w-12 h-12 border rounded overflow-hidden">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-xs"
              />
            </div>
          </div>
        </div>
        <Button onClick={handleSalvar} disabled={enviando} className="w-full">
          {enviando ? (
            <Loader2 className="animate-spin mr-2" />
          ) : categoriaParaEditar ? (
            "Salvar Alterações"
          ) : (
            "Criar Categoria"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
