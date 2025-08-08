import { connectDB, disconnectDB } from '../config/database';
import { UserService } from '../services/userService';
import { RoomService } from '../services/roomService';
import { MessageService } from '../services/messageService';
import { DrawingService } from '../services/drawingService';

async function cleanupDatabase() {
  try {
    console.log('Starting database cleanup...');
    
    // Connect to MongoDB
    await connectDB();
    
    // Clean up offline users (older than 24 hours)
    console.log('Cleaning up offline users...');
    await UserService.cleanupOfflineUsers();
    
    // Clean up empty rooms (older than 7 days)
    console.log('Cleaning up empty rooms...');
    await RoomService.cleanupEmptyRooms();
    
    // Clean up old messages (older than 30 days)
    console.log('Cleaning up old messages...');
    await MessageService.cleanupOldMessages(30);
    
    // Clean up old drawings (older than 7 days)
    console.log('Cleaning up old drawings...');
    await DrawingService.cleanupOldDrawings(7);
    
    console.log('Database cleanup completed successfully!');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await disconnectDB();
  }
}

// Run cleanup if this script is executed directly
if (require.main === module) {
  cleanupDatabase();
}

export { cleanupDatabase }; 