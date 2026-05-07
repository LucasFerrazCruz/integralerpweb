export default function ProdutoSkeleton() {
  return (
    <div className="border rounded-xl p-4 bg-white animate-pulse">
      <div className="h-44 bg-gray-200 rounded-lg mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      <div className="mt-4 h-10 bg-gray-200 rounded-lg"></div>
    </div>
  );
}
