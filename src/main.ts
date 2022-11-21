import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter, PrismaService } from 'nestjs-prisma';
import { ConfigService } from '@nestjs/config';
import fastifyCookie from '@fastify/cookie';
import type { NestConfig, SwaggerConfig } from '../src/common/config/config.interface';
import { AllExceptionsFilter } from './common/exception/all-exception.filter';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { join } from 'path';
import { SocketAdapter } from './adapter/socket.adapter';
import helmet from '@fastify/helmet';
import { contentParser } from 'fastify-multer';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  app.useWebSocketAdapter(new SocketAdapter(app));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  const prismaService: PrismaService = app.get(PrismaService);
  prismaService.enableShutdownHooks(app);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  const configService = app.get(ConfigService);

  const nestConfig = configService.get<NestConfig>('nest');

  const swaggerConfig = configService.get<SwaggerConfig>('swagger');
  if (swaggerConfig.enabled) {
    const options = new DocumentBuilder()
      .setTitle(swaggerConfig.title || 'SyTX')
      .setDescription(swaggerConfig.description || 'The SyTX API description')
      .setVersion(swaggerConfig.version || '1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup(swaggerConfig.path || 'api', app, document);
  }

  app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      },
    },
  });

  app.register(contentParser);

  const fastifyCors = require('@fastify/cors');
  app.register(fastifyCors, {
    origin: function (origin, callback) {
      let allowed = false;
      let whitelist = [
        '127.0.0.1',
        'localhost',
        /^localhost:\d+/,

        // production
        ...process.env['ALLOWED_ORIGINS'].split(','),
      ];
      for (const pattern of whitelist) {
        if (origin?.search(pattern) >= 0) {
          allowed = true;
          break;
        }
      }
      if (allowed) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'X-HTTP-Method-Override',
      'Accept',
      'Accept-Language',
      'Content-Language',
      'Observe',
      'Content-Type',
      'Authorization',
      'sec-ch-ua',
      'sec-ch-ua-mobile',
      'Sec-Fetch-Dest',
      'Sec-Fetch-Mode',
      'Sec-Fetch-Site',
    ],
    methods: ['GET', 'PUT', 'OPTIONS', 'HEAD', 'POST', 'PATCH', 'DELETE'],
    maxAge: 86400, // seconds for how long the response to the preflight request can be cached for without sending another preflight request. In this case, 86400 seconds is 24 hours. Note that each browser has a maximum internal value that takes precedence when the Access-Control-Max-Age is greater.
    preflightContinue: false,
    credentials: true,
    optionsSuccessStatus: 204,
  });

  app.register(fastifyCookie);

  app.setViewEngine({
    engine: {
      handlebars: require('handlebars'),
    },
    templates: join(__dirname, '..', 'views'),
  });

  await app.listen(process.env.PORT || nestConfig.port || 3000, '0.0.0.0', (err, address) => {
    console.log('Start app.server.address', address);
    if (err) {
      console.error('app.err', err);
    }
  });
}
bootstrap();
