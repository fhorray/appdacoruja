export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  currencySymbol: string;
  mode: 'subscription' | 'payment';
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_TqNOXFpTpGy5vx',
    priceId: 'price_1SsgtoC2uAlon2GihonUIvza',
    name: 'Assinatura Pro',
    description: 'Plataforma de organização financeira pessoal para quem quer entender, controlar e planejar melhor o próprio dinheiro. Acompanhe receitas e despesas, visualize seus gastos por categoria e tome decisões financeiras com mais clareza. Simples, seguro e fácil de usar. Assinatura mensal recorrente, com cancelamento a qualquer momento.',
    price: 33.00,
    currency: 'brl',
    currencySymbol: 'R$',
    mode: 'subscription'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return STRIPE_PRODUCTS.find(product => product.priceId === priceId);
};

export const getProductById = (id: string): StripeProduct | undefined => {
  return STRIPE_PRODUCTS.find(product => product.id === id);
};
