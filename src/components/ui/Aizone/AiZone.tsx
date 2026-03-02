const AiZoneGradient = () => {
    return (
        <div className="ai-zone-wrapper">
            <div className="gradient-container">
                {/* These 4 circles create the mesh */}
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
                <div className="blob blob-4"></div>
            </div>

            {/* Texture Layer (The Grain) */}
            <div className="grain-texture"></div>
        </div>
    );
};

export default AiZoneGradient