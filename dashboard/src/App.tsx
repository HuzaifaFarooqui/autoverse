import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import BotList from "./pages/BotList";
import CreateBot from "./pages/CreateBot";
import BotSettings from "./pages/BotSettings";
import { getApiBase, setApiBase, testConnection } from "./api/client";
import "./index.css";
import logoUrl from "./assets/logo.png";

function App() {
  const [serverUrl, setServerUrl] = useState(getApiBase());
  const [status, setStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempUrl, setTempUrl] = useState(serverUrl);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState("");

  const checkStatus = async (urlToCheck: string) => {
    setStatus("checking");
    const isConnected = await testConnection(urlToCheck);
    setStatus(isConnected ? "connected" : "disconnected");
  };

  useEffect(() => {
    // Check if there is an auto-connect query parameter (e.g. ?connect=http://localhost:3000)
    const params = new URLSearchParams(window.location.search);
    const connectParam = params.get("connect");

    if (connectParam) {
      const handleAutoConnect = async () => {
        setStatus("checking");
        let targetUrl = connectParam.trim();
        if (!/^https?:\/\//i.test(targetUrl)) {
          targetUrl = `http://${targetUrl}`;
        }
        
        const works = await testConnection(targetUrl);
        if (works) {
          setApiBase(targetUrl);
          setServerUrl(targetUrl);
          setStatus("connected");
          
          // Clean the address bar URL by removing query parameters
          const cleanPath = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanPath);
          
          // Reload page to refresh all data queries
          window.location.reload();
        } else {
          setStatus("disconnected");
          checkStatus(serverUrl);
        }
      };
      
      handleAutoConnect();
    } else {
      checkStatus(serverUrl);
    }
    
    // Periodically ping to ensure server stays online
    const interval = setInterval(() => {
      checkStatus(getApiBase());
    }, 15000);

    return () => clearInterval(interval);
  }, [serverUrl]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidating(true);
    setError("");
    
    let cleanUrl = tempUrl.trim();
    if (!cleanUrl) {
      setError("Server URL is required");
      setValidating(false);
      return;
    }
    
    // Basic format check
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = `http://${cleanUrl}`;
      setTempUrl(cleanUrl);
    }

    const works = await testConnection(cleanUrl);
    if (works) {
      setApiBase(cleanUrl);
      setServerUrl(cleanUrl);
      setIsModalOpen(false);
      // Reload page to refresh all active queries
      window.location.reload();
    } else {
      setError("Could not connect. Verify server is running and CORS is enabled.");
    }
    setValidating(false);
  };

  const handleResetToDefault = () => {
    setApiBase(null);
    const defaultUrl = getApiBase();
    setServerUrl(defaultUrl);
    setTempUrl(defaultUrl);
    setIsModalOpen(false);
    window.location.reload();
  };

  return (
    <BrowserRouter>
      <div className="app-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="app-logo">
            <img src={logoUrl} alt="Autoverse Logo" />
          </div>
          <div className="sidebar-brand">
            <h1> Autoverse</h1>
            <p>Admin Dashboard</p>
          </div>
          <nav className="sidebar-nav">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              All Bots
            </NavLink>
            <NavLink
              to="/create"
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Create Bot
            </NavLink>
          </nav>

          {/* Connection Status Widget */}
          <div className="connection-panel">
            <div className="connection-status">
              <span className={`connection-dot ${status}`} />
              <span style={{ textTransform: "capitalize", fontSize: "12px" }}>
                {status === "connected" ? "Connected" : status === "checking" ? "Verifying..." : "Disconnected"}
              </span>
            </div>
            <div className="connection-url" title={serverUrl}>
              {serverUrl}
            </div>
            <button 
              className="connection-btn" 
              onClick={() => {
                setTempUrl(serverUrl);
                setError("");
                setIsModalOpen(true);
              }}
            >
              Configure Server
            </button>
          </div>

          <div style={{
            padding: "16px 20px",
            borderTop: "1px solid var(--border-color)",
            fontSize: 11,
            color: "var(--text-muted)",
          }}>
            Autoverse FYP v1.0.0
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<BotList />} />
            <Route path="/create" element={<CreateBot />} />
            <Route path="/bot/:botId" element={<BotSettings />} />
          </Routes>
        </main>
      </div>

      {/* Connection Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Autoverse Server Connection</h3>
              <p>Connect this dashboard to your hosted autoverse-fyp package server.</p>
            </div>
            <form onSubmit={handleConnect}>
              <div className="form-group">
                <label className="form-label">Server Endpoint URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., http://localhost:3000"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  disabled={validating}
                />
                <span className="form-help">
                  Include protocol (http:// or https://). Make sure your backend allows cross-origin requests.
                </span>
              </div>

              {error && (
                <div style={{ color: "var(--danger)", fontSize: "13px", marginTop: "8px" }}>
                  ⚠️ {error}
                </div>
              )}

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleResetToDefault}
                  disabled={validating}
                >
                  Reset Default
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={validating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={validating}
                >
                  {validating ? "Connecting..." : "Save & Connect"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;
