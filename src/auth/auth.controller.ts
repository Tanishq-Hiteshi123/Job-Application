import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SuccessMessage } from 'src/common/decorator/success-message.decorator';
import { AuthService } from './auth.service';
import { RegisterUserDTO } from './dtos/registerUser.dto';
import { LoginUserDTO } from './dtos/loginUser.dto';
import { VerifyOTPEmailDTO } from './dtos/verifyEmailOTP';
import { AuthenticationGuard } from './guards/authentication.guard';
import { Request } from 'express';
import { RefreshAccessTokenDTO } from './dtos/refreshAccessToken.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('registerUser')
  @SuccessMessage('User Registered SuccessFully')
  registerUser(@Body() registerUserDTO: RegisterUserDTO) {
    return this.authService.registerUser(registerUserDTO);
  }

  @Post('loginUser')
  @SuccessMessage('User Logged In SuccessFully')
  loginUser(@Body() loginUserDTO: LoginUserDTO) {
    return this.authService.loginUser(loginUserDTO);
  }

  @Post('verifyEmailOTP')
  @SuccessMessage('Email Verifed SuccessFully')
  verifyEmailOTP(@Body() verifyEmailOTPData: VerifyOTPEmailDTO) {
    return this.authService.verifyEmailOTP(verifyEmailOTPData);
  }

  @Get('getMe')
  @UseGuards(AuthenticationGuard)
  @SuccessMessage('Your Profile Details')
  getMyProfile(@Req() req: Request) {
    return this.authService.getMyProfile(req);
  }

  @Post('refreshAccessToken')
  @SuccessMessage('Access Token Refreshed SuccessFully')
  refreshAccessToken(@Body() refreshAccessTokenData: RefreshAccessTokenDTO) {
    return this.authService.refreshAccessToken(refreshAccessTokenData);
  }
}
