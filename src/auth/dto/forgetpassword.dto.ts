import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgetpasswordDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please enter correct email' })
  readonly email: string;
}
