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

  @Post('signin')
  signin(@Body('username') username: string) {
    if (!username) {
      throw new HttpException('Username Required', HttpStatus.BAD_REQUEST);
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
