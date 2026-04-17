"use client";

import { useEffect, useRef } from "react";

export default function CartaoBrick({
  amount,
  onToken,
}: {
  amount: number;
  onToken: (data: any) => void;
}) {
  const settingsRef = useRef(false);

  const instanceRef = useRef<any>(null);

  useEffect(() => {
    // Evita renderizar duas vezes no StrictMode do React
    if (settingsRef.current) return;
    if (!(window as any).MercadoPago) return;

    const mp = new (window as any).MercadoPago(
      "TEST-e115bf5b-1fa7-4805-a981-eab3ee530ddc",
      {
        locale: "pt-BR",
      },
    );

    const bricksBuilder = mp.bricks();

    const renderCardBrick = async () => {
      const container = document.getElementById("cardPaymentBrick_container");
      if (container) container.innerHTML = "";

      try {
        instanceRef.current = await bricksBuilder.create(
          "cardPayment",
          "cardPaymentBrick_container",
          {
            initialization: {
              amount: amount,
              payer: { email: "comprador_teste@test.com" },
            },
            customization: {
              visual: {
                style: { theme: "default" },
              },
              paymentMethods: {
                // FORÇANDO as configurações de parcelamento
                minInstallments: 1,
                maxInstallments: 12,
                types: {
                  excluded: [], // Garante que nada está bloqueado
                },
              },
            },
            callbacks: {
              onReady: () => {
                console.log("Brick pronto e parcelas carregadas!");
              },
              onSubmit: (formData: any) => {
                onToken({
                  token: formData.token,
                  paymentMethodId: formData.payment_method_id,
                  installments: formData.installments,
                  cardholderEmail: formData.payer.email,
                });
              },
              onError: (error: any) => {
                // Se for o erro {}, ignoramos para não sujar o console
                if (error && Object.keys(error).length === 0) return;
                console.error("Erro no Brick:", error);
              },
            },
          },
        );
      } catch (e) {
        console.error("Erro ao criar:", e);
      }
    };

    renderCardBrick();
    settingsRef.current = true;
  }, [amount, onToken]);

  return <div id="cardPaymentBrick_container" key={amount}></div>;
}
