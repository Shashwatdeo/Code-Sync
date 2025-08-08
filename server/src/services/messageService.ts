import { Message, IMessage } from '../models/Message';

export class MessageService {
  // Save message
  static async saveMessage(messageData: {
    roomId: string;
    username: string;
    content: string;
  }): Promise<IMessage> {
    try {
      const message = new Message({
        ...messageData,
        timestamp: new Date()
      });
      return await message.save();
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  // Get messages for a room
  static async getMessagesByRoom(roomId: string, limit: number = 50): Promise<IMessage[]> {
    try {
      return await Message.find({ roomId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .exec();
    } catch (error) {
      console.error('Error getting messages by room:', error);
      throw error;
    }
  }

  // Get recent messages for a room
  static async getRecentMessages(roomId: string, count: number = 20): Promise<IMessage[]> {
    try {
      return await Message.find({ roomId })
        .sort({ timestamp: -1 })
        .limit(count)
        .exec();
    } catch (error) {
      console.error('Error getting recent messages:', error);
      throw error;
    }
  }

  // Delete messages older than specified days
  static async cleanupOldMessages(daysOld: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
      await Message.deleteMany({
        timestamp: { $lt: cutoffDate }
      });
    } catch (error) {
      console.error('Error cleaning up old messages:', error);
      throw error;
    }
  }

  // Get message count for a room
  static async getMessageCount(roomId: string): Promise<number> {
    try {
      return await Message.countDocuments({ roomId });
    } catch (error) {
      console.error('Error getting message count:', error);
      throw error;
    }
  }
} 