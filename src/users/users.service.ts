import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserPatchDto } from './dto/user-patch.dto';


@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {}

    // TODO - Sospechoso, quiza hay que cambiarlo
    private async getNextUserId(): Promise<number> {
        const lastUser = await this.userModel
            .findOne({}, { id: 1 }, { sort: { id: -1 } })
            .lean();
        return lastUser?.id ? lastUser.id + 1 : 1;
    }

    async signInUser(data: CreateUserDto) {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(data.password, saltRounds);
        const nextId = await this.getNextUserId();

        const userToSave = {
            id: nextId,
            email: data.email,
            name: data.name,
            passwordHash: passwordHash,
            phoneNumber: data.phoneNumber,
        };
        
        const newUser = new this.userModel(userToSave); 
        try {
            return await newUser.save();
        } catch (error) {
            if (error?.code === 11000) {
                const field = Object.keys(error?.keyValue ?? {})[0] ?? 'field';
                throw new BadRequestException(`Duplicate value for ${field}`);
            }
            throw error;
        }                   
    }

    async getUsers() {
        return this.userModel.find().exec();
    }

    async fetchUser(id: number){
        const user = await this.userModel.findOne({ id }).exec();
        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        return user;
    }

    async updateUser(id: number, data: CreateUserDto){
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(data.password, saltRounds);

        const updatePayload = {
            name: data.name,
            email: data.email,
            passwordHash,
            phoneNumber: data.phoneNumber,
        };

        try {
            const updated = await this.userModel
                .findOneAndUpdate({ id }, updatePayload, { new: true, runValidators: true })
                .exec();
            if (!updated) {
                throw new NotFoundException(`User with id ${id} not found`);
            }
            return updated;
        } catch (error) {
            if (error?.code === 11000) {
                const field = Object.keys(error?.keyValue ?? {})[0] ?? 'field';
                throw new BadRequestException(`Duplicate value for ${field}`);
            }
            throw new BadRequestException('Invalid update payload');
        }
    }

    async patchUser(id: number, data: UserPatchDto) {
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
        }

        try {
            const patched = await this.userModel
                .findOneAndUpdate({ id }, updatePayload, { new: true, runValidators: true })
                .exec();
            if (!patched) {
                throw new NotFoundException(`User with id ${id} not found`);
            }
            return patched;
        } catch (error) {
            if (error?.code === 11000) {
                const field = Object.keys(error?.keyValue ?? {})[0] ?? 'field';
                throw new BadRequestException(`Duplicate value for ${field}`);
            }
            throw new BadRequestException('Invalid patch payload');
        }
    }

    async deleteUser(id: number) {
        const deleted = await this.userModel.findOneAndDelete({ id }).exec();
        if (!deleted) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        return deleted;
    }

    async deleteAllUsers() {
        return this.userModel.deleteMany({}).exec();
    }

}
