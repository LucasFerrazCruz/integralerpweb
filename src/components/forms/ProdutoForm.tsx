"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { produtoService } from "@/services/produtoService";
import { categoriaService } from "@/services/categoriaService";
import { Categoria } from "@/types/Categoria";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

import { imagemService } from "@/services/imagemService";
import {
  Loader2,
  Package,
  Ruler,
  Image as ImageIcon,
  Factory,
  DollarSign,
} from "lucide-react";
import { Textarea } from "../ui/textarea";

export default function ProdutoForm({ produtoId }: { produtoId?: string }) {
  const router = useRouter();

  // estados básicos
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [estoqueMinimo, setEstoqueMinimo] = useState("");
  const [categoriaId, setCategoriaId] = useState("");

  // estados de preço
  const [preco, setPreco] = useState("");
  const [precoPix, setPrecoPix] = useState("");

  // estados técnicos
  const [fabricante, setFabricante] = useState("");
  const [material, setMaterial] = useState("");
  const [unidade, setUnidade] = useState("");

  // Estados de Logística
  const [peso, setPeso] = useState("");
  const [largura, setLargura] = useState("");
  const [altura, setAltura] = useState("");
  const [comprimento, setComprimento] = useState("");
  const [diametro, setDiametro] = useState("");

  const [imagem, setImagem] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarCategorias();
    if (produtoId) carregarProduto();
  }, [produtoId]);

  useEffect(() => {
    if (!imagem) {
      if (!produtoId) setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imagem);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imagem, produtoId]);

  async function carregarCategorias() {
    const data = await categoriaService.listar();
    setCategorias(data);
  }

  async function carregarProduto() {
    const data = await produtoService.buscarPorId(Number(produtoId));

    setNome(data.nome);
    setDescricao(data.descricao);
    setCodigoBarras(data.codigoBarras);
    setEstoqueMinimo(String(data.estoqueMinimo));
    setCategoriaId(String(data.categoriaId));
    setPreco(data.preco);
    setPrecoPix(data.precoPix || "");
    setFabricante(data.fabricante || "");
    setMaterial(data.material || "");
    setUnidade(data.unidade || "");
    setPeso(data.peso || "");
    setLargura(data.largura || "");
    setAltura(data.altura || "");
    setComprimento(data.comprimento || "");
    setDiametro(data.diametro || "");

    if (data.imagemUrl) setPreview(data.imagemUrl);
  }

  const aplicarDescontoPix = () => {
    if (preco) {
      const valor = parseFloat(preco) * 0.9;
      setPrecoPix(valor.toFixed(2));
    }
  };

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);

    try {
      let imagemUrl = preview;

      if (imagem) imagemUrl = await imagemService.upload(imagem);

      const payload = {
        nome,
        descricao,
        codigoBarras,
        estoqueMinimo: Number(estoqueMinimo),
        categoriaId: Number(categoriaId),
        imagemUrl,
        preco: Number(preco),
        precoPix: precoPix ? Number(precoPix) : null,
        fabricante,
        material,
        unidade,
        peso: Number(peso),
        largura: Number(largura),
        altura: Number(altura),
        comprimento: Number(comprimento),
        diametro: Number(diametro),
      };

      if (produtoId) {
        await produtoService.atualizar(Number(produtoId), payload);
      } else {
        await produtoService.criar(payload);
      }

      router.push("/estoque/produtos");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar produto.");
    } finally {
      setSalvando(false);
    }
  }

  async function criarCategoria() {
    const nomeCategoria = prompt("Nome da categoria");

    if (!nomeCategoria) return;

    await categoriaService.criar(nomeCategoria);

    await carregarCategorias();
  }

  async function uploadImagem() {
    if (!imagem) return null;

    const url = await imagemService.upload(imagem);

    return url;
  }

  return (
    <div className="max-w-3xl bg-white p-8 rounded-xl shadow-sm border mx-auto">
      <h2 className="text-2xl font-bold mb-8 text-gray-800">
        {produtoId ? "⚙️ Editar Produto" : "📦 Novo Produto"}
      </h2>

      <form onSubmit={salvar} className="space-y-10">
        {/* SEÇÃO 1: INFORMAÇÕES GERAIS */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-blue-600 font-bold border-b pb-2 mb-4">
            <Package size={20} /> <span>Informações Gerais</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Produto</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição Detalhada</Label>
            <Textarea
              id="descricao"
              className="min-h-[100px]"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">Código de Barras / SKU</Label>
              <Input
                id="sku"
                value={codigoBarras}
                onChange={(e) => setCodigoBarras(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estoque">Estoque Mínimo</Label>
              <Input
                id="estoque"
                type="number"
                value={estoqueMinimo}
                onChange={(e) => setEstoqueMinimo(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* SEÇÃO 2: PRECIFICAÇÃO */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2 text-green-600 font-bold border-b pb-2 mb-4">
            <DollarSign size={20} /> <span>Precificação</span>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="preco">Preço Base (Cartão)</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="precoPix">Preço à Vista (PIX)</Label>
                <button
                  type="button"
                  onClick={aplicarDescontoPix}
                  className="text-[10px] text-blue-500 hover:underline"
                >
                  Sugerir -10%
                </button>
              </div>
              <Input
                id="precoPix"
                type="number"
                step="0.01"
                value={precoPix}
                onChange={(e) => setPrecoPix(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* SEÇÃO 3: DADOS TÉCNICOS */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2 text-purple-600 font-bold border-b pb-2 mb-4">
            <Factory size={20} /> <span>Especificações Técnicas</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fabricante">Fabricante</Label>
              <Input
                id="fabricante"
                value={fabricante}
                onChange={(e) => setFabricante(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="material">Material</Label>
              <Input
                id="material"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unidade">Unidade (UN, KG, MT)</Label>
              <Input
                id="unidade"
                value={unidade}
                onChange={(e) => setUnidade(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* SEÇÃO 4: LOGÍSTICA */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2 text-orange-600 font-bold border-b pb-2 mb-4">
            <Ruler size={20} /> <span>Dimensões e Logística</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input
                id="peso"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diametro">Diâmetro (cm)</Label>
              <Input
                id="diametro"
                value={diametro}
                onChange={(e) => setDiametro(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="largura">Largura (cm)</Label>
              <Input
                id="largura"
                value={largura}
                onChange={(e) => setLargura(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="altura">Altura (cm)</Label>
              <Input
                id="altura"
                value={altura}
                onChange={(e) => setAltura(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comprimento">Comprimento (cm)</Label>
              <Input
                id="comprimento"
                value={comprimento}
                onChange={(e) => setComprimento(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* SEÇÃO 5: CATEGORIA E MÍDIA */}
        <section className="grid grid-cols-2 gap-8 pt-4 border-t">
          <div className="space-y-4">
            <Label>Categoria do Produto</Label>
            <div className="flex gap-2">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const n = prompt("Nova Categoria:");
                  if (n) categoriaService.criar(n).then(carregarCategorias);
                }}
              >
                {" "}
                +{" "}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Foto do Produto</Label>
            <div className="flex items-center gap-4">
              {preview && (
                <div className="relative w-16 h-16 border rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
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
                className="text-xs"
                onChange={(e) => setImagem(e.target.files?.[0] || null)}
              />
            </div>
          </div>
        </section>

        <Button
          type="submit"
          className="w-full h-12 text-lg font-bold"
          disabled={salvando}
        >
          {salvando ? (
            <>
              <Loader2 className="mr-2 animate-spin" /> Salvando...
            </>
          ) : (
            "✅ Salvar Produto"
          )}
        </Button>
      </form>
    </div>
  );
}
