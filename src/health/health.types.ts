import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class HealthStatus {
  @Field()
  status: string;
}
