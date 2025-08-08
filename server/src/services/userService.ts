import { User, IUser } from '../models/User';

export class UserService {
  // Create or update user
  static async createOrUpdateUser(userData: Partial<IUser>): Promise<IUser> {
    try {
      const user = await User.findOneAndUpdate(
        { socketId: userData.socketId },
        userData,
        { upsert: true, new: true }
      );
      return user as IUser;
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw error;
    }
  }

  // Get user by socket ID
  static async getUserBySocketId(socketId: string): Promise<IUser | null> {
    try {
      return await User.findOne({ socketId });
    } catch (error) {
      console.error('Error getting user by socket ID:', error);
      throw error;
    }
  }

  // Get all users in a room
  static async getUsersInRoom(roomId: string): Promise<IUser[]> {
    try {
      return await User.find({ roomId }).sort({ createdAt: 1 });
    } catch (error) {
      console.error('Error getting users in room:', error);
      throw error;
    }
  }

  // Update user status
  static async updateUserStatus(socketId: string, status: 'online' | 'offline'): Promise<IUser | null> {
    try {
      const user = await User.findOneAndUpdate(
        { socketId },
        { status, lastSeen: new Date() },
        { new: true }
      );
      return user;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  // Update user typing status
  static async updateUserTyping(socketId: string, typing: boolean, cursorPosition?: number): Promise<IUser | null> {
    try {
      const updateData: any = { typing };
      if (cursorPosition !== undefined) {
        updateData.cursorPosition = cursorPosition;
      }
      const user = await User.findOneAndUpdate(
        { socketId },
        updateData,
        { new: true }
      );
      return user;
    } catch (error) {
      console.error('Error updating user typing status:', error);
      throw error;
    }
  }

  // Update user's current file
  static async updateUserCurrentFile(socketId: string, currentFile: string | null): Promise<IUser | null> {
    try {
      const user = await User.findOneAndUpdate(
        { socketId },
        { currentFile },
        { new: true }
      );
      return user;
    } catch (error) {
      console.error('Error updating user current file:', error);
      throw error;
    }
  }

  // Remove user by socket ID
  static async removeUserBySocketId(socketId: string): Promise<void> {
    try {
      await User.deleteOne({ socketId });
    } catch (error) {
      console.error('Error removing user:', error);
      throw error;
    }
  }

  // Clean up offline users (older than 24 hours)
  static async cleanupOfflineUsers(): Promise<void> {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      await User.deleteMany({
        status: 'offline',
        lastSeen: { $lt: twentyFourHoursAgo }
      });
    } catch (error) {
      console.error('Error cleaning up offline users:', error);
      throw error;
    }
  }
} 