import {
    Sparkles,
    Calendar,
    FileText,
    Scale,
    AlertCircle,
    Clock
} from "lucide-react";

export default function CaseTimelineSummary({
    timeline = [],
    aiSummary,
    upcomingDeadline
}) {
    const iconMap = {
        filed: <Calendar size={18} />,
        evidence: <FileText size={18} />,
        hearing: <Scale size={18} />,
        deadline: <Clock size={18} />,
    };

    return (
        <div
            style={{
                background: "var(--bg-glass-strong)",
                backdropFilter: "var(--glass-blur)",
                border: "var(--border-glass)",
                borderRadius: "1.5rem",
                padding: "1.5rem",
                boxShadow: "var(--shadow-glass)",
                marginBottom: "1.5rem",
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                }}
            >
                <Sparkles size={22} color="#8b5cf6" />
                <h3
                    style={{
                        margin: 0,
                        color: "var(--text-main)",
                        fontSize: "1.2rem",
                    }}
                >
                    AI Case Timeline Summary
                </h3>
            </div>

            {/* AI Summary */}
            <div
                style={{
                    background: "rgba(139, 92, 246, 0.1)",
                    borderRadius: "1rem",
                    padding: "1rem",
                    marginBottom: "1.5rem",
                }}
            >
                <p
                    style={{
                        margin: 0,
                        color: "var(--text-main)",
                        lineHeight: "1.6",
                    }}
                >
                    {aiSummary ||
                        "This case has multiple legal events. Review the timeline below to track important activities and upcoming actions."}
                </p>
            </div>

            {/* Important Events Timeline */}
            <div>
                <h4
                    style={{
                        color: "var(--text-main)",
                        marginBottom: "1rem",
                    }}
                >
                    Important Events
                </h4>

                {timeline.length === 0 ? (
                    <p style={{ color: "var(--text-secondary)" }}>
                        No timeline events available.
                    </p>
                ) : (
                    timeline.map((event, index) => (
                        <div
                            key={index}
                            style={{
                                display: "flex",
                                gap: "1rem",
                                marginBottom: "1rem",
                                alignItems: "flex-start",
                            }}
                        >
                            <div
                                style={{
                                    background:
                                        "rgba(59, 130, 246, 0.1)",
                                    color: "#3b82f6",
                                    padding: "0.6rem",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {iconMap[event.type] || (
                                    <FileText size={18} />
                                )}
                            </div>

                            <div>
                                <h5
                                    style={{
                                        margin: 0,
                                        color: "var(--text-main)",
                                    }}
                                >
                                    {event.title}
                                </h5>

                                <p
                                    style={{
                                        margin: "0.25rem 0",
                                        color:
                                            "var(--text-secondary)",
                                    }}
                                >
                                    {event.description}
                                </p>

                                <small
                                    style={{
                                        color:
                                            "var(--text-secondary)",
                                    }}
                                >
                                    {event.date}
                                </small>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Upcoming Action Alert */}
            {upcomingDeadline && (
                <div
                    style={{
                        marginTop: "1.5rem",
                        background: "rgba(245, 158, 11, 0.1)",
                        borderRadius: "1rem",
                        padding: "1rem",
                        display: "flex",
                        gap: "0.75rem",
                        alignItems: "center",
                    }}
                >
                    <AlertCircle
                        size={20}
                        color="#f59e0b"
                    />

                    <div>
                        <strong
                            style={{
                                color: "var(--text-main)",
                            }}
                        >
                            Upcoming Action Required
                        </strong>

                        <p
                            style={{
                                margin: "0.3rem 0 0",
                                color:
                                    "var(--text-secondary)",
                            }}
                        >
                            {upcomingDeadline}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}