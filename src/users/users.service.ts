import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {}

    async createUser(data: CreateUserDto) {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(data.password, saltRounds);

        const userToSave = {
            email: data.email,
            name: data.name,
            passwordHash: passwordHash,
        };
        
        const newUser = new this.userModel(userToSave); 
        return newUser.save();                   
    }

    async getUsers() {
        return this.userModel.find().exec();
    }

}
