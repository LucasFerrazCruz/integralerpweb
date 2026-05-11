// "use client";

// import { useEffect, useRef } from "react";

// export default function CartaoBrick({
//   amount,
//   onToken,
//   tipo,
// }: {
//   amount: number;
//   onToken: (data: any) => void;
//   tipo: string;
// }) {
//   const settingsRef = useRef(false);

//   const instanceRef = useRef<any>(null);

//   useEffect(() => {
//     // Evita renderizar duas vezes no StrictMode do React
//     if (settingsRef.current) return;
//     if (!(window as any).MercadoPago) return;

//     const mp = new (window as any).MercadoPago(
//       "TEST-e115bf5b-1fa7-4805-a981-eab3ee530ddc",
//       {
//         locale: "pt-BR",
//       },
//     );

//     const bricksBuilder = mp.bricks();

//     const renderCardBrick = async () => {
//       const container = document.getElementById("cardPaymentBrick_container");
//       if (container) container.innerHTML = "";

//       try {
//         instanceRef.current = await bricksBuilder.create(
//           "cardPayment",
//           "cardPaymentBrick_container",
//           {
//             initialization: {
//               amount: amount,
//               payer: { email: "comprador_teste@test.com" },
//             },
//             customization: {
//               visual: {
//                 style: { theme: "default" },
//               },
//               paymentMethods: {
//                 // minInstallments: 1,
//                 // maxInstallments: 12,
//                 types: {
//                   excluded:
//                     tipo === "CARTAO_CREDITO"
//                       ? ["debit_card", "prepaid_card"]
//                       : ["credit_card"],
//                 },
//               },
//             },
//             callbacks: {
//               onReady: () => {
//                 console.log("Brick pronto e parcelas carregadas!");
//               },
//               onSubmit: (formData: any) => {
//                 console.log("Tipo de pagamento: ", formData.payment_type_id); // 'credit_card' ou 'debit_card'

//                 console.log("Tipo formData:", formData);

//                 onToken({
//                   token: formData.token,
//                   paymentMethodId: formData.payment_method_id,
//                   issuerId: formData.issuer_id,
//                   installments: formData.installments,
//                   cardholderEmail: formData.payer.email,
//                 });
//               },
//               onError: (error: any) => {
//                 // Se for o erro {}, ignoramos para não sujar o console
//                 if (error && Object.keys(error).length === 0) return;
//                 console.error("Erro no Brick:", error);
//               },
//             },
//           },
//         );
//       } catch (e) {
//         console.error("Erro ao criar:", e);
//       }
//     };

//     renderCardBrick();
//     settingsRef.current = true;
//   }, [amount, onToken, tipo]);

//   return <div id="cardPaymentBrick_container" key={`${amount}-${tipo}`}></div>;
// }

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

    const mp = new (window as any).MercadoPago(process.env.MP_PUBLIC_KEY, {
      locale: "pt-BR",
    });

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

              //payer: "",
            },

            customization: {
              visual: {
                style: {
                  theme: "flat",
                  customVariables: {},
                },
              },

              paymentMethods: {
                // FORÇANDO as configurações de parcelamento

                //minInstallments: 1,

                maxInstallments: 12,

                // types: {
                //   excluded: [], // Garante que nada está bloqueado
                // },
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
