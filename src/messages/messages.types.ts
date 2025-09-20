import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@ObjectType()
export class ReceivedMessage {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  fullName: string;

  @Field({ nullable: true })
  linkedInProfile?: string;

  @Field()
  message: string;

  @Field()
  createdAt: Date;
}

@InputType()
export class CreateReceivedMessageInput {
  @Field()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @Field()
  @IsString({ message: 'Full name must be a string' })
  @IsNotEmpty({ message: 'Full name is required' })
  fullName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'LinkedIn profile must be a string' })
  linkedInProfile?: string;

  @Field()
  @IsString({ message: 'Message must be a string' })
  @IsNotEmpty({ message: 'Message is required' })
  message: string;
}

@ObjectType()
export class CreateReceivedMessageResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => ReceivedMessage, { nullable: true })
  receivedMessage?: ReceivedMessage;
}
