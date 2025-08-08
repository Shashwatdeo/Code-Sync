import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { SocketEvent } from "@/types/socket"
import { USER_STATUS } from "@/types/user"
import { ChangeEvent, FormEvent, useEffect, useRef } from "react"
import { toast } from "react-hot-toast"
import { useLocation, useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"
import logo from "@/assets/logo.svg"

const FormComponent = () => {
    const location = useLocation()
    const { currentUser, setCurrentUser, status, setStatus } = useAppContext()
    const { socket } = useSocket()

    const usernameRef = useRef<HTMLInputElement | null>(null)
    const navigate = useNavigate()

    const createNewRoomId = () => {
        setCurrentUser({ ...currentUser, roomId: uuidv4() })
        toast.success("Created a new Room Id")
        usernameRef.current?.focus()
    }

    const handleInputChanges = (e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name
        const value = e.target.value
        setCurrentUser({ ...currentUser, [name]: value })
    }

    const validateForm = () => {
        if (currentUser.username.trim().length === 0) {
            toast.error("Enter your username")
            return false
        } else if (currentUser.roomId.trim().length === 0) {
            toast.error("Enter a room id")
            return false
        } else if (currentUser.roomId.trim().length < 5) {
            toast.error("ROOM Id must be at least 5 characters long")
            return false
        } else if (currentUser.username.trim().length < 3) {
            toast.error("Username must be at least 3 characters long")
            return false
        }
        return true
    }

    const joinRoom = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (status === USER_STATUS.ATTEMPTING_JOIN) return
        if (!validateForm()) return
        toast.loading("Joining room...")
        setStatus(USER_STATUS.ATTEMPTING_JOIN)
        socket.emit(SocketEvent.JOIN_REQUEST, currentUser)
    }

    useEffect(() => {
        if (currentUser.roomId.length > 0) return
        if (location.state?.roomId) {
            setCurrentUser({ ...currentUser, roomId: location.state.roomId })
            if (currentUser.username.length === 0) {
                toast.success("Enter your username")
            }
        }
    }, [currentUser, location.state?.roomId, setCurrentUser])

    useEffect(() => {
        if (status === USER_STATUS.DISCONNECTED && !socket.connected) {
            socket.connect()
            return
        }

        const isRedirect = sessionStorage.getItem("redirect") || false

        if (status === USER_STATUS.JOINED && !isRedirect) {
            const username = currentUser.username
            sessionStorage.setItem("redirect", "true")
            navigate(`/editor/${currentUser.roomId}`, {
                state: {
                    username,
                },
            })
        } else if (status === USER_STATUS.JOINED && isRedirect) {
            sessionStorage.removeItem("redirect")
            setStatus(USER_STATUS.DISCONNECTED)
            socket.disconnect()
            socket.connect()
        }
    }, [currentUser, location.state?.redirect, navigate, setStatus, socket, status])

    return (
        <div className="glass-effect flex w-full max-w-[500px] flex-col items-center justify-center gap-6 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
            <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse-glow"></div>
                <img src={logo} alt="Logo" className="relative w-full"/>
            </div>
            
            <div className="w-full space-y-2">
                <h2 className="gradient-text text-center text-2xl font-bold mb-6">
                    Join Code Sync
                </h2>
                <p className="text-center text-white/70 mb-6">
                    Collaborate in real-time with your team
                </p>
            </div>
            
            <form onSubmit={joinRoom} className="flex w-full flex-col gap-4">
                <div className="relative">
                    <input
                        type="text"
                        name="roomId"
                        placeholder="Room Id"
                        className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-4 text-white placeholder-white/50 backdrop-blur-sm transition-all duration-300 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                        onChange={handleInputChanges}
                        value={currentUser.roomId}
                    />
                </div>
                <div className="relative">
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-4 text-white placeholder-white/50 backdrop-blur-sm transition-all duration-300 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                        onChange={handleInputChanges}
                        value={currentUser.username}
                        ref={usernameRef}
                    />
                </div>
                <button
                    type="submit"
                    className="mt-4 w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:from-purple-600 hover:to-pink-600 hover:shadow-lg hover:shadow-purple-500/25 glow-effect-hover"
                >
                    Join Room
                </button>
            </form>
            
            <button
                className="cursor-pointer select-none text-white/70 underline transition-all duration-300 hover:text-white hover:scale-105"
                onClick={createNewRoomId}
            >
                Generate Unique Room Id
            </button>
        </div>
    )
}

export default FormComponent
