import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReceivedMessageInput, CreateReceivedMessageResponse } from './messages.types';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
@Resolver()
export class MessagesResolver {
  private readonly logger = new Logger(MessagesResolver.name);

  constructor(private readonly prismaService: PrismaService) {}

  @Mutation(() => CreateReceivedMessageResponse)
  async createReceivedMessage(
    @Args('input') input: CreateReceivedMessageInput,
  ): Promise<CreateReceivedMessageResponse> {
    try {
      const receivedMessage = await this.prismaService.receivedMessage.create({
        data: {
          email: input.email.toLowerCase().trim(),
          fullName: input.fullName.trim(),
          linkedInProfile: input.linkedInProfile?.trim() || null,
          message: input.message.trim(),
        },
      });

      this.logger.log(`Message received from: ${input.email}`);

      return {
        success: true,
        message: 'Message received successfully',
        receivedMessage: {
          id: receivedMessage.id,
          email: receivedMessage.email,
          fullName: receivedMessage.fullName,
          linkedInProfile: receivedMessage.linkedInProfile,
          message: receivedMessage.message,
          createdAt: receivedMessage.createdAt,
          updatedAt: receivedMessage.updatedAt,
        },
      };
    } catch (error) {
      this.logger.error('Failed to create received message', error);

      // Handle unique constraint violation (duplicate email)
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        return {
          success: false,
          message: 'A message from this email address has already been received',
        };
      }

      // Handle other database errors
      return {
        success: false,
        message: 'An error occurred while processing your message. Please try again.',
      };
    }
  }
}
