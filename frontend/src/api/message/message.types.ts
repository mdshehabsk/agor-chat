export interface IMessage {
  uuid: string;
  senderName: string;
  receiverName: string;
  message: string;
  messageType: "text" | "image";
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateMessage
  extends Omit<IMessage, "createdAt" | "updatedAt"> {}
