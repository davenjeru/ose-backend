import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';

@ObjectType()
export class NewsletterSubscription {
  @Field()
  id: string;

  @Field()
  email: string;
}

@InputType()
export class CreateNewsletterSubscriptionInput {
  @Field()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}

@ObjectType()
export class CreateNewsletterSubscriptionResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field(() => NewsletterSubscription, { nullable: true })
  subscription?: NewsletterSubscription;
}
