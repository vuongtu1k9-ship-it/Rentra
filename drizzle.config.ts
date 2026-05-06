import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './server/src/db/schema.mts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgres://postgres:l@localhost:5432/rentra',
  },
});
