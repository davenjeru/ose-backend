import { Module } from '@nestjs/common';
import { MessagesResolver } from './messages.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MessagesResolver],
})
export class MessagesModule {}
