import { Module } from '@nestjs/common';
import { NewsletterResolver } from './newsletter.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [NewsletterResolver],
})
export class NewsletterModule {}
