import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './common/middleware/Logger.middleware';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import helmet from 'helmet';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './email/email.module';
import { BullModule } from '@nestjs/bull';
import { EmployeerModule } from './employeer/employeer.module';
import { APP_GUARD } from '@nestjs/core';
import { RoleGuard } from './auth/guards/role.guard';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    BullModule.forRoot({
      redis: {
        port: 6379,
        host: 'localhost',
      },
    }),
    EmailModule,
    EmployeerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware, helmet()).forRoutes('/');
  }
}
