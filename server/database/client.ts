import { getCloudflareContext } from '@opennextjs/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from "@/server/database/schemas";

/**
 * Retrieves Cloudflare-specific context and initializes Drizzle with D1 binding.
 * Ensure "DB" matches your D1 binding name in wrangler.jsonc.
 */
export async function getDb() {
    const { env } = await getCloudflareContext({ async: true });

    return drizzle(env.DB, {
        schema,
        logger: true,
    });
}

// Alias for compatibility with existing code
export const db = getDb;
