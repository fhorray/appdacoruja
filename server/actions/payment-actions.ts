"use server";

import { headers } from "next/headers";
import { getAuthSession } from "@/lib/auth/server";
import Stripe from 'stripe';
import { db as getDb } from "@/server/database/client";
import { subscriptions } from "@/server/database/schemas/finance";
import { eq, desc } from "drizzle-orm";
import { SelectUser } from "../database/schemas";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover', // Cast to any to avoid TS error if types are missing
});

export async function createCheckoutSessionAction(priceId: string) {
  const { user } = await getAuthSession();

  // Create Stripe session
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe API key not configured");
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/plans`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
      },
    });

    if (!checkoutSession.url) {
      throw new Error("Failed to create checkout URL");
    }

    return { url: checkoutSession.url };
  } catch (error) {
    console.error("Stripe error:", error);
    throw new Error("Erro ao criar sessão de pagamento");
  }
}

export async function getUserSubscriptionAction() {

  try {
    const { user } = await getAuthSession();
    
    const db = await getDb();
    
    const sub = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, user.id))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1); // Get latest

    if (sub.length > 0) {
      return {
        subscription_status: sub[0].status,
        ...sub[0]
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return null;
  }
}
