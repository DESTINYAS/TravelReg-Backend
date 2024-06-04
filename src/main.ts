/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
// main.ts

import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({}))
  // Enable CORS
  app.enableCors({
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
  });
  const configService = app.get(ConfigService)
  // * enables the use of class-transformer
  app.useGlobalInterceptors(new ClassSerializerInterceptor(
    app.get(Reflector))
  );

  const config = new DocumentBuilder()
    .setTitle('TravelReg Backend')
    .setDescription('This API handles all the logic around TravelReg application.')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

    const options: SwaggerDocumentOptions = {
      operationIdFactory: (
        controllerKey: string,
        methodKey: string
      ) => methodKey
    };

  const document = SwaggerModule.createDocument(app,config, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT);
}
bootstrap();
