import 'dotenv/config';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('v1');

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [process.env.FRONTEND_URL];

      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Power BI Management API')
    .setDescription('API para gestão de relatórios e acessos ao Power BI')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const server = app.getHttpServer();
  const router = server._events.request._router;

  if (router && router.stack) {
    console.log('--- ROTAS REGISTRADAS NO NESTJS ---');
    router.stack.forEach((layer: any) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods)
          .join(', ')
          .toUpperCase();
        console.log(`${methods} -> ${layer.route.path}`);
      }
    });
    console.log('----------------------------------');
  }

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
