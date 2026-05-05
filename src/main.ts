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
      // Defina explicitamente as origens permitidas ou puxe do .env
      const allowedOrigins = [
        process.env.FRONTEND_URL, // Ex: http://172.17.1.7
        'http://172.17.1.7', // IP do servidor privado
        'http://168.138.126.80:8085', // IP do servidor publico
        'http://localhost:3000', // Porta padrão do Next.js local
        'http://localhost:3005', // Sua porta mapeada no Docker
      ].filter(Boolean); // Remove valores nulos/undefined

      // Permite requisições sem origin (como ferramentas de mobile ou Postman)
      if (!origin) return callback(null, true);

      // Verifica se a origem está na lista (removendo barras extras no final)
      const isAllowed = allowedOrigins.some(
        (allowed) => origin.replace(/\/$/, '') === allowed.replace(/\/$/, ''),
      );

      if (isAllowed) {
        return callback(null, true);
      }

      console.log(`CORS bloqueou a origem: ${origin}`); // Log para debug no Docker
      return callback(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // OPTIONS é vital para Preflight
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'set-cookie'],
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
