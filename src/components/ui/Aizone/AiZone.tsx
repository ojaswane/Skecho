const AiZoneGradient = () => {
    return (
        // Add absolute inset-0 to ensure it fills the parent's width/height
        <div className="ai-zone-wrapper absolute inset-0 w-full h-full overflow-hidden rounded-[20px]">
            <div className="gradient-container absolute inset-0 w-full h-full">
                <div className="blob blob-1 absolute w-[100%] h-[100%] rounded-full opacity-60 blur-[60px] bg-purple-500 -top-1/4 -left-1/4"></div>
                <div className="blob blob-2 absolute w-[100%] h-[100%] rounded-full opacity-60 blur-[60px] bg-blue-500 -top-1/4 -right-1/4"></div>
                <div className="blob blob-3 absolute w-[100%] h-[100%] rounded-full opacity-60 blur-[60px] bg-indigo-500 -bottom-1/4 -left-1/4"></div>
                <div className="blob blob-4 absolute w-[100%] h-[100%] rounded-full opacity-60 blur-[60px] bg-pink-500 -bottom-1/4 -right-1/4"></div>
            </div>

            {/* Texture Layer */}
            <div className="grain-texture absolute inset-0 opacity-10 pointer-events-none bg-repeat"
                style={{ backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')` }}>
            </div>
        </div>
    );
};

export default AiZoneGradient