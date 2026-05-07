import { BoletoData } from "@/types/Pagamento";
import { Button } from "../ui/button";

export function BoletoArea({ boleto }: { boleto: BoletoData }) {
  return (
    <div className="p-6 border rounded-lg bg-gray-50 flex flex-col items-center gap-4">
      <h3 className="text-lg font-bold">Boleto Gerado com Sucesso!</h3>

      <div className="w-full bg-white p-4 border text-center">
        <p className="text-sm text-gray-500 mb-1">Linha Digitável</p>
        <code className="text-blue-600 font-mono break-all">
          {boleto.barcode}
        </code>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => navigator.clipboard.writeText(boleto.barcode)}
        >
          Copiar Código
        </Button>
      </div>

      <div className="flex gap-4 w-full">
        {/* RECURSO PRONTO: Abre o PDF oficial do Mercado Pago */}
        <Button
          className="flex-1 bg-green-600 hover:bg-green-700"
          onClick={() => window.open(boleto.pdfUrl, "_blank")}
        >
          Visualizar / Imprimir Boleto
        </Button>
      </div>

      <p className="text-xs text-gray-400">
        Vencimento em: {new Date(boleto.dataVencimento).toLocaleDateString()}
      </p>
    </div>
  );
}
