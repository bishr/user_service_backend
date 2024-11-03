import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from 'src/email/email.service';
//import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}
  //

  generateJwtToken(userId: string) {
    const payload = { userId };
    return this.jwtService.sign(payload);
  }

  async signUp(signUpDto: SignUpDto): Promise<void> {
    const { name, email, password } = signUpDto;

    const existing_user = await this.userModel.findOne({ email });

    if (existing_user) {
      throw new UnauthorizedException('email already used');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    //return this.generateJwtToken(String(user._id));
  }

  async login(loginDto: LoginDto): Promise<string> {
    const { email, password } = loginDto;

    const user = await this.getuserbyemail(email);

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.generateJwtToken(String(user._id));
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.getuserbyemail(email);
    await this.emailService.sendResetPasswordLink(user);
  }

  async resetPassword(
    token: string,
    password: string,
  ): Promise<void | PromiseLike<void>> {
    const email = await this.emailService.decodeConfirmationToken(token);

    const user = await this.getuserbyemail(email);

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.userModel.findByIdAndUpdate(
      user._id,
      {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        resetToken: '',
      },
      {
        new: true,
        runValidators: true,
      },
    );
    //console.log(result);
  }

  async getuserbyemail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }

    return user;
  }
}
