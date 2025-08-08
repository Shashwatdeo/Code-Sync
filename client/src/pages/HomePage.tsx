import illustration from "@/assets/illustration.svg"
import FormComponent from "@/components/forms/FormComponent"
// import Footer from "@/components/common/Footer";

function HomePage() {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center gap-16 overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 animate-float"></div>
                <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-1/2 left-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-green-400 to-blue-400 opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
            </div>
            
            <div className="relative my-12 flex h-full min-w-full flex-col items-center justify-evenly sm:flex-row sm:pt-0">
                <div className="flex w-full animate-fade-in-up justify-center sm:w-1/2 sm:pl-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl opacity-30 animate-pulse-glow"></div>
                        <img
                            src={illustration}
                            alt="Code Sync Illustration"
                            className="relative mx-auto w-[250px] sm:w-[400px] animate-float"
                        />
                    </div>
                </div>
                <div className="flex w-full items-center justify-center sm:w-1/2">
                    <div className="animate-slide-in">
                        <FormComponent />
                    </div>
                </div>
            </div>
            {/* <Footer /> */}
        </div>
    )
}

export default HomePage
