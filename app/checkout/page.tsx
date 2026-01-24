"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to plans page because we are strictly using Stripe Checkout via Plans page
    // and maintaining two checkout flows (MercadoPago + Stripe) without backend support for MP is not ideal in migration.
    router.replace('/plans');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
    </div>
  );
}
