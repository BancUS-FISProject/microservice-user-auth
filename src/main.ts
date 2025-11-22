import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(

    // Validacion DTO
    new ValidationPipe({
      whitelist: true,           
      forbidNonWhitelisted: true, 
      transform: true,           
    }),
  );

  // 🔹 Configuración Swagger
  const config = new DocumentBuilder()
    .setTitle('Users & Auth API')
    .setDescription('API para el microservicio de usuarios y autenticación')
    .setVersion('1.0')
    .addBearerAuth() // Para JWT más adelante
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // <-- /api será la URL de Swagger



  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
