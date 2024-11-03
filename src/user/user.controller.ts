import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from 'src/user/schemas/user.schema';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('/')
  @UseGuards(JwtAuthGuard)
  async getAllUser(): Promise<User[]> {
    return this.userService.findAll();
  }
}
