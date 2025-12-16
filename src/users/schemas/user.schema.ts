import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  id: number;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({
    required: true,
    enum: ['basic', 'premium', 'business'],
    default: 'basic',
  })
  plan: 'basic' | 'premium' | 'business';
}

export const UserSchema = SchemaFactory.createForClass(User);
