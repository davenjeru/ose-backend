import { Test, TestingModule } from '@nestjs/testing';
import { MessagesResolver } from './messages.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReceivedMessageInput } from './messages.types';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

describe('MessagesResolver', () => {
  let resolver: MessagesResolver;
  let prismaService: PrismaService;

  const mockPrismaService = {
    receivedMessage: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesResolver,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    resolver = module.get<MessagesResolver>(MessagesResolver);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createReceivedMessage', () => {
    const validInput: CreateReceivedMessageInput = {
      email: 'test@example.com',
      fullName: 'John Doe',
      message: 'This is a test message',
    };

    const mockReceivedMessage = {
      id: 'test-uuid',
      email: 'test@example.com',
      fullName: 'John Doe',
      linkedInProfile: null,
      message: 'This is a test message',
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
    };

    it('should successfully create a received message without LinkedIn profile', async () => {
      (prismaService.receivedMessage.create as jest.Mock).mockResolvedValue(mockReceivedMessage);

      const result = await resolver.createReceivedMessage(validInput);

      expect(result).toEqual({
        success: true,
        message: 'Message received successfully',
        receivedMessage: {
          id: 'test-uuid',
          email: 'test@example.com',
          fullName: 'John Doe',
          linkedInProfile: null,
          message: 'This is a test message',
          createdAt: new Date('2025-01-01T00:00:00Z'),
          updatedAt: new Date('2025-01-01T00:00:00Z'),
        },
      });

      expect(prismaService.receivedMessage.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          fullName: 'John Doe',
          linkedInProfile: null,
          message: 'This is a test message',
        },
      });
    });

    it('should successfully create a received message with LinkedIn profile', async () => {
      const inputWithLinkedIn: CreateReceivedMessageInput = {
        ...validInput,
        linkedInProfile: 'https://linkedin.com/in/johndoe',
      };

      const mockMessageWithLinkedIn = {
        ...mockReceivedMessage,
        linkedInProfile: 'https://linkedin.com/in/johndoe',
      };

      (prismaService.receivedMessage.create as jest.Mock).mockResolvedValue(
        mockMessageWithLinkedIn,
      );

      const result = await resolver.createReceivedMessage(inputWithLinkedIn);

      expect(result.receivedMessage?.linkedInProfile).toBe('https://linkedin.com/in/johndoe');
      expect(prismaService.receivedMessage.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          fullName: 'John Doe',
          linkedInProfile: 'https://linkedin.com/in/johndoe',
          message: 'This is a test message',
        },
      });
    });

    it('should normalize and trim all string inputs', async () => {
      const inputWithWhitespace: CreateReceivedMessageInput = {
        email: '  TEST@EXAMPLE.COM  ',
        fullName: '  John Doe  ',
        linkedInProfile: '  https://linkedin.com/in/johndoe  ',
        message: '  This is a test message  ',
      };

      const expectedMessage = {
        ...mockReceivedMessage,
        linkedInProfile: 'https://linkedin.com/in/johndoe',
      };

      (prismaService.receivedMessage.create as jest.Mock).mockResolvedValue(expectedMessage);

      await resolver.createReceivedMessage(inputWithWhitespace);

      expect(prismaService.receivedMessage.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          fullName: 'John Doe',
          linkedInProfile: 'https://linkedin.com/in/johndoe',
          message: 'This is a test message',
        },
      });
    });

    it('should handle empty LinkedIn profile by converting to null', async () => {
      const inputWithEmptyLinkedIn: CreateReceivedMessageInput = {
        ...validInput,
        linkedInProfile: '   ',
      };

      (prismaService.receivedMessage.create as jest.Mock).mockResolvedValue(mockReceivedMessage);

      await resolver.createReceivedMessage(inputWithEmptyLinkedIn);

      expect(prismaService.receivedMessage.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          fullName: 'John Doe',
          linkedInProfile: null,
          message: 'This is a test message',
        },
      });
    });

    it('should handle duplicate email error (P2002)', async () => {
      const duplicateError = new PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '6.16.2',
      });

      (prismaService.receivedMessage.create as jest.Mock).mockRejectedValue(duplicateError);

      const result = await resolver.createReceivedMessage(validInput);

      expect(result).toEqual({
        success: false,
        message: 'A message from this email address has already been received',
      });
    });

    it('should handle other database errors', async () => {
      const genericError = new Error('Database connection failed');
      (prismaService.receivedMessage.create as jest.Mock).mockRejectedValue(genericError);

      const result = await resolver.createReceivedMessage(validInput);

      expect(result).toEqual({
        success: false,
        message: 'An error occurred while processing your message. Please try again.',
      });
    });

    it('should handle other Prisma errors that are not P2002', async () => {
      const otherPrismaError = new PrismaClientKnownRequestError('Some other constraint failed', {
        code: 'P2001',
        clientVersion: '6.16.2',
      });

      (prismaService.receivedMessage.create as jest.Mock).mockRejectedValue(otherPrismaError);

      const result = await resolver.createReceivedMessage(validInput);

      expect(result).toEqual({
        success: false,
        message: 'An error occurred while processing your message. Please try again.',
      });
    });
  });
});
