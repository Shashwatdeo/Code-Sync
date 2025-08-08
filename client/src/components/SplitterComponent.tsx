import { useViews } from "@/context/ViewContext"
import useLocalStorage from "@/hooks/useLocalStorage"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import { ReactNode } from "react"
import Split from "react-split"

function SplitterComponent({ children }: { children: ReactNode }) {
    const { isSidebarOpen } = useViews()
    const { isMobile, width } = useWindowDimensions()
    const { setItem, getItem } = useLocalStorage()

    const getGutter = () => {
        const gutter = document.createElement("div")
        gutter.className = "h-full cursor-e-resizer hidden md:block"
        gutter.style.backgroundColor = "rgba(255, 255, 255, 0.2)"
        gutter.style.borderRadius = "4px"
        gutter.style.transition = "all 0.3s ease"
        return gutter
    }

    const getSizes = () => {
        if (isMobile) return [0, width]
        const savedSizes = getItem("editorSizes")
        let sizes = [35, 65]
        if (savedSizes) {
            sizes = JSON.parse(savedSizes)
        }
        return isSidebarOpen ? sizes : [0, width]
    }

    const getMinSizes = () => {
        if (isMobile) return [0, width]
        return isSidebarOpen ? [350, 350] : [50, 0]
    }

    const getMaxSizes = () => {
        if (isMobile) return [0, Infinity]
        return isSidebarOpen ? [Infinity, Infinity] : [0, Infinity]
    }

    const handleGutterDrag = (sizes: number[]) => {
        setItem("editorSizes", JSON.stringify(sizes))
    }

    const getGutterStyle = () => ({
        width: "8px",
        display: isSidebarOpen && !isMobile ? "block" : "none",
        background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.2))",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "4px",
        transition: "all 0.3s ease",
    })

    return (
        <Split
            sizes={getSizes()}
            minSize={getMinSizes()}
            gutter={getGutter}
            maxSize={getMaxSizes()}
            dragInterval={1}
            direction="horizontal"
            gutterAlign="center"
            cursor="e-resize"
            snapOffset={30}
            gutterStyle={getGutterStyle}
            onDrag={handleGutterDrag}
            className="flex h-screen min-h-screen max-w-full items-center justify-center overflow-hidden p-2"
        >
            {children}
        </Split>
    )
}

export default SplitterComponent
