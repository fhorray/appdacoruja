"use client";

import React, { useState } from 'react';
import { Check, ArrowLeft, Loader2 } from 'lucide-react';
import { STRIPE_PRODUCTS } from '@/lib/stripe-config';
import { authClient } from '@/lib/auth/client';
import { createCheckoutSessionAction } from '@/server/actions/payment-actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PlansPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    if (!session?.user) {
      router.push('/login');
      return;
    }

    setLoadingPriceId(priceId);

    try {
      const { url } = await createCheckoutSessionAction(priceId);
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoadingPriceId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Planos</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Escolha o plano ideal para você
          </h2>
          <p className="text-lg text-gray-600">
            Organize suas finanças com facilidade e tome decisões mais inteligentes
          </p>
        </div>

        <div className="grid gap-8 max-w-2xl mx-auto">
          {STRIPE_PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 p-8 relative"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                  RECOMENDADO
                </span>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <div className="flex items-baseline justify-center gap-2 mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {product.currencySymbol} {product.price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-gray-600">/mês</span>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Controle completo de receitas e despesas</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Categorização automática de gastos</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Relatórios detalhados e gráficos</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Definição de limites por categoria</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Simulador de aposentadoria</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Projetos financeiros personalizados</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Suporte prioritário</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe(product.priceId)}
                disabled={loadingPriceId === product.priceId}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loadingPriceId === product.priceId ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Assinar Agora'
                )}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Cancele a qualquer momento • Sem compromisso
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Tem dúvidas sobre qual plano escolher?
          </p>
          <Link
            href="/contact"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Entre em contato conosco
          </Link>
        </div>
      </div>
    </div>
  );
}
