import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserDTO } from './dtos/registerUser.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PasswordHashService } from 'src/common/services/password-Hash.service';
import { UserRole } from 'src/common/entity/userRole.entity';
import { LoginUserDTO } from './dtos/loginUser.dto';
import { AccessRefreshTokensService } from 'src/common/services/accessRefreshToken.service';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bull';
import { VerifyOTPEmailDTO } from './dtos/verifyEmailOTP';
import { Request } from 'express';
import { RefreshAccessTokenDTO } from './dtos/refreshAccessToken.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DecodedPayloadUser } from './entity/decodedPayload.entity';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private passwordHashService: PasswordHashService,
    private accessRefreshTokensService: AccessRefreshTokensService,
    private jwtService: JwtService,
    @InjectQueue('emailQueue') private emailQueue: Queue,
    private configService: ConfigService,
  ) {}
  async registerUser(registerUserData: RegisterUserDTO) {
    try {
      const { email, name, password, role } = registerUserData;

      if (!email || !name || !password || !role) {
        throw new BadRequestException('Please Provide all the required detail');
      }

      const isUserExist = await this.prismaService.user.findUnique({
        where: {
          email,
        },
      });

      if (isUserExist) {
        throw new BadRequestException('User already exist');
      }

      //   Hash the password :-
      const hashedPassword =
        await this.passwordHashService.hashThePassword(password);

      if (!hashedPassword) {
        throw new BadRequestException('Password could not be hash');
      }
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otp_expiry = new Date();
      otp_expiry.setMinutes(otp_expiry.getMinutes() + 10);
      const newUser = await this.prismaService.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: UserRole[role],
          otp,
          otp_expiry: otp_expiry,
        },
      });

      if (!newUser) {
        throw new InternalServerErrorException('New User could not be created');
      }

      // Add job to the emailQueue
      await this.emailQueue.add('sendotp', { email, otp });

      return {
        newUser,
      };
    } catch (error) {
      new InternalServerErrorException();
      throw error;
    }
  }

  async loginUser(loginUserData: LoginUserDTO) {
    try {
      const { email, password } = loginUserData;

      if (!email || !password) {
        throw new BadRequestException('Email and Password are required');
      }

      const isUserExist = await this.prismaService.user.findUnique({
        where: {
          email,
        },
      });

      if (!isUserExist) {
        throw new BadRequestException('User does not exist');
      }

      // Compare the password :-
      const isMatch = await this.passwordHashService.compareThePassword(
        password,
        isUserExist.password,
      );

      if (!isMatch) {
        throw new UnauthorizedException('Invalid Credentails');
      }

      // Generate 2 Tokens (Refresh Token as well as Access Token) :-
      const accessToken =
        await this.accessRefreshTokensService.generateAccessToken({
          userId: isUserExist.id,
          userEmail: isUserExist.email,
          userRole: isUserExist.role,
        });
      const refreshToken =
        await this.accessRefreshTokensService.generateRefreshToken({
          userId: isUserExist.id,
          userEmail: isUserExist.email,
          userRole: isUserExist.role,
        });

      if (!accessToken || !refreshToken) {
        throw new InternalServerErrorException('Tokens could not be generated');
      }

      // Store the refresh token in the DB also :-   it the refresh token already generate then update the token , otherwise create new entry
      const storedInDB = await this.prismaService.refreshToken.upsert({
        where: {
          userId: isUserExist.id,
        },
        update: {
          refresh_token: refreshToken,
        },
        create: {
          userId: isUserExist.id,
          refresh_token: refreshToken,
        },
      });

      if (!storedInDB) {
        throw new InternalServerErrorException();
      }

      return {
        isUserExist,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyEmailOTP(verfifyOTPData: VerifyOTPEmailDTO) {
    const { email, otp } = verfifyOTPData;

    try {
      const isUserExist = await this.prismaService.user.findUnique({
        where: {
          email,
        },
      });

      if (!isUserExist) {
        throw new BadRequestException('User does not exist');
      }

      // Verify OTP :-
      if (otp != isUserExist.otp) {
        throw new BadRequestException('OTP is invalid');
      }

      if (new Date().getTime() > isUserExist.otp_expiry.getTime()) {
        throw new BadRequestException('OTP is invalid due to time');
      }

      const updatedUser = await this.prismaService.user.update({
        where: {
          email,
        },
        data: {
          otp: null,
          otp_expiry: null,
          isVerified: true,
        },
      });

      if (!updatedUser) {
        throw new InternalServerErrorException(
          "User's email could not get verified",
        );
      }

      return {
        updatedUser,
      };
    } catch (error) {
      throw error;
    }
  }

  async getMyProfile(req: Request) {
    try {
      const userId = req['user']?.userId;

      if (!userId) {
        throw new UnauthorizedException('User Id is not provided');
      }

      const userDetails = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!userDetails) {
        throw new UnauthorizedException('User not found');
      }

      return {
        userDetails,
      };
    } catch (error) {
      throw error;
    }
  }

  async refreshAccessToken(refreshAccessTokenData: RefreshAccessTokenDTO) {
    try {
      const { refreshToken, userId } = refreshAccessTokenData;
      if (!refreshToken || !userId) {
        throw new BadRequestException('Please Provide the required Field Data');
      }

      // Check in the Db for the entry of refresh token for this userId :-

      const refreshTokenEntry =
        await this.prismaService.refreshToken.findUnique({
          where: {
            userId: +userId,
          },
        });

      if (!refreshTokenEntry) {
        throw new UnauthorizedException('Please Login First');
      }

      // Verify the refresh Token :-
      const decodedUserData: DecodedPayloadUser = this.jwtService.verify(
        refreshToken,
        {
          secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        },
      );

      if (decodedUserData?.userId != userId) {
        throw new UnauthorizedException('Please Login First');
      }

      // Generate New Access Token token :-

      const newAccessToken =
        await this.accessRefreshTokensService.generateAccessToken({
          userId,
          userEmail: decodedUserData.userEmail,
          userRole: decodedUserData.userRole,
        });

      if (!newAccessToken) {
        throw new InternalServerErrorException(
          'Access Token Could not get generated',
        );
      }

      return {
        newAccessToken,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name == 'JsonWebTokenError') {
          throw new UnauthorizedException('Invalid Token');
        }

        if (error.name == 'TokenExpiredError') {
          throw new HttpException('Need To Login Again!!!', 401);
        }
      }
      throw error;
    }
  }
}
