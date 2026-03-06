"use client";

import React, { useEffect, useState } from 'react';
import { Crown, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getUserSubscriptionAction } from '@/server/actions/payment-actions';

// We can accept subscription as prop (SSR) or fetch it (CSR).
// Since Dashboard fetches data, maybe pass it down?
// But subscription logic is separate.
// I'll make it CSR for now to match OLD behavior (loading state), but SSR is better.
// For now, I'll stick to simple component that fetches if not provided, OR accepts it.
// Dashboard client component is better suited to receive it as prop if Dashboard Page fetches it.
// But Dashboard Page fetches "DashboardData".
// I'll add subscription fetching to Dashboard Page too or just fetch here.
// I'll fetch here.

export function SubscriptionStatus() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const sub = await getUserSubscriptionAction();
        setSubscription(sub);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  if (loading) {
    return null; // Or skeleton
  }

  const isActive = subscription?.subscription_status === 'active';

  return (
    <div className={`rounded-xl p-5 mb-6 border-2 ${
      isActive
        ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
        : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200'
    }`}>
      <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isActive ? 'bg-yellow-100' : 'bg-orange-100'
          }`}>
            {isActive ? (
              <Crown className="w-6 h-6 text-yellow-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-orange-600" />
            )}
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">
              {isActive ? 'Assinatura Pro' : 'Plano Gratuito'}
            </p>
            <p className="text-sm text-gray-700">
              {isActive ? 'Todos os recursos liberados' : 'Funcionalidades limitadas'}
            </p>
          </div>
        </div>

        {!isActive && (
          <Button
            onClick={() => router.push('/plans')}
            className="px-6 h-11 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
          >
            Fazer Upgrade
          </Button>
        )}
      </div>
    </div>
  );
}
