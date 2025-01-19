import { IsDecimal, IsNotEmpty, IsString } from 'class-validator';

export class CreateNewJobDTO {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsDecimal()
  salary: number;
}
