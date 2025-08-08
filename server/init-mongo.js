// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

db = db.getSiblingDB('code-sync');

// Create collections if they don't exist
db.createCollection('users');
db.createCollection('rooms');
db.createCollection('messages');
db.createCollection('drawings');

// Create indexes for better performance
db.users.createIndex({ "roomId": 1, "status": 1 });
db.users.createIndex({ "socketId": 1 });
db.users.createIndex({ "lastSeen": 1 });

db.rooms.createIndex({ "roomId": 1 });
db.rooms.createIndex({ "updatedAt": 1 });

db.messages.createIndex({ "roomId": 1, "timestamp": -1 });
db.messages.createIndex({ "timestamp": 1 });

db.drawings.createIndex({ "roomId": 1, "createdAt": -1 });
db.drawings.createIndex({ "createdAt": 1 });

print('MongoDB initialization completed successfully!'); 