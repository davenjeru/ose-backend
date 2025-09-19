import { Resolver, Query } from '@nestjs/graphql';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
@Resolver()
export class HelloResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query(() => String)
  async hello(): Promise<string> {
    try {
      const isConnected = await this.prismaService.isConnected();
      
      if (isConnected) {
        return 'hi there';
      } else {
        return 'hello, but database connection failed';
      }
    } catch (error) {
      console.error('Database connection error:', error);
      return 'hello, but database connection failed';
    }
  }
}
