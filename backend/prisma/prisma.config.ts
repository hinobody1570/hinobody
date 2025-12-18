import { PrismaConfig } from '@prisma/client/config'

export const config: PrismaConfig = {
  datasources: {
    db: {
      adapter: 'postgresql',
      url: process.env.DATABASE_URL,
    },
  },
}
