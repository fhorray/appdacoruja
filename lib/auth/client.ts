import { createAuthClient } from "better-auth/react"
import { cloudflareClient } from "better-auth-cloudflare/client";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  plugins: [
    cloudflareClient()
  ]
})