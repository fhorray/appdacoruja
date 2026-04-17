/**
 * Keyword-based category suggestion logic.
 */
interface SuggestionMap {
  expense: Record<string, string>;
  income: Record<string, string>;
}

const KEYWORD_MAP: SuggestionMap = {
  expense: {
    'uber': 'Transporte',
    '99': 'Transporte',
    'indriver': 'Transporte',
    'ifood': 'Delivery',
    'rappi': 'Delivery',
    'aiqfome': 'Delivery',
    'netflix': 'Streaming',
    'spotify': 'Streaming',
    'disney': 'Streaming',
    'hbo': 'Streaming',
    'farmacia': 'Saúde',
    'drogaria': 'Saúde',
    'mercado': 'Alimentação',
    'supermercado': 'Alimentação',
    'pao de acucar': 'Alimentação',
    'carrefour': 'Alimentação',
    'posto': 'Combustível',
    'shell': 'Combustível',
    'ipiranga': 'Combustível',
    'petrobras': 'Combustível',
    'academia': 'Saúde',
    'smartfit': 'Saúde',
    'amazon': 'Compras',
    'mercadolivre': 'Compras',
    'shopee': 'Compras',
    'magalu': 'Compras',
    'aluguel': 'Moradia',
    'condominio': 'Moradia',
    'enel': 'Moradia',
    'nubank': 'Fatura',
    'inter': 'Fatura',
  },
  income: {
    'salario': 'Renda',
    'pagamento': 'Renda',
    'recebimento': 'Renda',
    'freela': 'Freela',
    'freelaxt': 'Freela',
    'venda': 'Venda',
    'reembolso': 'Outros',
    'pix recebido': 'Transferência',
    'transferencia recebida': 'Transferência',
  }
};

/**
 * Suggests a category based on the transaction description and type.
 * @param description The transaction description string.
 * @param type The transaction type ('expense' or 'income').
 * @returns The suggested category name or null if no match found.
 */
export function suggestCategory(description: string, type: 'expense' | 'income' = 'expense'): string | null {
  if (!description) return null;
  
  const normalizedDesc = description.toLowerCase();
  const map = KEYWORD_MAP[type] || KEYWORD_MAP.expense;
  
  for (const [keyword, category] of Object.entries(map)) {
    if (normalizedDesc.includes(keyword)) {
      return category;
    }
  }
  
  return null;
}
