import { NestFactory } from '@nestjs/core';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule, {
    logger: new ConsoleLogger({
      json: true,
    }),
  });
  const config = new DocumentBuilder()
    .setTitle('Auth Gateway API')
    .setDescription('Free API for authentication')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup((process.env.TOP_LEVEL_PREFIX || '') + '/documentation', app, documentFactory);

  app.enableCors();
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
