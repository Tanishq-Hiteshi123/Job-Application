import { IsEmail, IsString } from 'class-validator';

export class VerifyOTPEmailDTO {
  @IsEmail()
  email: string;

  @IsString()
  otp: string;
}
