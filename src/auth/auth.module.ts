import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PasswordHashService } from 'src/common/services/password-Hash.service';
import { AccessRefreshTokensService } from 'src/common/services/accessRefreshToken.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('REFRESH_TOKEN_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('REFRESH_TOKEN_EXPIRES_IN'),
        },
      }),
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('ACCESS_TOKEN_EXPIRES_IN'),
        },
      }),
    }),

    EmailModule,
  ],
  providers: [
    AuthService,
    {
      provide: PrismaService,
      useClass: PrismaService,
    },
    {
      provide: PasswordHashService,
      useClass: PasswordHashService,
    },
    {
      provide: AccessRefreshTokensService,
      useClass: AccessRefreshTokensService,
    },
  ],
  controllers: [AuthController],
  exports: [AccessRefreshTokensService],
})
export class AuthModule {}
