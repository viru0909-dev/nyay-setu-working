import { useState } from "react";
import {
    Mail,
    Bell,
    Volume2,
    Filter
} from "lucide-react";

export default function NotificationPreferences() {
    const [settings, setSettings] = useState({
        email: true,
        inApp: true,
        sound: false,
        priority: "ALL"
    });

    const toggleSetting = (key) => {
        setSettings((prev) => ({
            ...prev,
            [key]: !prev[key]
        }));
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
                    gap: "0.5rem",
                    alignItems: "center",
                    marginTop: 0
                }}
            >
                <Bell size={20} color="var(--color-accent)" />
                Notification Preferences
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                <label style={{ color: "var(--text-main)" }}>
                    <input
                        type="checkbox"
                        checked={settings.email}
                        onChange={() => toggleSetting("email")}
                    />
                    {" "} Email Notifications
                </label>

                <label style={{ color: "var(--text-main)" }}>
                    <input
                        type="checkbox"
                        checked={settings.inApp}
                        onChange={() => toggleSetting("inApp")}
                    />
                    {" "} In-App Notifications
                </label>

                <label style={{ color: "var(--text-main)" }}>
                    <input
                        type="checkbox"
                        checked={settings.sound}
                        onChange={() => toggleSetting("sound")}
                    />
                    {" "} Sound Alerts
                </label>

                <div>
                    <label
                        style={{
                            color: "var(--text-main)",
                            display: "block",
                            marginBottom: "0.5rem"
                        }}
                    >
                        Priority Filter
                    </label>

                    <select
                        value={settings.priority}
                        onChange={(e) =>
                            setSettings({
                                ...settings,
                                priority: e.target.value
                            })
                        }
                        style={{
                            width: "100%",
                            padding: "0.7rem",
                            borderRadius: "0.7rem",
                            background: "var(--bg-glass)",
                            color: "var(--text-main)",
                            border: "var(--border-glass)"
                        }}
                    >
                        <option value="ALL">All Notifications</option>
                        <option value="HIGH">High Priority</option>
                        <option value="MEDIUM">Medium Priority</option>
                        <option value="LOW">Low Priority</option>
                    </select>
                </div>
            </div>
        </div>
    );
}