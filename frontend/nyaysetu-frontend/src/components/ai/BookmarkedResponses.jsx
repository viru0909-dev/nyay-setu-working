import { Bookmark } from "lucide-react";

export default function BookmarkedResponses({
    bookmarks = [],
    onSelectBookmark
}) {
    return (
        <div
            style={{
                background: "var(--bg-glass-strong)",
                padding: "1rem",
                borderRadius: "1rem",
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
                <Bookmark size={18} />
                Important Legal Responses
            </h3>


            {bookmarks.length === 0 ? (
                <p style={{ color: "var(--text-secondary)" }}>
                    No bookmarked responses yet.
                </p>
            ) : (
                bookmarks.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => onSelectBookmark(item)}
                        style={{
                            cursor: "pointer",
                            padding: "0.75rem",
                            marginBottom: "0.5rem",
                            borderRadius: "0.75rem",
                            background: "var(--bg-glass)",
                            border: "var(--border-glass)"
                        }}
                    >
                        <strong>
                            {item.title}
                        </strong>

                        <p
                            style={{
                                marginTop: "0.5rem",
                                color: "var(--text-secondary)",
                                fontSize: "0.85rem"
                            }}
                        >
                            {item.preview}
                        </p>
                    </div>
                ))
            )}
        </div>
    );
}