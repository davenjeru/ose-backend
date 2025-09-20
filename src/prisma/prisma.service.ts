import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  private connected = false;

  async onModuleInit() {
    try {
      await this.$connect();
      this.connected = true;
      this.logger.log('Successfully connected to database');
    } catch (error) {
      this.logger.warn('Failed to connect to database on startup', error.message);
      this.connected = false;
    }
  }

  async onModuleDestroy() {
    if (this.connected) {
      await this.$disconnect();
    }
  }

  async isConnected(): Promise<boolean> {
    if (!this.connected) {
      return false;
    }

    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.warn('Database connection check failed', error.message);
      this.connected = false;
      return false;
    }
  }
}
