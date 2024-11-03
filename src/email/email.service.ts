import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/auth/schemas/user.schema';
import * as nodemailer from 'nodemailer';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  transporter: any;
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: configService.get<string>('EMAIL_HOST'),
      port: 465,
      secure: true,
      auth: {
        user: configService.get('EMAIL_USER'),
        pass: configService.get('EMAIL_PASSWORD'),
      },
    });
  }
  async sendResetPasswordLink(user: User): Promise<void> {
    const email = user.email;

    const token = this.jwtService.sign({ email: email });

    await this.userModel.findByIdAndUpdate(
      user._id,
      {
        name: user.name,
        email: user.email,
        password: user.password,
        resetToken: token,
      },
      {
        new: true,
        runValidators: true,
      },
    );
    //console.log(result);
    const url = `${this.configService.get(
      'EMAIL_RESET_PASSWORD_URL',
    )}?token=${token}`;

    const text = `Hi, \nTo reset your password, click here: ${url}`;

    return this.sendMail({
      to: email,
      subject: 'Reset password',
      text: text,
    });
  }

  private async sendMail(options: any) {
    //console.log(options);
    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_USER'), // sender address
      to: options.to, // list of receivers
      subject: options.subject, // Subject line
      text: options.text, // plain text body
      html: `<b>${options.text}</b>`, // html body
    });

    //console.log('Message sent: %s', info);
  }

  public async decodeConfirmationToken(token: string): Promise<string> {
    try {
      const payload = await this.jwtService.verify(token);

      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }
      throw new BadRequestException();
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('Email confirmation token expired');
      }
      throw new BadRequestException('Bad confirmation token');
    }
  }
}
