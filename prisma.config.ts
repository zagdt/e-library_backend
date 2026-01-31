import { defineConfig } from 'prisma/config';
import { config } from './src/config/index.js';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: config.database.url,
  },
});
