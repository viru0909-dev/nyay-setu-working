import { Search, MessageSquare, Clock } from "lucide-react";

export default function ConversationHistory({
    chats = [],
    search = "",
    setSearch,
    onSelectChat
}) {
    const filteredChats = chats.filter((chat) =>
        chat.title?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div
            style={{
                background: "var(--bg-glass-strong)",
                padding: "1rem",
                borderRadius: "1rem",
                marginBottom: "1rem",
                border: "var(--border-glass)"
            }}
        >
            <h3
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem"
                }}
            >
                <MessageSquare size={18} />
                Conversation History
            </h3>

            <div style={{ position: "relative", marginBottom: "1rem" }}>
                <Search
                    size={16}
                    style={{
                        position: "absolute",
                        left: "10px",
                        top: "10px"
                    }}
                />

                <input
                    type="text"
                    placeholder="Search previous queries..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "0.6rem 0.6rem 0.6rem 2rem",
                        borderRadius: "0.5rem",
                        border: "var(--border-glass)",
                        background: "var(--bg-glass)",
                        color: "var(--text-main)"
                    }}
                />
            </div>


            {filteredChats.length === 0 ? (
                <p style={{ color: "var(--text-secondary)" }}>
                    No previous conversations found.
                </p>
            ) : (
                filteredChats.map((chat) => (
                    <div
                        key={chat.id}
                        onClick={() => onSelectChat(chat)}
                        style={{
                            cursor: "pointer",
                            padding: "0.75rem",
                            marginBottom: "0.5rem",
                            borderRadius: "0.75rem",
                            background: "var(--bg-glass)",
                            border: "var(--border-glass)"
                        }}
                    >
                        <strong>{chat.title}</strong>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                marginTop: "0.3rem",
                                color: "var(--text-secondary)",
                                fontSize: "0.8rem"
                            }}
                        >
                            <Clock size={12} />
                            {chat.date}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}