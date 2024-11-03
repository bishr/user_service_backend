import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';
import { ForgetpasswordDto } from './dto/forgetpassword.dto';
import { ResetpasswordDto } from './dto/resetpassword.dto';
import { Response } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('/signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    //console.log('in the controller');
    await this.authService.signUp(signUpDto);

    return { message: 'signup successfully' };
  }

  @Post('/forget-password')
  async forgetPassword(@Body() forgetpasswordDto: ForgetpasswordDto) {
    await this.authService.forgotPassword(forgetpasswordDto.email);
    return { message: 'Email sent to user for reset the password' };
  }

  @Post('/login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = await this.authService.login(loginDto);
    //console.log('Generated JWT Token:', token); // Log token

    const expireTime = 1000 * 8 * 60 * 60;
    //console.log('cookies exprires in:', expireTime);
    response.cookie('jwt', token, {
      httpOnly: true,
      secure: this.configService.get<boolean>('COOKIE_SECURE'), // Ensure false if testing locally
      sameSite: 'none', // Adjust as needed
      expires: new Date(Date.now() + expireTime),
    });

    //console.log(response);
    return { message: 'login in successfully' };
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPassword: ResetpasswordDto): Promise<void> {
    return this.authService.resetPassword(
      resetPassword.token,
      resetPassword.password,
    );
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.cookie('jwt', '', {
      httpOnly: true,
      secure: this.configService.get<boolean>('COOKIE_SECURE'), // use 'true' in production with HTTPS
      sameSite: 'none',
      expires: new Date(0), // Expire immediately
    });
    //console.log('in logout');
    return { message: 'Logged out successfully' };
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  getAuthStatus() {
    return { isAuthenticated: true };
  }
}
