import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private pool: Pool;
  private configService: ConfigService;

  constructor(configService: ConfigService) {
    const databaseUrl = configService.get<string>('DATABASE_URL');

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    const pgPoolMaxRaw = configService.get<string>('PG_POOL_MAX');
    const pgPoolMax = pgPoolMaxRaw ? Number(pgPoolMaxRaw) : 4;
    const pgPoolIdleTimeoutMsRaw = configService.get<string>('PG_POOL_IDLE_TIMEOUT_MS');
    const pgPoolIdleTimeoutMs = pgPoolIdleTimeoutMsRaw ? Number(pgPoolIdleTimeoutMsRaw) : 30_000;
    const pgPoolConnectionTimeoutMsRaw = configService.get<string>(
      'PG_POOL_CONNECTION_TIMEOUT_MS',
    );
    const pgPoolConnectionTimeoutMs = pgPoolConnectionTimeoutMsRaw
      ? Number(pgPoolConnectionTimeoutMsRaw)
      : 10_000;

    // Create PostgreSQL connection pool (keep this small for hosted Postgres / PgBouncer)
    const pool = new Pool({
      connectionString: databaseUrl,
      max: Number.isFinite(pgPoolMax) && pgPoolMax > 0 ? pgPoolMax : 4,
      idleTimeoutMillis:
        Number.isFinite(pgPoolIdleTimeoutMs) && pgPoolIdleTimeoutMs >= 0
          ? pgPoolIdleTimeoutMs
          : 30_000,
      connectionTimeoutMillis:
        Number.isFinite(pgPoolConnectionTimeoutMs) && pgPoolConnectionTimeoutMs > 0
          ? pgPoolConnectionTimeoutMs
          : 10_000,
    });

    // Create Prisma adapter
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: ['query', 'info', 'warn', 'error'],
    });

    this.pool = pool;
    this.configService = configService;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
