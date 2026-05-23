import { useState, useEffect } from "react";
import { fetchSessions, deleteSession, clearBotHistory, type Session } from "../api/client";

export default function BotHistory({ botId }: { botId: string }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions(botId)
      .then((data) => {
        setSessions(data);
        if (data.length > 0) setActiveSession(data[0]);
      })
      .catch((e) => console.error("Failed to load sessions:", e))
      .finally(() => setLoading(false));
  }, [botId]);

  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm("Are you sure you want to delete this chat session?")) return;
    try {
      await deleteSession(sessionId);
      const updated = sessions.filter(s => s.sessionId !== sessionId);
      setSessions(updated);
      if (activeSession?.sessionId === sessionId) {
        setActiveSession(updated.length > 0 ? updated[0] : null);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete session");
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear ALL chat history for this bot? This cannot be undone.")) return;
    try {
      await clearBotHistory(botId);
      setSessions([]);
      setActiveSession(null);
    } catch (e) {
      console.error(e);
      alert("Failed to clear history");
    }
  };

  if (loading) return <div className="spinner" />;

  if (sessions.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
        <h3>No Chat History</h3>
        <p>This bot hasn't received any messages yet.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 24, height: 600 }}>
      {/* Session List */}
      <div className="card" style={{ width: 300, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-color)", fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Recent Conversations</span>
          {sessions.length > 0 && (
            <button 
              onClick={handleClearHistory} 
              style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 12, padding: "4px 8px", borderRadius: 4 }}
              title="Clear all history"
            >
              Clear All
            </button>
          )}
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {sessions.map((s) => (
            <div
              key={s.sessionId}
              onClick={() => setActiveSession(s)}
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-color)",
                cursor: "pointer",
                backgroundColor: activeSession?.sessionId === s.sessionId ? "rgba(102, 126, 234, 0.1)" : "transparent",
                borderLeft: activeSession?.sessionId === s.sessionId ? "3px solid var(--accent-primary)" : "3px solid transparent",
                transition: "background 0.2s"
              }}
            >
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>
                {new Date(s.updatedAt).toLocaleString()}
              </div>
              <div style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 500 }}>
                {s.messages.length} messages
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {s.messages.filter(m => m.role === "user").pop()?.content || "No user messages"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Transcript */}
      <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 600 }}>Transcript</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>ID: {activeSession?.sessionId}</span>
            {activeSession && (
              <button 
                onClick={() => handleDeleteSession(activeSession.sessionId)} 
                style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 12, padding: "4px 8px", borderRadius: 4, backgroundColor: "rgba(255, 60, 60, 0.1)" }}
                title="Delete this session"
              >
                Delete
              </button>
            )}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16, backgroundColor: "var(--bg-card)" }}>
          {activeSession?.messages.map((msg, i) => (
            <div
              key={i}
              style={{
                maxWidth: "80%",
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                backgroundColor: msg.role === "user" ? "var(--accent-primary)" : "rgba(255, 255, 255, 0.05)",
                color: msg.role === "user" ? "#fff" : "var(--text-primary)",
                padding: "12px 16px",
                borderRadius: 12,
                borderBottomRightRadius: msg.role === "user" ? 4 : 12,
                borderBottomLeftRadius: msg.role === "assistant" ? 4 : 12,
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              <div style={{ marginBottom: 4, fontSize: 11, color: msg.role === "user" ? "rgba(255,255,255,0.7)" : "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                {msg.role}
              </div>
              <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
              <div style={{ marginTop: 6, fontSize: 10, color: msg.role === "user" ? "rgba(255,255,255,0.5)" : "var(--text-muted)", textAlign: "right" }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          {activeSession?.messages.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--text-muted)", marginTop: 40 }}>
              Session started but no messages sent.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
