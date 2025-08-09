import mongoose, { Schema, Document } from 'mongoose';

export interface IDrawing extends Document {
  roomId: string;
  snapshot: any;
  createdAt: Date;
  updatedAt: Date;
}

const DrawingSchema: Schema = new Schema({
  roomId: {
    type: String,
    required: true
  },
  snapshot: {
    type: Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
DrawingSchema.index({ roomId: 1, createdAt: -1 });

export const Drawing = mongoose.model<IDrawing>('Drawing', DrawingSchema); 