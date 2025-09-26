import { Connection } from 'mongoose';
import { messageSchema } from './message.schema';

export const MessageProvider = [
  {
    provide: 'MESSAGE_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('message', messageSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
