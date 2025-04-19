import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { HttpExceptionFilter } from '@/exceptionfilter/http-exception.filter';
import { GqlThrottlerGuard } from '@/utils/GqlThrottlerGuard';
import { ParseCloudDefineService } from '@/opensignfile/ParseCloudDefineService';
import { LoggerMiddleware } from '@/middlewares/logger.middleware';
import { AccessTokenGuard } from './auth/guards/accessToken.guard';
import { EmailService } from '@/communication/email.service';
import { JwtService } from '@nestjs/jwt';

// const pubSub = new PubSub();

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // The time to live in milliseconds
        limit: 1000, // Maximum number of requests within the TTL
      },
    ]),
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  providers: [
    EmailService,
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
    { provide: APP_GUARD, useClass: AccessTokenGuard }, //use the customed public decorator
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    JwtService,
    ParseCloudDefineService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
