import { Resolver, Query } from '@nestjs/graphql';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HealthStatus } from '../health/health.types';

@Injectable()
@Resolver()
export class HealthResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query(() => HealthStatus)
  async health(): Promise<HealthStatus> {
    try {
      const isConnected = await this.prismaService.isConnected();

      return {
        status: isConnected ? 'healthy' : 'unhealthy',
      };
    } catch (error) {
      console.error('Database connection error:', error);
      return {
        status: 'unhealthy',
      };
    }
  }
}
