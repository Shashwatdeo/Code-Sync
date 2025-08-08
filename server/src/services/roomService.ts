import { Room, IRoom, IFile } from '../models/Room';

export class RoomService {
  // Create or get room
  static async createOrGetRoom(roomId: string, name: string, description?: string): Promise<IRoom> {
    try {
      let room = await Room.findOne({ roomId });
      if (!room) {
        room = new Room({
          roomId,
          name,
          description,
          fileStructure: [],
          activeFiles: [],
          activeFile: null
        });
        await room.save();
      }
      return room;
    } catch (error) {
      console.error('Error creating/getting room:', error);
      throw error;
    }
  }

  // Get room by ID
  static async getRoomById(roomId: string): Promise<IRoom | null> {
    try {
      return await Room.findOne({ roomId });
    } catch (error) {
      console.error('Error getting room by ID:', error);
      throw error;
    }
  }

  // Update file structure
  static async updateFileStructure(roomId: string, fileStructure: IFile[]): Promise<IRoom | null> {
    try {
      const room = await Room.findOneAndUpdate(
        { roomId },
        { fileStructure },
        { new: true }
      );
      return room;
    } catch (error) {
      console.error('Error updating file structure:', error);
      throw error;
    }
  }

  // Update active files
  static async updateActiveFiles(roomId: string, activeFiles: string[], activeFile: string | null): Promise<IRoom | null> {
    try {
      const room = await Room.findOneAndUpdate(
        { roomId },
        { activeFiles, activeFile },
        { new: true }
      );
      return room;
    } catch (error) {
      console.error('Error updating active files:', error);
      throw error;
    }
  }

  // Add file to structure
  static async addFile(roomId: string, file: IFile): Promise<IRoom | null> {
    try {
      const room = await Room.findOneAndUpdate(
        { roomId },
        { $push: { fileStructure: file } },
        { new: true }
      );
      return room;
    } catch (error) {
      console.error('Error adding file:', error);
      throw error;
    }
  }

  // Update file in structure
  static async updateFile(roomId: string, fileId: string, updates: Partial<IFile>): Promise<IRoom | null> {
    try {
      const room = await Room.findOneAndUpdate(
        { roomId, 'fileStructure.id': fileId },
        { $set: { 'fileStructure.$': { ...updates, id: fileId } } },
        { new: true }
      );
      return room;
    } catch (error) {
      console.error('Error updating file:', error);
      throw error;
    }
  }

  // Remove file from structure
  static async removeFile(roomId: string, fileId: string): Promise<IRoom | null> {
    try {
      const room = await Room.findOneAndUpdate(
        { roomId },
        { $pull: { fileStructure: { id: fileId } } },
        { new: true }
      );
      return room;
    } catch (error) {
      console.error('Error removing file:', error);
      throw error;
    }
  }

  // Get file by ID
  static async getFileById(roomId: string, fileId: string): Promise<IFile | null> {
    try {
      const room = await Room.findOne({ roomId, 'fileStructure.id': fileId });
      if (room) {
        return room.fileStructure.find((file: IFile) => file.id === fileId) || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting file by ID:', error);
      throw error;
    }
  }

  // Clean up empty rooms (older than 7 days)
  static async cleanupEmptyRooms(): Promise<void> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      await Room.deleteMany({
        updatedAt: { $lt: sevenDaysAgo },
        $or: [
          { fileStructure: { $size: 0 } },
          { fileStructure: { $exists: false } }
        ]
      });
    } catch (error) {
      console.error('Error cleaning up empty rooms:', error);
      throw error;
    }
  }
} 