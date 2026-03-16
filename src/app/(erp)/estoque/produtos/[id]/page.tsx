import ProdutoForm from "@/components/forms/ProdutoForm";

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ProdutoForm produtoId={id} />;
}
