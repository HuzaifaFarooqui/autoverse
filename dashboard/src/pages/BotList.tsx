import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchBots, deleteBot, type BotConfig } from "../api/client";

export default function BotList() {
  const [bots, setBots] = useState<BotConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBots()
      .then(setBots)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (botId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this bot? This cannot be undone.")) return;
    await deleteBot(botId);
    setBots((prev) => prev.filter((b) => b.botId !== botId));
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2>Your Chatbots</h2>
          <p>Manage and customize your AI customer service agents</p>
        </div>
        <Link to="/create" className="btn btn-primary btn-lg">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Bot
        </Link>
      </div>

      {bots.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"></div>
          <h3>No chatbots yet</h3>
          <p>Create your first AI customer service chatbot and embed it on any website in seconds.</p>
          <Link to="/create" className="btn btn-primary btn-lg">Create Your First Bot</Link>
        </div>
      ) : (
        <div className="card-grid">
          {bots.map((bot) => (
            <Link
              to={`/bot/${bot.botId}`}
              key={bot.botId}
              className="card bot-card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="bot-card-header">
                <div
                  className="bot-avatar"
                  style={{
                    background: `linear-gradient(135deg, ${bot.appearance.primaryColor}, ${bot.appearance.accentColor})`,
                  }}
                >
                  💬
                </div>
                <div>
                  <div className="bot-card-title">{bot.name}</div>
                  <div className="bot-card-url">{bot.websiteUrl}</div>
                </div>
              </div>
              <div className="bot-card-meta">
                <span className="bot-card-id">ID: {bot.botId}</span>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span className="status-badge active">Active</span>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={(e) => handleDelete(bot.botId, e)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
