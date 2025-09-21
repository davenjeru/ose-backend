import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateNewsletterSubscriptionInput,
  CreateNewsletterSubscriptionResponse,
} from './newsletter.types';

@Injectable()
@Resolver()
export class NewsletterResolver {
  private readonly logger = new Logger(NewsletterResolver.name);

  constructor(private readonly prismaService: PrismaService) {}

  @Mutation(() => CreateNewsletterSubscriptionResponse)
  async createNewsletterSubscription(
    @Args('input') input: CreateNewsletterSubscriptionInput,
  ): Promise<CreateNewsletterSubscriptionResponse> {
    try {
      const normalizedEmail = input.email.toLowerCase().trim();
      const subscription = await this.prismaService.newsletterSubscription.upsert({
        where: {
          email: normalizedEmail,
        },
        update: {
          // No updates needed for existing subscriptions - just return the existing one
        },
        create: {
          email: normalizedEmail,
        },
      });

      this.logger.log(`Newsletter subscription processed for email: ${input.email}`);

      return {
        success: true,
        message: 'Successfully subscribed to newsletter',
        subscription: {
          id: subscription.id,
          email: subscription.email,
        },
      };
    } catch (error) {
      this.logger.error('Failed to process newsletter subscription', error);

      // Handle other database errors
      return {
        success: false,
        message: 'An error occurred while subscribing to the newsletter. Please try again.',
      };
    }
  }
}
