import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { DecodedPayloadUser } from '../entity/decodedPayload.entity';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const request = context.switchToHttp().getRequest();

      const token = this.getAccessToken(request);

      console.log(token);

      const decodedData: DecodedPayloadUser = this.jwtService.verify(token, {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      });

      if (!decodedData) {
        throw new UnauthorizedException();
      }

      console.log(decodedData);

      request['user'] = decodedData;

      console.log('Req User ', request['user']);

      return true;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name == 'JsonWebTokenError') {
          throw new UnauthorizedException('Invalid Token');
        }

        if (error.name == 'TokenExpiredError') {
          throw new HttpException('Access Token is expired', 403);
        }
      }
      throw error;
    }
  }

  getAccessToken(req: Request) {
    return req.headers['authorization']?.split(' ')[1];
  }
}
