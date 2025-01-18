import { Body, Controller, Post } from '@nestjs/common';
import { SuccessMessage } from 'src/common/decorator/success-message.decorator';
import { AuthService } from './auth.service';
import { RegisterUserDTO } from './dtos/registerUser.dto';
import { LoginUserDTO } from './dtos/loginUser.dto';
import { VerifyOTPEmailDTO } from './dtos/verifyEmailOTP';

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
}
