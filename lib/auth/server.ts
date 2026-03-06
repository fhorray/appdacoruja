import { betterAuth } from "better-auth";
import { withCloudflare } from "better-auth-cloudflare";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/server/database/schemas";
import { APP_CONFIG } from "@/constants";
import { stripe } from "@better-auth/stripe";
import { stripeClient } from "@/lib/stripe";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";

/**
 * Single auth configuration that handles both CLI and runtime scenarios
 */
function createAuth(env?: CloudflareEnv, cf?: IncomingRequestCfProperties) {
  // Use actual DB (DB binding) for runtime, empty object cast for CLI
  const db = env ? drizzle(env.DB, { schema, logger: true }) : ({} as any);

  return betterAuth({
    ...withCloudflare(
      {
        autoDetectIpAddress: !!cf,
        geolocationTracking: !!cf,
        cf,
        d1: env
          ? {
              db,
              options: {
                usePlural: true,
                debugLogs: true,
              },
            }
          : undefined,
      },
      {
        baseURL: process.env.NEXT_PUBLIC_BASE_URL,
        emailAndPassword: {
          enabled: true,
        },
        // ADVANCED CONFIG
        advanced: {
          cookiePrefix: APP_CONFIG.PREFIX,
        },
        session: {
          // AVOID CALLING /get-session every request
          cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // 5 minutes
          },
        },
        plugins: [
          stripe({
            stripeClient,
            stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
            createCustomerOnSignUp: true,
          })
        ]
      }
    ),
    // Only add database adapter for CLI schema generation
    ...(env
      ? {}
      : {
          database: drizzleAdapter({}, {
            provider: "sqlite",
            usePlural: true,
            schema
          }),
        }),
  });
}

// Export for CLI schema generation (runs without env)
export const auth = createAuth();

// Export for runtime usage (to be used with context)
export { createAuth };

/**
 * Convenience wrapper for runtime usage within OpenNext context
 */
export async function initAuth() {
  const { env, cf } = await getCloudflareContext({ async: true });
  return createAuth(env, cf);
}
