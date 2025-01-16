import {
  BadRequestException,
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
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private passwordHashService: PasswordHashService,
    private accessRefreshTokensService: AccessRefreshTokensService,
    private jwtService: JwtService,
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

      const newUser = await this.prismaService.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: UserRole[role],
        },
      });

      if (!newUser) {
        throw new InternalServerErrorException('New User could not be created');
      }

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

      return {
        isUserExist,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }
}
