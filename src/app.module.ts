import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: () => {
        return {
          autoSchemaFile: true,
          sortSchema: true,
          playground: true,
          introspection: true,
        };
      },
    }),
    PrismaModule,
    HealthModule,
    NewsletterModule,
    MessagesModule,
  ],
})
export class AppModule {}
