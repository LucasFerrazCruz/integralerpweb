/**
 * Traduz os códigos de 'status_detail' do Mercado Pago para mensagens amigáveis ao usuário.
 * Referência: https://www.mercadopago.com.br/developers/pt/reference/payments/_payments/post
 */
export const traduzirStatusMercadoPago = (statusDetail: string): string => {
  const mensagens: Record<string, string> = {
    // Erros de preenchimento ou validação
    cc_rejected_bad_filled_card_number: "Número do cartão inválido.",
    cc_rejected_bad_filled_date: "Data de vencimento inválida.",
    cc_rejected_bad_filled_other:
      "Verifique os dados do cartão e tente novamente.",
    cc_rejected_bad_filled_security_code: "Código de segurança (CVV) inválido.",

    // Erros de autorização e banco
    cc_rejected_call_for_authorize:
      "O pagamento não foi autorizado. Ligue para o seu banco para liberar a transação.",
    cc_rejected_card_disabled:
      "Este cartão está desativado. Entre em contato com o emissor do cartão.",
    cc_rejected_card_error:
      "Não conseguimos processar seu cartão. Tente outro se o problema persistir.",
    cc_rejected_insufficient_amount:
      "Saldo insuficiente para completar a compra.",
    cc_rejected_invalid_installments:
      "O banco não autorizou o parcelamento para este valor/cartão.",

    // Erros de segurança e limite
    cc_rejected_duplicated_payment:
      "Pagamento duplicado detectado. Se quiser pagar novamente, use outro cartão.",
    cc_rejected_high_risk:
      "O pagamento foi recusado por políticas de segurança. Tente outro meio de pagamento.",
    cc_rejected_max_attempts:
      "Limite de tentativas excedido. Tente novamente amanhã ou use outro cartão.",

    // Erro genérico
    cc_rejected_other_reason:
      "O banco não autorizou o pagamento. Tente um cartão diferente.",
  };

  return (
    mensagens[statusDetail] ||
    "Ocorreu um erro ao processar o pagamento. Verifique os dados ou tente outro cartão."
  );
};
