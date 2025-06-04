import { NestFactory } from '@nestjs/core';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { AuthModule } from './auth.module';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule, {
    logger: new ConsoleLogger({
      json: true,
    }),
  });
  app.enableCors({
    origin: '*', // Allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });
  app.setGlobalPrefix(process.env.TOP_LEVEL_PREFIX || 'api'); // Set global prefix for all routes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Allow implicit conversion of types
      },
      whitelist: true, // Strip properties that are not in the DTO
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are found
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
