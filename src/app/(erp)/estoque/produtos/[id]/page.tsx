import ProdutoForm from "@/components/forms/ProdutoForm";

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <h1>Editar Produto</h1>
      <ProdutoForm produtoId={id} />
    </div>
  );
}
