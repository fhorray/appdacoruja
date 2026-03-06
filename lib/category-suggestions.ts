/**
 * Keyword-based category suggestion logic.
 */
const KEYWORD_MAP: Record<string, string> = {
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
};

/**
 * Suggests a category based on the transaction description.
 * @param description The transaction description string.
 * @returns The suggested category name or null if no match found.
 */
export function suggestCategory(description: string): string | null {
  if (!description) return null;
  
  const normalizedDesc = description.toLowerCase();
  
  for (const [keyword, category] of Object.entries(KEYWORD_MAP)) {
    if (normalizedDesc.includes(keyword)) {
      return category;
    }
  }
  
  return null;
}
