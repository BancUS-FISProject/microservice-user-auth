import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from './common/logger/app-logger.service';
import { HttpLoggingInterceptor } from './common/logger/http-logging.interceptor';

async function bootstrap() {
  const logger = new AppLogger();
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger,
  });
  const configService = app.get(ConfigService);
  const apiVersion = '1';

  app.useLogger(logger);
  app.useGlobalInterceptors(new HttpLoggingInterceptor(logger));

  app.useGlobalPipes(
    // Validacion DTO
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: apiVersion,
  });

  // 🔹 Configuración Swagger
  const config = new DocumentBuilder()
    .setTitle('Users & Auth API')
    .setDescription('API para el microservicio de usuarios y autenticación')
    .setVersion('1.0')
    .addBearerAuth() // Para JWT más adelante
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true, // Incluye el prefijo de versión en los paths de Swagger
  });
  SwaggerModule.setup('api', app, document); // <-- /api será la URL de Swagger

  const port = parseInt(configService.get<string>('PORT') ?? '3000', 10);
  await app.listen(port);
  logger.log(`Users & Auth service listening on port ${port}`, 'Bootstrap');
}
void bootstrap();
