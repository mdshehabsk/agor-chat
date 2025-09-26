import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { IMessage } from './message.interface';

@Injectable()
export class MessageService {
  constructor(
    @Inject('MESSAGE_MODEL')
    private messageModel: Model<IMessage>,
  ) {}
  find({ username, myId }: { username: string; myId: string }) {
    return this.messageModel.find({
      $or: [
        { senderName: username, receiverName: myId },
        { senderName: myId, receiverName: username },
      ],
    });
  }

  async createMessage(body: {
    uuid: string;
    senderName: string;
    receiverName: string;
    message: string;
    messageType: 'text' | 'image';
  }) {
    const create = await this.messageModel?.create(body);
    return create;
  }
}
