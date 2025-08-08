import mongoose, { Schema, Document } from 'mongoose';

export interface IFile {
  id: string;
  name: string;
  type: 'file' | 'directory';
  content?: string;
  parentId?: string;
  children?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoom extends Document {
  roomId: string;
  name: string;
  description?: string;
  fileStructure: IFile[];
  activeFiles: string[];
  activeFile: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema: Schema = new Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['file', 'directory'],
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  parentId: {
    type: String,
    default: null
  },
  children: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const RoomSchema: Schema = new Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  fileStructure: {
    type: [FileSchema],
    default: []
  },
  activeFiles: {
    type: [String],
    default: []
  },
  activeFile: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
RoomSchema.index({ roomId: 1 });

export const Room = mongoose.model<IRoom>('Room', RoomSchema); 