import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  getHello() {
    return {
      msg: 'hello world',
    };
  }
  @Get('users')
  async getUsers() {
    const users = this.appService?.getUsers();
    return users;
  }

  @Post('signin')
  async signin(@Body('username') username: string) {
    if (!username) {
      throw new HttpException('Username Required', HttpStatus.BAD_REQUEST);
    }
    const users = await this.getUsers();

    const foundUser = users?.find((user) => user?.username === username);
    if (!foundUser) {
      throw new HttpException('Bad Credentials', HttpStatus.BAD_REQUEST);
    }
    const token = this.appService.generateUserToken(username);
    return {
      token,
      userId: username,
    };
  }
  @Post('signup')
  async signup(@Body() body: { username: string; password: string }) {
    const user = await this.appService.signupUser(body);
    return user;
  }
}
