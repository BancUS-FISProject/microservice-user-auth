import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const apiVersion = '1';

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
    .addServer(`/v${apiVersion}`)
    .addBearerAuth() // Para JWT más adelante
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // <-- /api será la URL de Swagger

  const port = parseInt(configService.get<string>('PORT') ?? '3000', 10);
  await app.listen(port);
}
void bootstrap();
