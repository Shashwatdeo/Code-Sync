import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  roomId: string;
  username: string;
  content: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema({
  roomId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
MessageSchema.index({ roomId: 1, timestamp: -1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema); 