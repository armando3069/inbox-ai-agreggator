import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  datasource: {
    schema: "prisma/schema.prisma",
    url: process.env.DATABASE_URL,
  },
});
