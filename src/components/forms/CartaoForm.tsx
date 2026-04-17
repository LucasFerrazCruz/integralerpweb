"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { PatternFormat } from "react-number-format";

export default function CartaoForm({ onToken }: any) {
  const [mercadoPago, setMercadoPago] = useState<any>(null);

  const [cardNumber, setCardNumber] = useState("");
  const [expiration, setExpiration] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initSDK = () => {
      if ((window as any).MercadoPago) {
        const instance = new (window as any).MercadoPago(
          "TEST-e115bf5b-1fa7-4805-a981-eab3ee530ddc",
          { locale: "pt-BR" },
        );
        setMercadoPago(instance);
      }
    };

    initSDK();

    const timer = setTimeout(initSDK, 500);
    return () => clearTimeout(timer);
  }, []);

  function validar() {
    if (!cardNumber || !expiration || !cvv || !name || !email) {
      return "Preencha todos os campos";
    }

    if (cardNumber.replace(/\s/g, "").length < 16) {
      return "Número do cartão inválido";
    }

    if (cvv.length < 3) {
      return "CVV inválido";
    }

    return null;
  }

  async function handleSubmit() {
    const erro = validar();
    if (erro) {
      alert(erro);
      return;
    }

    if (!mercadoPago) {
      alert("SDK não carregado");
      return;
    }

    try {
      setLoading(true);

      const onlyNumbers = expiration.replace(/\D/g, "");

      if (onlyNumbers.length < 4) {
        alert("Data de expiração incompleta (use MM/AA)");
        setLoading(false);
        return;
      }

      const mes = onlyNumbers.substring(0, 2);
      const anoCurto = onlyNumbers.substring(2, 4);
      const anoCompleto = `20${anoCurto}`;

      console.log("Dados formatados para o envio:");
      console.log("Mês:", mes);
      console.log("Ano:", anoCompleto);

      const token = await mercadoPago.createCardToken({
        cardNumber: cardNumber.replace(/\D/g, ""),
        cardholderName: name.trim(),
        cardExpirationMonth: mes,
        cardExpirationYear: anoCompleto,
        securityCode: cvv.replace(/\D/g, ""),
      });

      onToken({
        token: token.id,
        paymentMethodId: "visa",
        installments: 1,
        cardholderEmail: email.trim(),
      });
    } catch (e: any) {
      console.log("Erro detalhado do MP:", e);

      const msg = e[0]?.message || "Erro ao gerar token do cartão";
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Cartão de crédito</h2>

        {/* Número */}
        <PatternFormat
          format="#### #### #### ####"
          mask="_"
          value={cardNumber}
          onValueChange={(values) => setCardNumber(values.value)}
          placeholder="Número do cartão"
          className="w-full border rounded p-2"
        />

        {/* Nome */}
        <input
          placeholder="Nome no cartão"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded p-2"
        />

        {/* Linha expiração + cvv */}
        <div className="flex gap-2">
          <PatternFormat
            format="##/##"
            placeholder="MM/AA"
            className="w-1/2 border rounded p-2"
            value={expiration}
            onValueChange={(values) => setExpiration(values.value)}
          />

          <PatternFormat
            format="###"
            placeholder="CVV"
            className="w-1/2 border rounded p-2"
            value={cvv}
            onValueChange={(values) => setCvv(values.value)}
          />
        </div>

        {/* Email */}
        <input
          placeholder="Email do pagador"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2"
        />

        {/* Botão */}
        <Button
          className="w-full bg-black text-white"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Processando..." : "Pagar"}
        </Button>
      </CardContent>
    </Card>
  );
}
