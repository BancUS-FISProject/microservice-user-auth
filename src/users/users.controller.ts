import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Patch,
  Delete,
  Param,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserPatchDto } from './dto/user-patch.dto';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
    type: CreateUserDto,
    schema: {
      example: {
        iban: 'ES9820385778983000760236',
        email: 'john.doe@example.com',
        name: 'John Doe',
        password: 's3cretPass',
        phoneNumber: '+34123456789',
      },
    },
  })
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Duplicate field or invalid data' })
  @Post()
  async signInUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.signInUser(createUserDto);
  }

  @ApiOperation({
    summary: 'Retrieve a single user by IBAN or email (auto-detected)',
  })
  @ApiParam({
    name: 'identifier',
    type: String,
    example: 'ES9820385778983000760236',
    description: 'User IBAN or email',
  })
  @ApiOkResponse({ description: 'User found', type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Get(':identifier')
  async fetchUser(@Param('identifier') identifier: string) {
    if (identifier.includes('@')) {
      return this.usersService.findByEmail(identifier);
    }
    return this.usersService.fetchUser(identifier);
  }

  @ApiOperation({ summary: 'Overwrite a user profile' })
  @ApiParam({
    name: 'iban',
    type: String,
    example: 'ES9820385778983000760236',
    description: 'User IBAN',
  })
  @ApiBody({
    type: CreateUserDto,
    schema: {
      example: {
        iban: 'ES9820385778983000760236',
        email: 'aledb@bancus.com',
        name: 'Alejandro Díaz Brenes',
        password: '123456',
        phoneNumber: '+34633444555',
      },
    },
  })
  @ApiOkResponse({ description: 'User overwritten', type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Duplicate field or invalid data' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Put(':iban')
  async updateUser(
    @Param('iban') iban: string,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.updateUser(iban, createUserDto);
  }

  @ApiOperation({ summary: 'Update a single field of a user' })
  @ApiParam({
    name: 'iban',
    type: String,
    example: 'ES9820385778983000760236',
    description: 'User IBAN',
  })
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
  @ApiOkResponse({ description: 'User updated', type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid patch payload' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Patch(':iban')
  async patchUser(
    @Param('iban') iban: string,
    @Body() userPatchDto: UserPatchDto,
  ) {
    return this.usersService.patchUser(iban, userPatchDto);
  }

  @ApiOperation({ summary: 'Remove a user account' })
  @ApiParam({
    name: 'iban',
    type: String,
    example: 'ES9820385778983000760236',
    description: 'User IBAN',
  })
  @Delete(':iban')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'User deleted' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async deleteUser(@Param('iban') iban: string) {
    await this.usersService.deleteUser(iban);
  }

  @ApiOperation({ summary: 'Remove every user account' })
  @Delete()
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'All users deleted' })
  async deleteAllUsers() {
    await this.usersService.deleteAllUsers();
  }

  @ApiOperation({ summary: 'List all registered users' })
  @ApiOkResponse({
    description: 'List of users',
    type: UserResponseDto,
    isArray: true,
  })
  @Get()
  findAll() {
    return this.usersService.getUsers();
  }
}
