import React, { useState } from "react";

const ChatHistory = () => {
  const [chats, setChats] = useState([
    { id: 1, title: "Property dispute query", date: "2026-06-03", messages: ["What are my rights?", "You have the right to file a civil suit under Section 6 of the Specific Relief Act."] },
    { id: 2, title: "Bail application help", date: "2026-06-02", messages: ["How to apply for bail?", "To apply for bail, file an application before the Sessions Court under Section 439 CrPC."] },
    { id: 3, title: "FIR filing process", date: "2026-06-01", messages: ["How to file FIR?", "You can file an FIR at your nearest police station or use the online portal of your state police."] },
  ]);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(null);

  const filtered = chats.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const deleteChat = (id) => {
    setChats(chats.filter((c) => c.id !== id));
    if (active?.id === id) setActive(null);
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      <div style={{ width: "280px", borderRight: "1px solid #ddd", padding: "16px", overflowY: "auto", background: "#fafafa" }}>
        <h3 style={{ margin: "0 0 12px" }}>Chat History</h3>
        <input
          placeholder="Search chats..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd", marginBottom: "12px", boxSizing: "border-box" }}
        />
        <button
          onClick={() => setActive(null)}
          style={{ width: "100%", padding: "8px", background: "#007bff", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", marginBottom: "12px" }}>
          + New Chat
        </button>
        {filtered.length === 0 && <div style={{ color: "#aaa", fontSize: "13px" }}>No chats found.</div>}
        {filtered.map((c) => (
          <div key={c.id}
            style={{ padding: "10px", borderRadius: "6px", marginBottom: "8px", background: active?.id === c.id ? "#e8f0fe" : "#f9f9f9", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #eee" }}
            onClick={() => setActive(c)}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "500" }}>{c.title}</div>
              <div style={{ fontSize: "11px", color: "#888" }}>{c.date}</div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); deleteChat(c.id); }}
              style={{ background: "none", border: "none", color: "#ff4444", cursor: "pointer", fontSize: "16px" }}>
              🗑
            </button>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
        {active ? (
          <>
            <h3 style={{ marginTop: 0 }}>{active.title}</h3>
            <p style={{ fontSize: "12px", color: "#888" }}>{active.date}</p>
            {active.messages.map((m, i) => (
              <div key={i} style={{ padding: "10px 14px", marginBottom: "8px", borderRadius: "8px", background: i % 2 === 0 ? "#f0f0f0" : "#e8f4ff", maxWidth: "70%", lineHeight: "1.5" }}>
                {m}
              </div>
            ))}
          </>
        ) : (
          <div style={{ color: "#888", marginTop: "40px", textAlign: "center", fontSize: "16px" }}>
            Select a conversation from the sidebar or start a new chat.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
