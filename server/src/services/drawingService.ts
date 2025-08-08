import { Drawing, IDrawing } from '../models/Drawing';

export class DrawingService {
  // Save drawing snapshot
  static async saveDrawing(roomId: string, snapshot: any): Promise<IDrawing> {
    try {
      const drawing = new Drawing({
        roomId,
        snapshot
      });
      return await drawing.save();
    } catch (error) {
      console.error('Error saving drawing:', error);
      throw error;
    }
  }

  // Get latest drawing for a room
  static async getLatestDrawing(roomId: string): Promise<IDrawing | null> {
    try {
      return await Drawing.findOne({ roomId })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      console.error('Error getting latest drawing:', error);
      throw error;
    }
  }

  // Get drawing history for a room
  static async getDrawingHistory(roomId: string, limit: number = 10): Promise<IDrawing[]> {
    try {
      return await Drawing.find({ roomId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();
    } catch (error) {
      console.error('Error getting drawing history:', error);
      throw error;
    }
  }

  // Delete drawings older than specified days
  static async cleanupOldDrawings(daysOld: number = 7): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
      await Drawing.deleteMany({
        createdAt: { $lt: cutoffDate }
      });
    } catch (error) {
      console.error('Error cleaning up old drawings:', error);
      throw error;
    }
  }

  // Delete all drawings for a room
  static async deleteDrawingsByRoom(roomId: string): Promise<void> {
    try {
      await Drawing.deleteMany({ roomId });
    } catch (error) {
      console.error('Error deleting drawings by room:', error);
      throw error;
    }
  }
} 