import * as mongoose from 'mongoose';

export const messageSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    receiverName: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'image'],
      required: true,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  },
);
