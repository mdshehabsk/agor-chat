import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { MessageService } from './message.service';
import { type Request } from 'express';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('/:username')
  getMessages(@Param('username') username: string, @Req() req: Request) {
    const header = req.headers['authorization'] || '';
    return this.messageService.find({ username, myId: header });
  }

  @Post('/')
  create(
    @Body()
    body: {
      uuid: string;
      senderName: string;
      receiverName: string;
      message: string;
      messageType: 'text' | 'image';
    },
  ) {
    return this.messageService?.createMessage(body);
  }
}
