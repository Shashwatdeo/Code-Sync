import express, { Response, Request } from "express"
import dotenv from "dotenv"
import http from "http"
import cors from "cors"
import { SocketEvent, SocketId } from "./types/socket"
import { USER_CONNECTION_STATUS, User } from "./types/user"
import { Server } from "socket.io"
import path from "path"
import { connectDB } from "./config/database"
import { UserService } from "./services/userService"
import { RoomService } from "./services/roomService"
import { MessageService } from "./services/messageService"
import { DrawingService } from "./services/drawingService"

dotenv.config()

const app = express()

app.use(express.json())

app.use(cors())

app.use(express.static(path.join(__dirname, "public"))) // Serve static files

const server = http.createServer(app)
const io = new Server(server, {
	cors: {
		origin: "*",
	},
	maxHttpBufferSize: 1e8,
	pingTimeout: 60000,
})

// Connect to MongoDB
connectDB()

// Function to get all users in a room
async function getUsersInRoom(roomId: string) {
	try {
		return await UserService.getUsersInRoom(roomId)
	} catch (error) {
		console.error("Error getting users in room:", error)
		return []
	}
}

// Function to get room id by socket id
async function getRoomId(socketId: SocketId): Promise<string | null> {
	try {
		const user = await UserService.getUserBySocketId(socketId)
		return user?.roomId || null
	} catch (error) {
		console.error("Error getting room ID:", error)
		return null
	}
}

async function getUserBySocketId(socketId: SocketId) {
	try {
		return await UserService.getUserBySocketId(socketId)
	} catch (error) {
		console.error("Error getting user by socket ID:", error)
		return null
	}
}

io.on("connection", (socket) => {
	// Handle user actions
	socket.on(SocketEvent.JOIN_REQUEST, async ({ roomId, username }) => {
		try {
			// Check if username exists in the room
			const usersInRoom = await getUsersInRoom(roomId)
			const isUsernameExist = usersInRoom.filter((u) => u.username === username)
			
			if (isUsernameExist.length > 0) {
				io.to(socket.id).emit(SocketEvent.USERNAME_EXISTS)
				return
			}

			// Create or get room
			await RoomService.createOrGetRoom(roomId, `Room ${roomId}`, `Collaborative coding room`)

			const user = {
				username,
				roomId,
				status: USER_CONNECTION_STATUS.ONLINE,
				cursorPosition: 0,
				typing: false,
				socketId: socket.id,
				currentFile: null,
			}

			// Save user to database
			await UserService.createOrUpdateUser(user)

			socket.join(roomId)
			socket.broadcast.to(roomId).emit(SocketEvent.USER_JOINED, { user })
			
			const users = await getUsersInRoom(roomId)
			io.to(socket.id).emit(SocketEvent.JOIN_ACCEPTED, { user, users })
		} catch (error) {
			console.error("Error handling join request:", error)
			io.to(socket.id).emit("error", { message: "Failed to join room" })
		}
	})

	socket.on("disconnecting", async () => {
		try {
			const user = await getUserBySocketId(socket.id)
			if (!user) return
			
			const roomId = user.roomId
			socket.broadcast
				.to(roomId)
				.emit(SocketEvent.USER_DISCONNECTED, { user })
			
			// Update user status to offline
			await UserService.updateUserStatus(socket.id, 'offline')
			socket.leave(roomId)
		} catch (error) {
			console.error("Error handling disconnection:", error)
		}
	})

	// Handle file actions
	socket.on(
		SocketEvent.SYNC_FILE_STRUCTURE,
		async ({ fileStructure, openFiles, activeFile, socketId }) => {
			try {
				const user = await getUserBySocketId(socketId)
				if (!user) return

				// Update room's file structure
				await RoomService.updateFileStructure(user.roomId, fileStructure)
				await RoomService.updateActiveFiles(user.roomId, openFiles, activeFile)

				io.to(socketId).emit(SocketEvent.SYNC_FILE_STRUCTURE, {
					fileStructure,
					openFiles,
					activeFile,
				})
			} catch (error) {
				console.error("Error syncing file structure:", error)
			}
		}
	)

	socket.on(
		SocketEvent.DIRECTORY_CREATED,
		async ({ parentDirId, newDirectory }) => {
			try {
				const roomId = await getRoomId(socket.id)
				if (!roomId) return
				
				// Add directory to room's file structure
				await RoomService.addFile(roomId, newDirectory)
				
				socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_CREATED, {
					parentDirId,
					newDirectory,
				})
			} catch (error) {
				console.error("Error creating directory:", error)
			}
		}
	)

	socket.on(SocketEvent.DIRECTORY_UPDATED, async ({ dirId, children }) => {
		try {
			const roomId = await getRoomId(socket.id)
			if (!roomId) return
			
			// Update directory in room's file structure
			await RoomService.updateFile(roomId, dirId, { children })
			
			socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_UPDATED, {
				dirId,
				children,
			})
		} catch (error) {
			console.error("Error updating directory:", error)
		}
	})

	socket.on(SocketEvent.DIRECTORY_RENAMED, async ({ dirId, newName }) => {
		try {
			const roomId = await getRoomId(socket.id)
			if (!roomId) return
			
			// Update directory name in room's file structure
			await RoomService.updateFile(roomId, dirId, { name: newName })
			
			socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_RENAMED, {
				dirId,
				newName,
			})
		} catch (error) {
			console.error("Error renaming directory:", error)
		}
	})

	socket.on(SocketEvent.DIRECTORY_DELETED, async ({ dirId }) => {
		try {
			const roomId = await getRoomId(socket.id)
			if (!roomId) return
			
			// Remove directory from room's file structure
			await RoomService.removeFile(roomId, dirId)
			
			socket.broadcast
				.to(roomId)
				.emit(SocketEvent.DIRECTORY_DELETED, { dirId })
		} catch (error) {
			console.error("Error deleting directory:", error)
		}
	})

	socket.on(SocketEvent.FILE_CREATED, async ({ parentDirId, newFile }) => {
		try {
			const roomId = await getRoomId(socket.id)
			if (!roomId) return
			
			// Add file to room's file structure
			await RoomService.addFile(roomId, newFile)
			
			socket.broadcast
				.to(roomId)
				.emit(SocketEvent.FILE_CREATED, { parentDirId, newFile })
		} catch (error) {
			console.error("Error creating file:", error)
		}
	})

	socket.on(SocketEvent.FILE_UPDATED, async ({ fileId, newContent }) => {
		try {
			const roomId = await getRoomId(socket.id)
			if (!roomId) return
			
			// Update file content in room's file structure
			await RoomService.updateFile(roomId, fileId, { content: newContent })
			
			socket.broadcast.to(roomId).emit(SocketEvent.FILE_UPDATED, {
				fileId,
				newContent,
			})
		} catch (error) {
			console.error("Error updating file:", error)
		}
	})

	socket.on(SocketEvent.FILE_RENAMED, async ({ fileId, newName }) => {
		try {
			const roomId = await getRoomId(socket.id)
			if (!roomId) return
			
			// Update file name in room's file structure
			await RoomService.updateFile(roomId, fileId, { name: newName })
			
			socket.broadcast.to(roomId).emit(SocketEvent.FILE_RENAMED, {
				fileId,
				newName,
			})
		} catch (error) {
			console.error("Error renaming file:", error)
		}
	})

	socket.on(SocketEvent.FILE_DELETED, async ({ fileId }) => {
		try {
			const roomId = await getRoomId(socket.id)
			if (!roomId) return
			
			// Remove file from room's file structure
			await RoomService.removeFile(roomId, fileId)
			
			socket.broadcast.to(roomId).emit(SocketEvent.FILE_DELETED, { fileId })
		} catch (error) {
			console.error("Error deleting file:", error)
		}
	})

	// Handle user status
	socket.on(SocketEvent.USER_OFFLINE, async ({ socketId }) => {
		try {
			await UserService.updateUserStatus(socketId, 'offline')
			const roomId = await getRoomId(socketId)
			if (!roomId) return
			socket.broadcast.to(roomId).emit(SocketEvent.USER_OFFLINE, { socketId })
		} catch (error) {
			console.error("Error setting user offline:", error)
		}
	})

	socket.on(SocketEvent.USER_ONLINE, async ({ socketId }) => {
		try {
			await UserService.updateUserStatus(socketId, 'online')
			const roomId = await getRoomId(socketId)
			if (!roomId) return
			socket.broadcast.to(roomId).emit(SocketEvent.USER_ONLINE, { socketId })
		} catch (error) {
			console.error("Error setting user online:", error)
		}
	})

	// Handle chat actions
	socket.on(SocketEvent.SEND_MESSAGE, async ({ message }) => {
		try {
			const roomId = await getRoomId(socket.id)
			if (!roomId) return
			
			// Validate message structure
			if (!message || !message.message || !message.username) {
				console.error("Invalid message structure:", message)
				return
			}
			
			// Save message to database
			await MessageService.saveMessage({
				roomId,
				username: message.username,
				content: message.message
			})
			
			socket.broadcast
				.to(roomId)
				.emit(SocketEvent.RECEIVE_MESSAGE, { message })
		} catch (error) {
			console.error("Error sending message:", error)
		}
	})

	// Handle cursor position
	socket.on(SocketEvent.TYPING_START, async ({ cursorPosition }) => {
		try {
			await UserService.updateUserTyping(socket.id, true, cursorPosition)
			const user = await getUserBySocketId(socket.id)
			if (!user) return
			const roomId = user.roomId
			socket.broadcast.to(roomId).emit(SocketEvent.TYPING_START, { user })
		} catch (error) {
			console.error("Error starting typing:", error)
		}
	})

	socket.on(SocketEvent.TYPING_PAUSE, async () => {
		try {
			await UserService.updateUserTyping(socket.id, false)
			const user = await getUserBySocketId(socket.id)
			if (!user) return
			const roomId = user.roomId
			socket.broadcast.to(roomId).emit(SocketEvent.TYPING_PAUSE, { user })
		} catch (error) {
			console.error("Error pausing typing:", error)
		}
	})

	socket.on(SocketEvent.REQUEST_DRAWING, async () => {
		try {
			const roomId = await getRoomId(socket.id)
			if (!roomId) return
			socket.broadcast
				.to(roomId)
				.emit(SocketEvent.REQUEST_DRAWING, { socketId: socket.id })
		} catch (error) {
			console.error("Error requesting drawing:", error)
		}
	})

	socket.on(SocketEvent.SYNC_DRAWING, async ({ drawingData, socketId }) => {
		try {
			const user = await getUserBySocketId(socketId)
			if (!user) return
			
			// Save drawing to database
			await DrawingService.saveDrawing(user.roomId, drawingData)
			
			socket.broadcast
				.to(socketId)
				.emit(SocketEvent.SYNC_DRAWING, { drawingData })
		} catch (error) {
			console.error("Error syncing drawing:", error)
		}
	})

	socket.on(SocketEvent.DRAWING_UPDATE, async ({ snapshot }) => {
		try {
			const roomId = await getRoomId(socket.id)
			if (!roomId) return
			
			// Save drawing snapshot to database
			await DrawingService.saveDrawing(roomId, snapshot)
			
			socket.broadcast.to(roomId).emit(SocketEvent.DRAWING_UPDATE, {
				snapshot,
			})
		} catch (error) {
			console.error("Error updating drawing:", error)
		}
	})
})

const PORT = process.env.PORT || 3000

app.get("/", (req: Request, res: Response) => {
	// Send the index.html file
	res.sendFile(path.join(__dirname, "..", "public", "index.html"))
})

// Add API endpoints for data retrieval
app.get("/api/rooms/:roomId/users", async (req: Request, res: Response) => {
	try {
		const { roomId } = req.params
		const users = await UserService.getUsersInRoom(roomId)
		res.json(users)
	} catch (error) {
		console.error("Error getting users:", error)
		res.status(500).json({ error: "Failed to get users" })
	}
})

app.get("/api/rooms/:roomId/messages", async (req: Request, res: Response) => {
	try {
		const { roomId } = req.params
		const { limit = 50 } = req.query
		const messages = await MessageService.getMessagesByRoom(roomId, Number(limit))
		res.json(messages)
	} catch (error) {
		console.error("Error getting messages:", error)
		res.status(500).json({ error: "Failed to get messages" })
	}
})

app.get("/api/rooms/:roomId/drawings", async (req: Request, res: Response) => {
	try {
		const { roomId } = req.params
		const { limit = 10 } = req.query
		const drawings = await DrawingService.getDrawingHistory(roomId, Number(limit))
		res.json(drawings)
	} catch (error) {
		console.error("Error getting drawings:", error)
		res.status(500).json({ error: "Failed to get drawings" })
	}
})

server.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`)
})
