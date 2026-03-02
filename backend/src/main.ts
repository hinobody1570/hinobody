import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // WebSocket: use Socket.IO adapter for chat
  app.useWebSocketAdapter(new IoAdapter(app));

  // Enable CORS for frontend
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global response interceptor - standardizes all API responses
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global exception filter - standardizes all error responses
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('HiNobody API')
    .setDescription('HiNobody - Beauty Review Platform API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management')
    .addTag('Boards', 'Board management')
    .addTag('Posts', 'Post management')
    .addTag('S3', 'AWS S3 file management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const PORT = process.env.PORT || 3001

  await app.listen(`${PORT}`, '0.0.0.0');
  console.log(`🚀 HiNobody Backend is running on: http://localhost:${PORT}`);
  console.log(`📚 Swagger documentation available at: http://localhost:${PORT}/api`);
}
bootstrap();
