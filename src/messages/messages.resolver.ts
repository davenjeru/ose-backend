import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReceivedMessageInput, CreateReceivedMessageResponse } from './messages.types';
import { User } from '@prisma/client';

@Injectable()
@Resolver()
export class MessagesResolver {
  private readonly logger = new Logger(MessagesResolver.name);

  constructor(private readonly prismaService: PrismaService) {}

  @Mutation(() => CreateReceivedMessageResponse)
  async createReceivedMessage(
    @Args('input') input: CreateReceivedMessageInput,
  ): Promise<CreateReceivedMessageResponse> {
    let user: User;

    // Check if user exists, by email
    user = await this.prismaService.user.findFirst({
      where: { email: input.email.toLowerCase().trim() },
    });

    if (!user) {
      // Create new user if one with the email
      // doesn't exist
      user = await this.prismaService.user.create({
        data: {
          email: input.email.toLowerCase().trim(),
          fullName: input.fullName.trim(),
          linkedInProfile: input.linkedInProfile?.trim() || null,
        },
      });
    } else {
      // Update the found user's name and LinkedIn Profile
      user = await this.prismaService.user.update({
        data: {
          fullName: input.fullName.trim(),
          linkedInProfile: input.linkedInProfile?.trim() || user.linkedInProfile || null,
        },
        where: { email: input.email.toLowerCase().trim() },
      });
    }

    // Create the message
    try {
      const receivedMessage = await this.prismaService.receivedMessage.create({
        data: {
          userId: user.id,
          content: input.message.trim(),
        },
      });

      this.logger.log(`Message received from: ${input.email}`);

      return {
        success: true,
        message: 'Message received successfully',
        receivedMessage: {
          id: receivedMessage.id,
          email: user.email,
          fullName: user.fullName,
          linkedInProfile: user.linkedInProfile,
          message: receivedMessage.content,
          createdAt: receivedMessage.createdAt,
        },
      };
    } catch (error) {
      this.logger.error('Failed to create received message', error);

      // Handle other database errors
      return {
        success: false,
        message: 'An error occurred while processing your message. Please try again.',
      };
    }
  }
}
