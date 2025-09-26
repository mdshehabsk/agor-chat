import { Document } from 'mongoose';

export interface IMessage extends Document {
  uuid: string;
  senderName: string;
  receiverName: string;
  message: string;
  messageType: 'text' | 'image';
  createdAt: Date;
  updatedAt: Date;
}
