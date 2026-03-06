
import dotenv from 'dotenv';
import { defineConfig } from "drizzle-kit";

dotenv.config({
  path: ".dev.vars"
})

export default defineConfig({
  dialect: "sqlite",
  driver: "d1-http",
  out: "./server/database/migrations",
  schema: "./server/database/schemas/index.ts",
  dbCredentials: {
    databaseId: "4678471a-f8e1-4f6b-90cf-99f5597e8c6c",
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
});
