import {
    Wifi,
    WifiOff,
    Mic,
    MicOff,
    Video,
    VideoOff,
    Volume2,
    RefreshCw,
    User
} from "lucide-react";

export default function ParticipantStatusPanel({ participants = [] }) {

    const getConnectionColor = (quality) => {
        switch (quality) {
            case "good":
                return "#22c55e";
            case "medium":
                return "#f59e0b";
            case "poor":
                return "#ef4444";
            default:
                return "#94a3b8";
        }
    };

    return (
        <div
            style={{
                width: "320px",
                background: "var(--bg-glass-strong)",
                border: "var(--border-glass-strong)",
                borderRadius: "1.5rem",
                padding: "1rem",
                height: "100%",
                overflowY: "auto"
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem"
                }}
            >
                <User size={20} color="var(--color-accent)" />

                <h3
                    style={{
                        margin: 0,
                        color: "var(--text-main)"
                    }}
                >
                    Participants ({participants.length})
                </h3>
            </div>


            {/* Participant List */}
            {participants.length === 0 ? (
                <div
                    style={{
                        color: "var(--text-secondary)",
                        textAlign: "center",
                        padding: "2rem 0"
                    }}
                >
                    No participants connected
                </div>
            ) : (
                participants.map((person) => (
                    <div
                        key={person.id}
                        style={{
                            background: "var(--bg-glass)",
                            border: "var(--border-glass)",
                            borderRadius: "1rem",
                            padding: "1rem",
                            marginBottom: "1rem"
                        }}
                    >
                        {/* Name */}
                        <div
                            style={{
                                fontWeight: "700",
                                color: "var(--text-main)",
                                marginBottom: "0.8rem"
                            }}
                        >
                            {person.name}
                        </div>


                        {/* Online Status */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                marginBottom: "0.5rem"
                            }}
                        >
                            {person.online ? (
                                <Wifi size={16} color="#22c55e" />
                            ) : (
                                <WifiOff size={16} color="#ef4444" />
                            )}

                            <span style={{ color: "var(--text-secondary)" }}>
                                {person.online ? "Online" : "Offline"}
                            </span>
                        </div>


                        {/* Microphone */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                marginBottom: "0.5rem"
                            }}
                        >
                            {person.micOn ? (
                                <Mic size={16} color="#22c55e" />
                            ) : (
                                <MicOff size={16} color="#ef4444" />
                            )}

                            <span style={{ color: "var(--text-secondary)" }}>
                                {person.micOn ? "Mic On" : "Muted"}
                            </span>
                        </div>


                        {/* Camera */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                marginBottom: "0.5rem"
                            }}
                        >
                            {person.cameraOn ? (
                                <Video size={16} color="#22c55e" />
                            ) : (
                                <VideoOff size={16} color="#ef4444" />
                            )}

                            <span style={{ color: "var(--text-secondary)" }}>
                                {person.cameraOn
                                    ? "Camera On"
                                    : "Camera Off"}
                            </span>
                        </div>


                        {/* Speaking Indicator */}
                        {person.speaking && (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    marginBottom: "0.5rem",
                                    color: "#3b82f6",
                                    fontWeight: "600"
                                }}
                            >
                                <Volume2 size={16} />
                                Speaking...
                            </div>
                        )}


                        {/* Connection Quality */}
                        <div
                            style={{
                                color: getConnectionColor(person.connection),
                                fontWeight: "600",
                                marginBottom: "0.5rem"
                            }}
                        >
                            Network: {person.connection || "Unknown"}
                        </div>


                        {/* Reconnecting */}
                        {person.reconnecting && (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    color: "#f97316",
                                    fontWeight: "600"
                                }}
                            >
                                <RefreshCw size={16} />
                                Reconnecting...
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}