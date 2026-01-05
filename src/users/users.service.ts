import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserPatchDto } from './dto/user-patch.dto';
import { DeleteResult, MongoServerError } from 'mongodb';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async signInUser(data: CreateUserDto): Promise<UserDocument> {
    if (!data.iban) {
      throw new BadRequestException('IBAN is required to create a user');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    const userToSave: Omit<User, '_id'> = {
      iban: data.iban,
      email: data.email,
      name: data.name,
      passwordHash: passwordHash,
      phoneNumber: data.phoneNumber,
      plan: data.plan ?? 'basico',
    };

    const newUser = new this.userModel(userToSave);
    try {
      return await newUser.save();
    } catch (error: unknown) {
      const duplicateKey = this.extractDuplicateKey(error);
      if (duplicateKey) {
        throw new BadRequestException(`Duplicate value for ${duplicateKey}`);
      }
      throw error;
    }
  }

  async getUsers(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async fetchUser(iban: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ iban }).exec();
    if (!user) {
      throw new NotFoundException(`User with iban ${iban} not found`);
    }
    return user;
  }

  // Necesario para la autenticacion
  async findByEmail(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async updateUser(iban: string, data: CreateUserDto): Promise<UserDocument> {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    const updatePayload: Partial<User> = {
      name: data.name,
      email: data.email,
      passwordHash,
      phoneNumber: data.phoneNumber,
      plan: data.plan ?? 'basico',
    };

    try {
      const updated = await this.userModel
        .findOneAndUpdate({ iban }, updatePayload, {
          new: true,
          runValidators: true,
        })
        .exec();
      if (!updated) {
        throw new NotFoundException(`User with iban ${iban} not found`);
      }
      return updated;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const duplicateKey = this.extractDuplicateKey(error);
      if (duplicateKey) {
        throw new BadRequestException(`Duplicate value for ${duplicateKey}`);
      }
      throw new BadRequestException('Invalid update payload');
    }
  }

  async patchUser(iban: string, data: UserPatchDto): Promise<UserDocument> {
    const saltRounds = 10;
    const updatePayload: Partial<User> = {};

    if (data.field === 'passwordHash') {
      updatePayload.passwordHash = await bcrypt.hash(data.value, saltRounds);
    } else if (data.field === 'name') {
      updatePayload.name = data.value;
    } else if (data.field === 'phoneNumber') {
      updatePayload.phoneNumber = data.value;
    } else if (data.field === 'email') {
      updatePayload.email = data.value;
    } else if (data.field === 'plan') {
      updatePayload.plan = data.value as User['plan'];
    }

    try {
      const patched = await this.userModel
        .findOneAndUpdate({ iban }, updatePayload, {
          new: true,
          runValidators: true,
        })
        .exec();
      if (!patched) {
        throw new NotFoundException(`User with iban ${iban} not found`);
      }
      return patched;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const duplicateKey = this.extractDuplicateKey(error);
      if (duplicateKey) {
        throw new BadRequestException(`Duplicate value for ${duplicateKey}`);
      }
      throw new BadRequestException('Invalid patch payload');
    }
  }

  async deleteUser(iban: string): Promise<UserDocument> {
    const deleted = await this.userModel.findOneAndDelete({ iban }).exec();
    if (!deleted) {
      throw new NotFoundException(`User with iban ${iban} not found`);
    }
    return deleted;
  }

  async deleteAllUsers(): Promise<DeleteResult> {
    return this.userModel.deleteMany({}).exec();
  }

  private extractDuplicateKey(error: unknown): string | null {
    const mongoError = error as MongoServerError | undefined;
    if (mongoError?.code === 11000) {
      const keyValue = (mongoError.keyValue ?? {}) as Record<string, unknown>;
      return Object.keys(keyValue)[0] ?? 'field';
    }
    return null;
  }
}
