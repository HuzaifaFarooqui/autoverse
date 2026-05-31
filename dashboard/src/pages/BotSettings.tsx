import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  fetchBot,
  updateBot,
  getEmbedScript,
  getEmbedNpm,
  getServerUrl,
  type BotConfig,
  type BotAppearance,
  type BotTone,
} from "../api/client";
import WidgetPreview from "../components/WidgetPreview";
import CodeSnippet from "../components/CodeSnippet";
import BotHistory from "../components/BotHistory";

type TabName = "appearance" | "tone" | "integration" | "history";

export default function BotSettings() {
  const { botId } = useParams<{ botId: string }>();
  const [bot, setBot] = useState<BotConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabName>("appearance");
  const [toast, setToast] = useState<string | null>(null);

  // Local editable copies
  const [appearance, setAppearance] = useState<BotAppearance | null>(null);
  const [tone, setTone] = useState<BotTone | null>(null);
  const [serverUrl, setServerUrl] = useState("");

  useEffect(() => {
    if (!botId) return;
    Promise.all([
      fetchBot(botId),
      getServerUrl(),
    ])
      .then(([b, url]) => {
        setBot(b);
        setAppearance({ ...b.appearance });
        setTone({ ...b.tone });
        setServerUrl(url);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [botId]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleSave = async () => {
    if (!botId || !appearance || !tone) return;
    setSaving(true);
    try {
      const updated = await updateBot(botId, { appearance, tone });
      setBot(updated);
      showToast("Settings saved successfully!");
    } catch {
      showToast("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateAppearance = <K extends keyof BotAppearance>(
    key: K,
    value: BotAppearance[K]
  ) => {
    setAppearance((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const updateTone = <K extends keyof BotTone>(key: K, value: BotTone[K]) => {
    setTone((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  if (loading) return <div className="spinner" />;
  if (!bot || !appearance || !tone)
    return <div style={{ color: "var(--danger)", padding: 40 }}>Bot not found</div>;

  return (
    <div>
      <Link to="/" className="back-link">← Back to Bots</Link>

      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2>{bot.name}</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
            Bot ID: <code style={{ color: "var(--accent-primary)" }}>{bot.botId}</code> &middot; {bot.websiteUrl}
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="tabs">
        {(["appearance", "tone", "integration", "history"] as TabName[]).map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "appearance" }
            {tab === "tone" }
            {tab === "integration" }
            {tab === "history" }
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "appearance" && (
        <div className="settings-layout">
          <div>
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="section-title">Colors</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Primary Color</label>
                  <div className="color-picker-wrap">
                    <div className="color-swatch" style={{ backgroundColor: appearance.primaryColor }}>
                      <input
                        type="color"
                        value={appearance.primaryColor}
                        onChange={(e) => updateAppearance("primaryColor", e.target.value)}
                      />
                    </div>
                    <span className="color-value">{appearance.primaryColor}</span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Accent Color</label>
                  <div className="color-picker-wrap">
                    <div className="color-swatch" style={{ backgroundColor: appearance.accentColor }}>
                      <input
                        type="color"
                        disabled={!appearance.accentMode}
                        value={appearance.accentColor}
                        onChange={(e) => updateAppearance("accentColor", e.target.value)}
                      />
                    </div>
                    <span className="color-value" style={{ opacity: appearance.accentMode ? 1 : 0.4 }}>
                      {appearance.accentColor}
                    </span>
                  </div>
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 12 }}>
                <label className="form-checkbox-wrapper">
                  <input
                    type="checkbox"
                    checked={appearance.accentMode || false}
                    onChange={(e) => updateAppearance("accentMode", e.target.checked)}
                  />
                  <span>Enable Dual Color Gradient (Accent Mode)</span>
                </label>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
              <div className="section-title">Layout & Style</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Position</label>
                  <select
                    className="form-select"
                    value={appearance.position}
                    onChange={(e) => updateAppearance("position", e.target.value as "left" | "right")}
                  >
                    <option value="right">Bottom Right</option>
                    <option value="left">Bottom Left</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Theme</label>
                  <select
                    className="form-select"
                    value={appearance.theme}
                    onChange={(e) => updateAppearance("theme", e.target.value as any)}
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="system">System / Auto</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Bubble Size ({appearance.bubbleSize}px)</label>
                  <input
                    type="range"
                    min="40"
                    max="80"
                    value={appearance.bubbleSize}
                    onChange={(e) => updateAppearance("bubbleSize", parseInt(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Border Radius ({appearance.borderRadius}px)</label>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    value={appearance.borderRadius}
                    onChange={(e) => updateAppearance("borderRadius", parseInt(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
              <div className="section-title">Premium Customizations</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Shadow Intensity</label>
                  <select
                    className="form-select"
                    value={appearance.shadowIntensity || "medium"}
                    onChange={(e) => updateAppearance("shadowIntensity", e.target.value as any)}
                  >
                    <option value="none">None</option>
                    <option value="light">Light</option>
                    <option value="medium">Medium</option>
                    <option value="heavy">Heavy</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Spacing Density</label>
                  <select
                    className="form-select"
                    value={appearance.spacing || "comfortable"}
                    onChange={(e) => updateAppearance("spacing", e.target.value as any)}
                  >
                    <option value="compact">Compact</option>
                    <option value="comfortable">Comfortable</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Button Variant</label>
                  <select
                    className="form-select"
                    value={appearance.buttonVariant || "solid"}
                    onChange={(e) => updateAppearance("buttonVariant", e.target.value as any)}
                  >
                    <option value="solid">Solid Fill</option>
                    <option value="outline">Modern Outline</option>
                  </select>
                </div>
                <div className="form-group" style={{ display: "flex", alignItems: "center" }}>
                  <label className="form-checkbox-wrapper" style={{ marginTop: 20 }}>
                    <input
                      type="checkbox"
                      checked={appearance.glassmorphism !== false}
                      onChange={(e) => updateAppearance("glassmorphism", e.target.checked)}
                    />
                    <span>Enable Glassmorphism Blur</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="section-title">Text Content</div>
              <div className="form-group">
                <label className="form-label">Header Title</label>
                <input
                  className="form-input"
                  value={appearance.headerTitle}
                  onChange={(e) => updateAppearance("headerTitle", e.target.value)}
                  placeholder="Customer Support"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Welcome Message</label>
                <textarea
                  className="form-textarea"
                  value={appearance.welcomeMessage}
                  onChange={(e) => updateAppearance("welcomeMessage", e.target.value)}
                  placeholder="Hi! How can I help you today?"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div>
            <div style={{ position: "sticky", top: 32 }}>
              <div className="form-label" style={{ marginBottom: 12 }}>Live Preview</div>
              <WidgetPreview appearance={appearance} />
            </div>
          </div>
        </div>
      )}

      {activeTab === "tone" && (
        <div style={{ maxWidth: 700 }}>
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="section-title">Language & Style</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Language</label>
                <select
                  className="form-select"
                  value={tone.language}
                  onChange={(e) => updateTone("language", e.target.value as BotTone["language"])}
                >
                  <option value="both">Bilingual (Auto-detect)</option>
                  <option value="en">English Only</option>
                  <option value="ur">Urdu Only</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Response Length</label>
                <select
                  className="form-select"
                  value={tone.responseLength}
                  onChange={(e) => updateTone("responseLength", e.target.value as BotTone["responseLength"])}
                >
                  <option value="short">Short (1-2 sentences)</option>
                  <option value="medium">Medium (2-4 sentences)</option>
                  <option value="long">Detailed (4+ sentences)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="section-title">Custom System Prompt</div>
            <div className="form-group">
              <label className="form-label">Additional Instructions</label>
              <textarea
                className="form-textarea"
                value={tone.systemPrompt}
                onChange={(e) => updateTone("systemPrompt", e.target.value)}
                placeholder="e.g. Always recommend our premium collection first. Mention that we offer free shipping on orders above Rs. 5000."
                rows={6}
              />
              <p className="form-help">
                These instructions will be added to the AI's system prompt. Use this to customize the chatbot's personality, focus areas, or special rules.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "integration" && (
        <div style={{ maxWidth: 700 }}>
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="section-title">Script Tag (Easiest)</div>
            <p style={{ color: "var(--text-secondary)", marginBottom: 16, fontSize: 14 }}>
              Add this single line to your website's HTML, just before the closing{" "}
              <code style={{ color: "var(--accent-primary)" }}>&lt;/body&gt;</code> tag.
            </p>
            <CodeSnippet code={getEmbedScript(bot.botId, serverUrl)} language="html" />
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <div className="section-title">NPM Package (For Developers)</div>
            <p style={{ color: "var(--text-secondary)", marginBottom: 16, fontSize: 14 }}>
              Install the package and call <code style={{ color: "var(--accent-primary)" }}>initWidget()</code> in your app. The widget auto-connects to your server.
            </p>
            <CodeSnippet code="npm install autoverse-fyp" language="bash" />
            <div style={{ height: 16 }} />
            <CodeSnippet code={getEmbedNpm(bot.botId)} language="typescript" />
          </div>

          <div className="card">
            <div className="section-title">Bot Details</div>
            <div className="form-group">
              <label className="form-label">Bot ID</label>
              <input className="form-input" value={bot.botId} readOnly style={{ fontFamily: "monospace" }} />
            </div>
            <div className="form-group">
              <label className="form-label">Website URL</label>
              <input className="form-input" value={bot.websiteUrl} readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Created</label>
              <input className="form-input" value={new Date(bot.createdAt).toLocaleString()} readOnly />
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div style={{ maxWidth: 1000 }}>
          <BotHistory botId={bot.botId} />
        </div>
      )}

      {toast && <div className="toast success">{toast}</div>}
    </div>
  );
}
