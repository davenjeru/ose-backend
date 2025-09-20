import { Test, TestingModule } from '@nestjs/testing';
import { MessagesResolver } from './messages.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReceivedMessageInput } from './messages.types';

describe('MessagesResolver', () => {
  let resolver: MessagesResolver;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findFirstOrThrow: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
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

    const mockUser = {
      id: 'user-uuid',
      email: 'test@example.com',
      fullName: 'John Doe',
      linkedInProfile: null,
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
    };

    const mockReceivedMessage = {
      id: 'message-uuid',
      userId: 'user-uuid',
      content: 'This is a test message',
      createdAt: new Date('2025-01-01T00:00:00Z'),
    };

    it('should create a message for existing user', async () => {
      (prismaService.user.findFirstOrThrow as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.receivedMessage.create as jest.Mock).mockResolvedValue(mockReceivedMessage);
      (prismaService.user.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await resolver.createReceivedMessage(validInput);

      expect(result).toEqual({
        success: true,
        message: 'Message received successfully',
        receivedMessage: {
          id: 'message-uuid',
          email: 'test@example.com',
          fullName: 'John Doe',
          linkedInProfile: null,
          message: 'This is a test message',
          createdAt: new Date('2025-01-01T00:00:00Z'),
        },
      });

      expect(prismaService.user.findFirstOrThrow).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });

      expect(prismaService.receivedMessage.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-uuid',
          content: 'This is a test message',
        },
      });

      expect(prismaService.user.create).not.toHaveBeenCalled();
    });

    it('should create a new user when user does not exist', async () => {
      (prismaService.user.findFirstOrThrow as jest.Mock).mockRejectedValue(
        new Error('User not found'),
      );
      (prismaService.user.create as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.receivedMessage.create as jest.Mock).mockResolvedValue(mockReceivedMessage);

      const result = await resolver.createReceivedMessage(validInput);

      expect(result).toEqual({
        success: true,
        message: 'Message received successfully',
        receivedMessage: {
          id: 'message-uuid',
          email: 'test@example.com',
          fullName: 'John Doe',
          linkedInProfile: null,
          message: 'This is a test message',
          createdAt: new Date('2025-01-01T00:00:00Z'),
        },
      });

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          fullName: 'John Doe',
          linkedInProfile: null,
        },
      });

      expect(prismaService.receivedMessage.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-uuid',
          content: 'This is a test message',
        },
      });
    });

    it('should create user with LinkedIn profile when provided', async () => {
      const inputWithLinkedIn: CreateReceivedMessageInput = {
        ...validInput,
        linkedInProfile: 'https://linkedin.com/in/johndoe',
      };

      const mockUserWithLinkedIn = {
        ...mockUser,
        linkedInProfile: 'https://linkedin.com/in/johndoe',
      };

      (prismaService.user.findFirstOrThrow as jest.Mock).mockRejectedValue(
        new Error('User not found'),
      );
      (prismaService.user.create as jest.Mock).mockResolvedValue(mockUserWithLinkedIn);
      (prismaService.receivedMessage.create as jest.Mock).mockResolvedValue(mockReceivedMessage);

      const result = await resolver.createReceivedMessage(inputWithLinkedIn);

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          fullName: 'John Doe',
          linkedInProfile: 'https://linkedin.com/in/johndoe',
        },
      });

      expect(result.receivedMessage?.linkedInProfile).toBe('https://linkedin.com/in/johndoe');
    });

    it('should normalize and trim input data', async () => {
      const inputWithWhitespace: CreateReceivedMessageInput = {
        email: '  TEST@EXAMPLE.COM  ',
        fullName: '  John Doe  ',
        linkedInProfile: '  https://linkedin.com/in/johndoe  ',
        message: '  This is a test message  ',
      };

      (prismaService.user.findFirstOrThrow as jest.Mock).mockRejectedValue(
        new Error('User not found'),
      );
      (prismaService.user.create as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.receivedMessage.create as jest.Mock).mockResolvedValue(mockReceivedMessage);

      await resolver.createReceivedMessage(inputWithWhitespace);

      expect(prismaService.user.findFirstOrThrow).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          fullName: 'John Doe',
          linkedInProfile: 'https://linkedin.com/in/johndoe',
        },
      });

      expect(prismaService.receivedMessage.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-uuid',
          content: 'This is a test message',
        },
      });
    });

    it('should handle empty LinkedIn profile by converting to null', async () => {
      const inputWithEmptyLinkedIn: CreateReceivedMessageInput = {
        ...validInput,
        linkedInProfile: '   ',
      };

      (prismaService.user.findFirstOrThrow as jest.Mock).mockRejectedValue(
        new Error('User not found'),
      );
      (prismaService.user.create as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.receivedMessage.create as jest.Mock).mockResolvedValue(mockReceivedMessage);

      await resolver.createReceivedMessage(inputWithEmptyLinkedIn);

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          fullName: 'John Doe',
          linkedInProfile: null,
        },
      });
    });

    it('should handle message creation failure', async () => {
      (prismaService.user.findFirstOrThrow as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.receivedMessage.create as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      const result = await resolver.createReceivedMessage(validInput);

      expect(result).toEqual({
        success: false,
        message: 'An error occurred while processing your message. Please try again.',
      });
    });

    it('should throw error when user creation fails', async () => {
      (prismaService.user.findFirstOrThrow as jest.Mock).mockRejectedValue(
        new Error('User not found'),
      );
      (prismaService.user.create as jest.Mock).mockRejectedValue(new Error('User creation failed'));

      // The resolver doesn't handle user creation errors, so it should throw
      await expect(resolver.createReceivedMessage(validInput)).rejects.toThrow(
        'User creation failed',
      );

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          fullName: 'John Doe',
          linkedInProfile: null,
        },
      });

      // Should not reach message creation due to user creation failure
      expect(prismaService.receivedMessage.create).not.toHaveBeenCalled();
    });

    it('should update the existing user when found by email', async () => {
      const existingUser = {
        ...mockUser,
        fullName: 'Different Name',
        linkedInProfile: 'https://linkedin.com/in/different',
      };

      (prismaService.user.findFirstOrThrow as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.user.update as jest.Mock).mockResolvedValue(existingUser);
      (prismaService.receivedMessage.create as jest.Mock).mockResolvedValue(mockReceivedMessage);

      const result = await resolver.createReceivedMessage(validInput);

      expect(result.receivedMessage?.fullName).toBe('Different Name');
      expect(result.receivedMessage?.linkedInProfile).toBe('https://linkedin.com/in/different');
      expect(prismaService.user.create).not.toHaveBeenCalled();
      expect(prismaService.user.update).toHaveBeenCalled();
    });
  });
});
