import { Controller, Get, Post, Body, Put, Patch, Delete, Param, ParseIntPipe, HttpCode} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserPatchDto } from './dto/user-patch.dto';


@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService : UsersService) {};

    @ApiOperation({ summary: 'Create a new user' })
    @ApiBody({
        type: CreateUserDto,
        schema: {
            example: {
                email: 'john.doe@example.com',
                name: 'John Doe',
                password: 's3cretPass',
                phoneNumber: '+34123456789',
            },
        },
    })
    @Post()
    async signInUser(@Body() createUserDto: CreateUserDto) {
        return this.usersService.signInUser(createUserDto)
    }

    @ApiOperation({ summary: 'Retrieve a single user by id' })
    @ApiParam({ name: 'id', type: Number, example: 1, description: 'User internal id' })
    @Get(':id')
    async fetchUser(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.fetchUser(id)
    }

    @ApiOperation({ summary: 'Overwrite a user profile' })
    @ApiParam({ name: 'id', type: Number, example: 1, description: 'User internal id' })
    @ApiBody({
        type: CreateUserDto,
        schema: {
            example: {
                email: 'aledb@bancus.com',
                name: 'Alejandro Díaz Brenes',
                password: '123456',
                phoneNumber: '+34633444555',
            },
        },
    })
    @Put(':id')
    async updateUser(
        @Param('id', ParseIntPipe) id: number,
        @Body() createUserDto: CreateUserDto,
    ) {
        return this.usersService.updateUser(id, createUserDto)
    }

    @ApiOperation({ summary: 'Update a single field of a user' })
    @ApiParam({ name: 'id', type: Number, example: 1, description: 'User internal id' })
    @ApiBody({
        type: UserPatchDto,
        examples: {
            phone: {
                summary: 'Update phone number',
                value: { field: 'phoneNumber', value: '+34666000111' },
            },
            email: {
                summary: 'Update email',
                value: { field: 'email', value: 'new.mail@example.com' },
            },
        },
    })
    @Patch(':id')
    async patchUser(
        @Param('id', ParseIntPipe) id: number,
        @Body() userPatchDto: UserPatchDto,
    ) {
        return this.usersService.patchUser(id, userPatchDto)
    }

    @ApiOperation({ summary: 'Remove a user account' })
    @ApiParam({ name: 'id', type: Number, example: 1, description: 'User internal id' })
    @Delete(':id')
    @HttpCode(204)
    async deleteUser(@Param('id', ParseIntPipe) id: number) {
        await this.usersService.deleteUser(id);
    }

    @ApiOperation({ summary: 'Remove every user account' })
    @Delete()
    @HttpCode(204)
    async deleteAllUsers() {
        await this.usersService.deleteAllUsers();
    }

    @ApiOperation({ summary: 'List all registered users' })
    @Get()
    findAll() {
        return this.usersService.getUsers();
    }


}
