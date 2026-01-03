import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BlacklistedTokenDocument = HydratedDocument<BlacklistedToken>;

@Schema({ collection: 'token_blacklist' })
export class BlacklistedToken {
  @Prop({ required: true, unique: true })
  jti: string;

  @Prop({ required: true, expires: 0 })
  expiresAt: Date;
}

export const BlacklistedTokenSchema =
  SchemaFactory.createForClass(BlacklistedToken);
