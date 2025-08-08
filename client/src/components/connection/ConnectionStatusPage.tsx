import { useAppContext } from "@/context/AppContext"
import { USER_STATUS } from "@/types/user"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

function ConnectionStatusPage() {
    const { status, setStatus } = useAppContext()
    const navigate = useNavigate()

    useEffect(() => {
        if (status === USER_STATUS.DISCONNECTED) {
            navigate("/")
        }
    }, [status, navigate, setStatus])

    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="glass-effect flex flex-col items-center justify-center rounded-2xl p-8 shadow-2xl">
                <div className="mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse-glow"></div>
                        <div className="relative h-16 w-16 animate-spin rounded-full border-4 border-white/20 border-t-purple-500"></div>
                    </div>
                </div>
                <h2 className="gradient-text text-2xl font-bold mb-2">
                    Connection Failed
                </h2>
                <p className="text-center text-white/70 mb-4">
                    Unable to connect to the server. Please check your internet connection.
                </p>
                <button
                    onClick={() => navigate("/")}
                    className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-white font-semibold transition-all duration-300 hover:from-purple-600 hover:to-pink-600 hover:shadow-lg hover:shadow-purple-500/25 glow-effect-hover"
                >
                    Try Again
                </button>
            </div>
        </div>
    )
}

export default ConnectionStatusPage
