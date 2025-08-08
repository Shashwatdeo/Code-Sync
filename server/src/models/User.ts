import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  roomId: string;
  status: 'online' | 'offline';
  cursorPosition: number;
  typing: boolean;
  currentFile: string | null;
  socketId: string;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  roomId: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['online', 'offline'],
    default: 'online'
  },
  cursorPosition: {
    type: Number,
    default: 0
  },
  typing: {
    type: Boolean,
    default: false
  },
  currentFile: {
    type: String,
    default: null
  },
  socketId: {
    type: String,
    required: true,
    unique: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
UserSchema.index({ roomId: 1, status: 1 });
UserSchema.index({ socketId: 1 });

export const User = mongoose.model<IUser>('User', UserSchema); 