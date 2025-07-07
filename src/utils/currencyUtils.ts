export const formatCurrency = (value: string | null) => {
  if (!value) return "0,00";
  
  // Remove caracteres não numéricos exceto vírgula e ponto
  const cleanValue = value.replace(/[^\d,.-]/g, "");
  
  // Se já tem vírgula, use como está
  if (cleanValue.includes(",")) {
    return cleanValue;
  }
  
  // Se tem ponto, converte para vírgula
  if (cleanValue.includes(".")) {
    return cleanValue.replace(".", ",");
  }
  
  // Se é só número, adiciona ,00
  return cleanValue + ",00";
};

export const parseValue = (value: string | null): number => {
  if (!value) return 0;
  
  // Remove caracteres não numéricos exceto vírgula e ponto
  const cleanValue = value.replace(/[^\d,.-]/g, "");
  
  // Converte vírgula para ponto para cálculo
  const numericValue = cleanValue.replace(",", ".");
  
  return parseFloat(numericValue) || 0;
};

export const calculateTotal = (valorTotal: string | null, valorPedido: string | null, taxaEntrega: string | null) => {
  // Primeiro verifica se já temos valor_total no banco
  if (valorTotal) {
    return formatCurrency(valorTotal);
  }
  
  // Se não, calcula somando valor_pedido + taxa_entrega
  const valorPedidoNum = parseValue(valorPedido);
  const taxaEntregaNum = parseValue(taxaEntrega);
  const total = valorPedidoNum + taxaEntregaNum;
  
  return total.toFixed(2).replace(".", ",");
};