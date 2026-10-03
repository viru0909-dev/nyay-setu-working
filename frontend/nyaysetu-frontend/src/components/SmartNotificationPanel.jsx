import { useState } from "react";
import {
    Bell,
    Calendar,
    FileText,
    AlertTriangle,
    CheckCircle,
    Clock
} from "lucide-react";

export default function SmartNotificationPanel() {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: "Upcoming Hearing",
            message: "Civil Case hearing scheduled tomorrow at 10:30 AM",
            priority: "HIGH",
            type: "hearing",
            read: false
        },
        {
            id: 2,
            title: "Evidence Deadline",
            message: "Submit pending evidence documents before 5 PM today",
            priority: "MEDIUM",
            type: "evidence",
            read: false
        },
        {
            id: 3,
            title: "Court Order Available",
            message: "New court order has been uploaded for your case",
            priority: "LOW",
            type: "order",
            read: true
        }
    ]);

    const markAsRead = (id) => {
        setNotifications((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, read: true } : item
            )
        );
    };

    const getIcon = (type) => {
        switch (type) {
            case "hearing":
                return <Calendar size={18} color="#3b82f6" />;
            case "evidence":
                return <FileText size={18} color="#f59e0b" />;
            case "order":
                return <CheckCircle size={18} color="#10b981" />;
            default:
                return <Bell size={18} />;
        }
    };

    const getPriorityColor = (priority) => {
        if (priority === "HIGH") return "#ef4444";
        if (priority === "MEDIUM") return "#f59e0b";
        return "#10b981";
    };

    return (
        <div
            style={{
                background: "var(--bg-glass-strong)",
                border: "var(--border-glass-strong)",
                borderRadius: "1.5rem",
                padding: "1.5rem"
            }}
        >
            <h3
                style={{
                    color: "var(--text-main)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginTop: 0
                }}
            >
                <Bell size={20} color="var(--color-accent)" />
                Smart Notifications
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {notifications.map((item) => (
                    <div
                        key={item.id}
                        style={{
                            background: "var(--bg-glass)",
                            padding: "1rem",
                            borderRadius: "1rem",
                            opacity: item.read ? 0.6 : 1
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between"
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    gap: "0.5rem",
                                    alignItems: "center"
                                }}
                            >
                                {getIcon(item.type)}
                                <strong style={{ color: "var(--text-main)" }}>
                                    {item.title}
                                </strong>
                            </div>

                            <span
                                style={{
                                    color: getPriorityColor(item.priority),
                                    fontSize: "0.75rem",
                                    fontWeight: "700"
                                }}
                            >
                                {item.priority}
                            </span>
                        </div>

                        <p
                            style={{
                                color: "var(--text-secondary)",
                                fontSize: "0.85rem"
                            }}
                        >
                            {item.message}
                        </p>

                        {!item.read && (
                            <button
                                onClick={() => markAsRead(item.id)}
                                style={{
                                    background: "var(--color-accent)",
                                    color: "white",
                                    border: "none",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "0.5rem",
                                    cursor: "pointer"
                                }}
                            >
                                Mark as Read
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}