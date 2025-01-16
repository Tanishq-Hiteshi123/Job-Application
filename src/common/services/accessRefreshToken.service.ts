import { JwtService } from '@nestjs/jwt';
import { userTokenPayloadType } from '../entity/userTokenPayload.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AccessRefreshTokensService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async generateAccessToken(userDetails: userTokenPayloadType) {
    return this.jwtService.sign(userDetails, {
      secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRES_IN'),
    });
  }
  async generateRefreshToken(userDetails: userTokenPayloadType) {
    return this.jwtService.sign(userDetails, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN'),
    });
  }
}
