import { betterAuth } from "better-auth";
import { withCloudflare } from "better-auth-cloudflare";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/server/database/schemas";
import { APP_CONFIG } from "@/constants";
import { stripe } from "@better-auth/stripe";
import { stripeClient } from "@/lib/stripe";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { headers } from "next/headers";
import { SelectUser, SelectSession } from "@/server/database/schemas";

/**
 * Single auth configuration that handles both CLI and runtime scenarios
 */
function createAuth(env?: CloudflareEnv, cf?: IncomingRequestCfProperties) {
  // Use actual DB (DB binding) for runtime, empty object cast for CLI
  const db = env ? drizzle(env.DB, { schema, logger: true }) : ({} as any);

  return betterAuth({
    secret: process.env.BETTER_AUTH_SECRET || "BUILD_SECRET_DONT_USE_IN_PROD",
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
          sendResetPassword: async ({ user, url }) => {
            if (env?.SEND_EMAIL) {
              await env.SEND_EMAIL.send({
                from: "suporte@francy.dev",
                to: user.email,

                subject: "Recuperação de Senha - App da Coruja",
                text: `Olá ${user.name},\n\nPara redefinir sua senha, clique no link abaixo:\n${url}\n\nSe você não solicitou isso, ignore este e-mail.`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 8px;">
                      <h2 style="color: #003153;">Recuperação de Senha</h2>
                      <p>Olá <strong>${user.name}</strong>,</p>
                      <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>App da Coruja</strong>.</p>
                      <p>Clique no botão abaixo para escolher uma nova senha:</p>
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${url}" style="background-color: #003153; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Redefinir Minha Senha</a>
                      </div>
                      <p style="font-size: 14px; color: #666;">Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
                      <p style="font-size: 12px; color: #888; word-break: break-all;">${url}</p>
                      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                      <p style="font-size: 12px; color: #888;">Se você não solicitou a troca de senha, pode ignorar este e-mail com segurança.</p>
                    </div>
                  `
              });
            } else {
              console.warn("SEND_EMAIL binding not found. Recovery link:", url);
            }
          },
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

/**
 * Helper to get the current authenticated session
 */
export async function getAuthSession() {
  const authInstance = await initAuth();
  const session = await authInstance.api.getSession({
    headers: await headers(),
  });

  console.log("SESSION: ", session)

  if (!session) throw new Error("Unauthorized");

  return session as {
    session: { session: SelectSession, user: SelectUser };
    user: SelectUser;
  };
}
