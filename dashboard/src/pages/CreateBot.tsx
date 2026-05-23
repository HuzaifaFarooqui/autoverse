import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createBot } from "../api/client";

export default function CreateBot() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [groqApiKey, setGroqApiKey] = useState("");
  const [groqModel, setGroqModel] = useState("llama3-8b-8192");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !websiteUrl.trim()) {
      setError("Name and Website URL are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const bot = await createBot({
        name: name.trim(),
        websiteUrl: websiteUrl.trim(),
        groqApiKey: groqApiKey.trim() || undefined,
        groqModel: groqModel.trim() || undefined,
      });
      navigate(`/bot/${bot.botId}`);
    } catch (err: any) {
      setError(err.message || "Failed to create bot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link to="/" className="back-link">
        ← Back to Bots
      </Link>
      <div className="page-header">
        <h2>Create New Chatbot</h2>
        <p>Set up an AI customer service agent for your website</p>
      </div>

      <div style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="section-title">Basic Information</div>

            <div className="form-group">
              <label className="form-label">Bot Name</label>
              <input
                className="form-input"
                placeholder="e.g: ChatBot"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Website URL</label>
              <input
                className="form-input"
                placeholder="https://your-website.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                required
              />
              <p className="form-help">
                The bot will automatically scrape and learn about this website
              </p>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <div className="section-title">AI Configuration</div>

            <div className="form-group">
              <label className="form-label">Groq API Key</label>
              <input
                className="form-input"
                type="password"
                placeholder="gsk_..."
                value={groqApiKey}
                onChange={(e) => setGroqApiKey(e.target.value)}
              />
              <p className="form-help">
                Optional. Uses the default key if not provided. Get yours at{" "}
                <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{ color: "var(--accent-primary)" }}>
                  console.groq.com
                </a>
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">AI Model</label>
              <select
                className="form-select"
                value={groqModel}
                onChange={(e) => setGroqModel(e.target.value)}
              >
                <option value="llama3-8b-8192">LLaMA 3 8B (Fast)</option>
                <option value="llama3-70b-8192">LLaMA 3 70B (Smart)</option>
                <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                <option value="gemma-7b-it">Gemma 7B</option>
              </select>
            </div>
          </div>

          {error && (
            <div style={{ color: "var(--danger)", marginBottom: 16, fontSize: 14 }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: "100%" }}
          >
            {loading ? "Creating..." : "Create Chatbot"}
          </button>
        </form>
      </div>
    </div>
  );
}
