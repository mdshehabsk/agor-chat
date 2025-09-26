import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('signin')
  async generateUserToken(@Body('username') username: string) {
    if (!username) {
      throw new HttpException('Username Required', HttpStatus.BAD_REQUEST);
    }
    const users = await this.appService.getUsers();
    const userFind = users?.find((entry) => entry?.username === username);
    if (!userFind) {
      throw new HttpException('Invalid Name', HttpStatus.NOT_FOUND);
    }
    const token = this.appService.generateUserToken(username);
    return { token, userId: userFind?.username };
  }

  @Get('users')
  async getUsers() {
    const users = await this.appService.getUsers();

    return users;
  }
  @Get('user/:username')
  async getUser(@Param('username') username: string) {
    const user = await this.appService?.getUser(username);
    return user;
  }
}
