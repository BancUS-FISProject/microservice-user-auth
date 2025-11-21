import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  email: string;

  @Prop()
  name: string;

  @Prop({ required: true })
  passwordHash: string;   
}

export const UserSchema = SchemaFactory.createForClass(User);