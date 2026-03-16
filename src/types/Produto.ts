export interface Produto {
  id: number;
  nome: string;
  descricao?: string;
  categoria?: string;
  estoque?: number;
  imagemUrl?: string;
  preco?: number;
}
