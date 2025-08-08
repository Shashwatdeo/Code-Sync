# MongoDB Integration for Code-Sync

This guide explains how to set up and use MongoDB with the Code-Sync real-time code editor project.

## Overview

The project now uses MongoDB for persistent storage of:
- **Users**: Online/offline status, cursor positions, typing status
- **Rooms**: File structures, active files, room metadata
- **Messages**: Chat messages with timestamps
- **Drawings**: Drawing snapshots and history

## Prerequisites

1. **MongoDB**: Install MongoDB locally or use MongoDB Atlas (cloud)
2. **Node.js**: Version 16 or higher
3. **Docker**: (Optional) For containerized setup

## Setup Options

### Option 1: Local MongoDB Installation

1. **Install MongoDB Community Edition**:
   - [Windows](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/)
   - [macOS](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/)
   - [Linux](https://docs.mongodb.com/manual/administration/install-on-linux/)

2. **Start MongoDB service**:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

3. **Create environment file**:
   ```bash
   cd server
   cp .env.example .env
   ```

4. **Configure MongoDB URI** in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/code-sync
   ```

### Option 2: Docker Setup (Recommended)

1. **Start all services with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

   This will start:
   - MongoDB on port 27017
   - Server on port 3000
   - Client on port 5173

2. **Environment is automatically configured** for Docker setup.

### Option 3: MongoDB Atlas (Cloud)

1. **Create MongoDB Atlas account**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster

2. **Get connection string**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

3. **Update environment file**:
   ```bash
   cd server
   cp .env.example .env
   ```

4. **Configure MongoDB URI** in `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/code-sync?retryWrites=true&w=majority
   ```

## Installation

1. **Install dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Start the server**:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Database Schema

### Users Collection
```javascript
{
  username: String,
  roomId: String,
  status: "online" | "offline",
  cursorPosition: Number,
  typing: Boolean,
  currentFile: String | null,
  socketId: String,
  lastSeen: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Rooms Collection
```javascript
{
  roomId: String,
  name: String,
  description: String,
  fileStructure: [{
    id: String,
    name: String,
    type: "file" | "directory",
    content: String,
    parentId: String,
    children: [String],
    createdAt: Date,
    updatedAt: Date
  }],
  activeFiles: [String],
  activeFile: String | null,
  createdAt: Date,
  updatedAt: Date
}
```

### Messages Collection
```javascript
{
  roomId: String,
  username: String,
  content: String,
  timestamp: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Drawings Collection
```javascript
{
  roomId: String,
  snapshot: Mixed,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

The server now provides REST API endpoints for data retrieval:

### Get Users in Room
```
GET /api/rooms/:roomId/users
```

### Get Messages in Room
```
GET /api/rooms/:roomId/messages?limit=50
```

### Get Drawing History
```
GET /api/rooms/:roomId/drawings?limit=10
```

## Database Maintenance

### Automatic Cleanup

The system includes automatic cleanup features:

- **Offline users**: Removed after 24 hours
- **Empty rooms**: Removed after 7 days
- **Old messages**: Removed after 30 days
- **Old drawings**: Removed after 7 days

### Manual Cleanup

Run the cleanup script manually:

```bash
cd server
npm run cleanup
```

## Monitoring

### Check MongoDB Status

```bash
# Connect to MongoDB shell
mongosh

# Switch to database
use code-sync

# Check collections
show collections

# Check document counts
db.users.countDocuments()
db.rooms.countDocuments()
db.messages.countDocuments()
db.drawings.countDocuments()
```

### Performance Monitoring

The database includes optimized indexes for:
- User queries by room and status
- Message queries by room and timestamp
- Drawing queries by room and creation date
- Room queries by ID and update time

## Troubleshooting

### Connection Issues

1. **Check MongoDB service**:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl status mongod
   ```

2. **Verify connection string**:
   - Check `.env` file
   - Ensure MongoDB is running on correct port
   - Verify credentials for Atlas

### Data Issues

1. **Reset database**:
   ```bash
   # Connect to MongoDB
   mongosh
   
   # Switch to database
   use code-sync
   
   # Drop all collections
   db.users.drop()
   db.rooms.drop()
   db.messages.drop()
   db.drawings.drop()
   ```

2. **Check logs**:
   ```bash
   # Server logs
   npm run dev
   
   # Docker logs
   docker-compose logs server
   ```

## Migration from In-Memory Storage

The project has been migrated from in-memory storage to MongoDB. Key changes:

1. **Persistent data**: All data is now stored in MongoDB
2. **Scalability**: Can handle multiple server instances
3. **Data recovery**: Data survives server restarts
4. **Analytics**: Can query historical data

## Security Considerations

1. **Environment variables**: Never commit `.env` files
2. **MongoDB authentication**: Use strong passwords
3. **Network security**: Restrict MongoDB access
4. **Data backup**: Regular backups recommended

## Performance Tips

1. **Indexes**: Already configured for optimal performance
2. **Connection pooling**: Mongoose handles this automatically
3. **Data cleanup**: Regular cleanup prevents bloat
4. **Monitoring**: Use MongoDB Compass for visual monitoring

## Next Steps

1. **Set up monitoring**: Use MongoDB Compass or Atlas
2. **Configure backups**: Set up automated backups
3. **Scale horizontally**: Add more server instances
4. **Add analytics**: Query historical data for insights 