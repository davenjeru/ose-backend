import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  CreateNewsletterSubscriptionInput, 
  CreateNewsletterSubscriptionResponse 
} from './newsletter.types';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

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
      const subscription = await this.prismaService.newsletterSubscription.create({
        data: {
          email: input.email.toLowerCase().trim(),
        },
      });

      this.logger.log(`Newsletter subscription created for email: ${input.email}`);

      return {
        success: true,
        message: 'Successfully subscribed to newsletter',
        subscription: {
          id: subscription.id,
          email: subscription.email,
        },
      };
    } catch (error) {
      this.logger.error('Failed to create newsletter subscription', error);

      // Handle unique constraint violation (duplicate email)
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        return {
          success: false,
          message: 'This email is already subscribed to the newsletter',
        };
      }

      // Handle other database errors
      return {
        success: false,
        message: 'An error occurred while subscribing to the newsletter. Please try again.',
      };
    }
  }
}
