import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import express, { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@/exceptionfilter/http-exception.filter';
import { Logger } from '@nestjs/common';
dotenv.config(); // Load .env file manually
// import { ParseServer } from 'parse-server';//can't use it this way since it's compatible.
const { ParseServer } = require('parse-server');

async function bootstrap() {
  const app1 = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const corsOptions: CorsOptions = {
    //origin: `${CORSOPTIONS_ORIGIN}`, // Allow requests from your Next.js app domain
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders:
      'Content-Type, Authorization, Access-Control-Allow-Headers, X-Parse-Application-Id, X-Parse-REST-API-Key,sessiontoken,x-parse-session-token',
  };

  app1.enableCors(corsOptions);

  const parseApp = express();

  // Middleware to set default X-Parse-Application-Id
  parseApp.use((req, res, next) => {
    if (!req.headers['X-Parse-Application-Id']) {
      req.headers['X-Parse-Application-Id'] = 'openSignApp';
    }
    next();
  });

  const parseServer = new ParseServer({
    databaseURI: process.env.OPENSIGN_MONGODB_URL,
    appId: process.env.XParseApplicationId,
    masterKey: process.env.XParseMasterKey, // Keep it secret!
    serverURL: process.env.OpenSignServerURL,
    publicServerURL: process.env.OpenSignServerURL,
    allowClientClassCreation: true, //change it to false in production
    encodeParseObjectInCloudFunction: true,
    enableInsecureAuthAdapters: true,
    pages: {
      enableRouter: true, // avoid warn: DeprecationWarning: PublicAPIRouter is deprecated
    },
    logLevel: 'warn',
  });

  // Mount Parse Server at `/parse` endpoint
  parseServer.start().then(() => {
    parseApp.use('/parse', parseServer.app);
    Logger.log('Parse Server started successfully', 'ParseServer');
  });

  //Used in the signPDF.ts
  app1.use(function (req, res, next) {
    req.headers['x-real-ip'] = getUserIP(req);
    next();
  });

  function getUserIP(request) {
    let forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      if (forwardedFor.indexOf(',') > -1) {
        return forwardedFor.split(',')[0];
      } else {
        return forwardedFor;
      }
    } else {
      return request.socket.remoteAddress;
    }
  }

  // Mount Express app to NestJS
  app1.use(parseApp);

  app1.use(json({ limit: '50mb' }));
  app1.use(urlencoded({ extended: true, limit: '50mb' }));
  app1.useGlobalPipes(
    new ValidationPipe({
      transformOptions: {
        enableImplicitConversion: true, // allow conversion underneath
      },
    }),
  );
  app1.useGlobalFilters(new HttpExceptionFilter());

  await app1.listen(4000);
}

bootstrap();
