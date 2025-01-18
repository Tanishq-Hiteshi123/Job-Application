import { IsString } from 'class-validator';

export class SendOTPOnEmailDTO {
  @IsString()
  email: string;

  @IsString()
  otp: string;
}
