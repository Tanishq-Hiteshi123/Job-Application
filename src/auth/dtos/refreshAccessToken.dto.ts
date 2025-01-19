import { IsNumber, IsString } from 'class-validator';

export class RefreshAccessTokenDTO {
  @IsString()
  refreshToken: string;
  @IsNumber()
  userId: number;
}
