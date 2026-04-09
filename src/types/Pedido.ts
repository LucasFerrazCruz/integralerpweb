export type PedidoItem = {
  id: number;
  produtoId: number;
  produtoNome: string;
  imagemUrl: string;
  quantidade: number;
  preco: number;
  subtotal: number;
};

export type Pedido = {
  id: number;
  subtotal: number;
  frete: number;
  total: number;
  status: string;
  tipo: string;
  enderecoEntrega: string;
  itens: PedidoItem[];
};
