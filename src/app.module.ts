import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const mongoUri = configService.get<string>('MONGO_URI');
        const mongoHost = configService.get<string>('MONGO_HOST') ?? 'mongo';
        const mongoPort = configService.get<string>('MONGO_PORT') ?? '27017';
        const mongoDb = configService.get<string>('MONGO_DB') ?? 'userauth_db';

        const uri =
          mongoUri ?? `mongodb://${mongoHost}:${mongoPort}/${mongoDb}`;

        return {
          uri,
          autoIndex: true,
        };
      },
    }),

    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
