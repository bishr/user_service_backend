import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetpasswordDto {
  @IsNotEmpty()
  @IsString()
  readonly token: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  readonly password: string;
}
