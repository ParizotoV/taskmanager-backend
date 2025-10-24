import { swaggerConfig, swaggerOptions } from '@/config/swagger.config';
import { extractErrorMessages } from '@/interfaces/http/api/shared/utils/errors';
import { ClassValidatorException } from '@/interfaces/http/errors/class-validator.exception';
import { HttpExceptionFilter } from '@/interfaces/http/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  })

  app.enableCors();

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api', app, document, swaggerOptions)

  app.useBodyParser('json')
  app.useBodyParser('text')
  app.useBodyParser('raw')

  app.useGlobalFilters(new HttpExceptionFilter())

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      exceptionFactory: (errors) =>
        new ClassValidatorException(extractErrorMessages(errors)),
    }),
  )

  app.enableShutdownHooks()

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
