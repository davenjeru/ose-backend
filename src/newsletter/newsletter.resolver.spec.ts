import { Test, TestingModule } from '@nestjs/testing';
import { NewsletterResolver } from './newsletter.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsletterSubscriptionInput } from './newsletter.types';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

describe('NewsletterResolver', () => {
  let resolver: NewsletterResolver;
  let prismaService: PrismaService;

  const mockPrismaService = {
    newsletterSubscription: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsletterResolver,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    resolver = module.get<NewsletterResolver>(NewsletterResolver);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createNewsletterSubscription', () => {
    const validInput: CreateNewsletterSubscriptionInput = {
      email: 'test@example.com',
    };

    const mockSubscription = {
      id: 'test-uuid',
      email: 'test@example.com',
    };

    it('should successfully create a newsletter subscription', async () => {
      (prismaService.newsletterSubscription.create as jest.Mock).mockResolvedValue(
        mockSubscription,
      );

      const result = await resolver.createNewsletterSubscription(validInput);

      expect(result).toEqual({
        success: true,
        message: 'Successfully subscribed to newsletter',
        subscription: {
          id: 'test-uuid',
          email: 'test@example.com',
        },
      });

      expect(prismaService.newsletterSubscription.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
        },
      });
    });

    it('should normalize email to lowercase and trim whitespace', async () => {
      const inputWithWhitespace = {
        email: '  TEST@EXAMPLE.COM  ',
      };

      const expectedSubscription = {
        id: 'test-uuid',
        email: 'test@example.com',
      };

      (prismaService.newsletterSubscription.create as jest.Mock).mockResolvedValue(
        expectedSubscription,
      );

      await resolver.createNewsletterSubscription(inputWithWhitespace);

      expect(prismaService.newsletterSubscription.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
        },
      });
    });

    it('should handle duplicate email error (P2002)', async () => {
      const duplicateError = new PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '6.16.2',
      });

      (prismaService.newsletterSubscription.create as jest.Mock).mockRejectedValue(duplicateError);

      const result = await resolver.createNewsletterSubscription(validInput);

      expect(result).toEqual({
        success: false,
        message: 'This email is already subscribed to the newsletter',
      });
    });

    it('should handle other database errors', async () => {
      const genericError = new Error('Database connection failed');
      (prismaService.newsletterSubscription.create as jest.Mock).mockRejectedValue(genericError);

      const result = await resolver.createNewsletterSubscription(validInput);

      expect(result).toEqual({
        success: false,
        message: 'An error occurred while subscribing to the newsletter. Please try again.',
      });
    });

    it('should handle other Prisma errors that are not P2002', async () => {
      const otherPrismaError = new PrismaClientKnownRequestError('Some other constraint failed', {
        code: 'P2001',
        clientVersion: '6.16.2',
      });

      (prismaService.newsletterSubscription.create as jest.Mock).mockRejectedValue(
        otherPrismaError,
      );

      const result = await resolver.createNewsletterSubscription(validInput);

      expect(result).toEqual({
        success: false,
        message: 'An error occurred while subscribing to the newsletter. Please try again.',
      });
    });
  });
});
