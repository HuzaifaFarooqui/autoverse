/**
 * Autoverse Widget — Self-contained chat widget with setup flow.
 * When no botId is provided, shows a setup screen asking for the Bot ID.
 * Once connected, saves to localStorage and shows the chat interface.
 */

export function getWidgetHTML(serverUrl: string, botId: string): string {
    return `
(function() {
    if (document.getElementById('av-root')) return;

    var SERVER_URL = '${serverUrl}';
    var PROVIDED_BOT_ID = '${botId}';
    var STORAGE_KEY = 'autoverse_bot_id';
    var SESSION_KEY = 'autoverse_session_id';

    function getMetaBotId() {
        var m = document.querySelector('meta[name="autoverse-bot-id"]');
        return m ? m.getAttribute('content') : '';
    }
    var currentBotId = PROVIDED_BOT_ID || getMetaBotId() || '';
    try { if (!currentBotId) currentBotId = localStorage.getItem(STORAGE_KEY) || ''; } catch(e) {}

    var currentSessionId = '';
    try { currentSessionId = localStorage.getItem(SESSION_KEY) || ''; } catch(e) {}

    var isOpen = false;
    var isReady = false;
    var welcomeMsg = 'Hi! How can I help you today?';
    var headerTitle = 'Customer Support';
    var primaryColor = '#000000';
    var accentColor = '#666666';
    var accentMode = false;
    var shadowIntensity = 'medium';
    var spacing = 'comfortable';
    var glassmorphism = true;
    var buttonVariant = 'solid';
    var theme = 'system';
    var borderRadius = 16;
    var bubbleSize = 56;
    var position = 'right';
    var originalFetch = window.fetch ? window.fetch.bind(window) : null;
    if (!originalFetch) return;
    var SITE_URL = window.location.origin;

    // ===== STYLES =====
    var style = document.createElement('style');
    style.textContent = [
        '#av-root {',
        '  --primary-color: #000000;',
        '  --accent-color: #666666;',
        '  --bg-main: #0c0c0c;',
        '  --bg-secondary: rgba(255, 255, 255, 0.05);',
        '  --border-color: rgba(255, 255, 255, 0.08);',
        '  --text-primary: #ededed;',
        '  --text-muted: #a1a1aa;',
        '  --radius: 16px;',
        '  --bubble-size: 56px;',
        '  --shadow: 0 8px 30px rgba(0, 0, 0, 0.3);',
        '  --backdrop: blur(12px);',
        '  --spacing-gap: 12px;',
        '  --spacing-padding: 10px 14px;',
        '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;',
        '  position: fixed;',
        '  z-index: 2147483647;',
        '  bottom: 0;',
        '  pointer-events: none;',
        '}',
        '#av-root * { box-sizing: border-box; margin: 0; padding: 0; }',
        '#av-bubble {',
        '  pointer-events: auto;',
        '  position: fixed;',
        '  bottom: 24px;',
        '  width: var(--bubble-size);',
        '  height: var(--bubble-size);',
        '  border-radius: 50%;',
        '  cursor: pointer;',
        '  display: flex;',
        '  align-items: center;',
        '  justify-content: center;',
        '  box-shadow: var(--shadow);',
        '  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1);',
        '}',
        '#av-bubble:hover { transform: scale(1.05); }',
        '#av-bubble svg { width: 22px; height: 22px; fill: #fff; }',
        '#av-window {',
        '  pointer-events: auto;',
        '  position: fixed;',
        '  bottom: 92px;',
        '  width: 360px;',
        '  height: 500px;',
        '  border-radius: var(--radius);',
        '  overflow: hidden;',
        '  display: flex;',
        '  flex-direction: column;',
        '  background: var(--bg-main);',
        '  backdrop-filter: var(--backdrop);',
        '  -webkit-backdrop-filter: var(--backdrop);',
        '  border: 1px solid var(--border-color);',
        '  box-shadow: var(--shadow);',
        '  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);',
        '  opacity: 0;',
        '  transform: translateY(16px) scale(0.97);',
        '  pointer-events: none;',
        '}',
        '#av-window.open { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }',
        '#av-header {',
        '  padding: 14px 18px;',
        '  display: flex;',
        '  align-items: center;',
        '  justify-content: space-between;',
        '  color: #fff;',
        '  border-bottom: 1px solid var(--border-color);',
        '  flex-shrink: 0;',
        '}',
        '#av-header span { font-weight: 600; font-size: 14px; letter-spacing: -0.01em; }',
        '#av-close { background: none; border: none; color: #fff; font-size: 16px; cursor: pointer; opacity: 0.6; transition: opacity 0.2s; padding: 4px; }',
        '#av-close:hover { opacity: 1; }',
        '#av-setup { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 24px; text-align: center; }',
        '#av-setup .av-logo { font-size: 40px; margin-bottom: 12px; }',
        '#av-setup h3 { color: var(--text-primary); font-size: 16px; font-weight: 600; margin-bottom: 6px; }',
        '#av-setup p { color: var(--text-muted); font-size: 13px; margin-bottom: 20px; line-height: 1.5; }',
        '#av-setup input {',
        '  width: 100%;',
        '  padding: 10px 14px;',
        '  background: var(--bg-secondary);',
        '  border: 1px solid var(--border-color);',
        '  border-radius: var(--radius);',
        '  color: var(--text-primary);',
        '  font-size: 13px;',
        '  outline: none;',
        '  transition: border-color 0.2s;',
        '  text-align: center;',
        '}',
        '#av-setup input:focus { border-color: var(--text-primary); }',
        '#av-setup .av-connect-btn {',
        '  width: 100%;',
        '  margin-top: 12px;',
        '  padding: 10px;',
        '  border: none;',
        '  border-radius: var(--radius);',
        '  color: #fff;',
        '  font-size: 13px;',
        '  font-weight: 600;',
        '  cursor: pointer;',
        '  transition: opacity 0.2s;',
        '}',
        '#av-setup .av-connect-btn:hover { opacity: 0.9; }',
        '#av-setup .av-connect-btn:disabled { opacity: 0.5; cursor: not-allowed; }',
        '#av-setup .av-error { color: #ef4444; font-size: 12px; margin-top: 10px; min-height: 18px; }',
        '#av-setup .av-help { color: var(--text-muted); font-size: 11px; margin-top: 16px; line-height: 1.5; }',
        '#av-setup .av-help a { color: var(--text-primary); text-decoration: none; font-weight: 500; }',
        '#av-chat { flex: 1; display: flex; flex-direction: column; overflow: hidden; }',
        '#av-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: var(--spacing-gap); scrollbar-width: none; }',
        '#av-messages::-webkit-scrollbar { display: none; }',
        '.av-msg {',
        '  max-width: 85%;',
        '  padding: var(--spacing-padding);',
        '  border-radius: var(--radius);',
        '  font-size: 13px;',
        '  line-height: 1.5;',
        '  word-wrap: break-word;',
        '  animation: av-fade 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;',
        '  opacity: 0;',
        '  transform: translateY(8px);',
        '}',
        '@keyframes av-fade { to { opacity: 1; transform: translateY(0); } }',
        '.av-msg.bot { align-self: flex-start; background: var(--bg-secondary); color: var(--text-primary); border-bottom-left-radius: 4px; border: 1px solid var(--border-color); }',
        '.av-msg.user { align-self: flex-end; border-bottom-right-radius: 4px; }',
        '.av-msg.user.solid-fill { color: #fff; }',
        '.av-msg.user.outline-fill { background: transparent; }',
        '.av-msg.status { align-self: center; background: transparent; color: var(--text-muted); font-size: 12px; font-style: italic; border: none; }',
        '.av-msg img { max-width: 100%; border-radius: 8px; margin: 8px 0; }',
        '.av-msg a { color: var(--text-primary); text-decoration: underline; }',
        '.av-msg strong { font-weight: 600; }',
        '#av-input-row {',
        '  display: flex;',
        '  gap: 8px;',
        '  padding: 10px 14px;',
        '  border-top: 1px solid var(--border-color);',
        '  align-items: center;',
        '}',
        '#av-input {',
        '  flex: 1;',
        '  padding: 8px 14px;',
        '  background: var(--bg-secondary);',
        '  border: 1px solid var(--border-color);',
        '  border-radius: 20px;',
        '  color: var(--text-primary);',
        '  font-size: 13px;',
        '  outline: none;',
        '  font-family: inherit;',
        '  transition: border-color 0.2s;',
        '}',
        '#av-input:focus { border-color: var(--text-primary); }',
        '#av-send {',
        '  width: 32px;',
        '  height: 32px;',
        '  border-radius: 50%;',
        '  border: none;',
        '  cursor: pointer;',
        '  display: flex;',
        '  align-items: center;',
        '  justify-content: center;',
        '  transition: transform 0.15s;',
        '  flex-shrink: 0;',
        '}',
        '#av-send:hover { transform: scale(1.05); }',
        '#av-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }',
        '#av-send svg { width: 14px; height: 14px; fill: #fff; }',
        '.av-typing { display: flex; gap: 4px; padding: 10px 14px; align-self: flex-start; }',
        '.av-typing span { width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted); animation: av-dot 1.2s infinite; }',
        '.av-typing span:nth-child(2) { animation-delay: 0.2s; }',
        '.av-typing span:nth-child(3) { animation-delay: 0.4s; }',
        '@keyframes av-dot { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-4px); opacity: 1; } }'
    ].join('\\n');
    document.head.appendChild(style);

    // ===== BUILD DOM =====
    var root = document.createElement('div');
    root.id = 'av-root';

    var bubble = document.createElement('div');
    bubble.id = 'av-bubble';
    bubble.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>';

    var win = document.createElement('div');
    win.id = 'av-window';

    var header = document.createElement('div');
    header.id = 'av-header';
    header.innerHTML = '<span>💬 ' + headerTitle + '</span><button id="av-close">✕</button>';

    var setupView = document.createElement('div');
    setupView.id = 'av-setup';
    setupView.innerHTML = [
        '<h3>Welcome to Autoverse</h3>',
        '<p>Connect your AI customer service assistant to get started.</p>',
        '<input id="av-bot-input" type="text" placeholder="Enter your Bot ID" autocomplete="off" spellcheck="false">',
        '<button class="av-connect-btn" id="av-connect-btn">🔗 Connect Bot</button>',
        '<div class="av-error" id="av-setup-error"></div>',
        '<div class="av-help">Get your Bot ID from the<br><a href="https://autoverse-nmbw.vercel.app" target="_blank">Autoverse Dashboard →</a></div>'
    ].join('');

    var chatView = document.createElement('div');
    chatView.id = 'av-chat';
    chatView.style.display = 'none';
    chatView.innerHTML = [
        '<div id="av-messages"></div>',
        '<div id="av-input-row">',
        '<input id="av-input" placeholder="Type your message..." autocomplete="off">',
        '<button id="av-send" disabled>',
        '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
        '</button></div>'
    ].join('');

    win.appendChild(header);
    win.appendChild(setupView);
    win.appendChild(chatView);
    root.appendChild(bubble);
    root.appendChild(win);
    document.body.appendChild(root);

    // ===== ELEMENTS =====
    var closeBtn = document.getElementById('av-close');
    var botInput = document.getElementById('av-bot-input');
    var connectBtn = document.getElementById('av-connect-btn');
    var setupError = document.getElementById('av-setup-error');
    var messages = document.getElementById('av-messages');
    var chatInput = document.getElementById('av-input');
    var sendBtn = document.getElementById('av-send');

    bubble.addEventListener('click', function() {
        isOpen = !isOpen;
        win.classList.toggle('open', isOpen);
    });
    closeBtn.addEventListener('click', function() {
        isOpen = false;
        win.classList.remove('open');
    });

    connectBtn.addEventListener('click', handleConnect);
    botInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') handleConnect();
    });

    function handleConnect() {
        var id = botInput.value.trim();
        if (!id) { setupError.textContent = 'Please enter a Bot ID'; return; }
        setupError.textContent = '';
        connectBtn.disabled = true;
        connectBtn.textContent = '⏳ Connecting...';

        originalFetch(SERVER_URL + '/autoverse/api/bots/' + id + '/config')
            .then(function(r) { return r.json(); })
            .then(function(cfg) {
                currentBotId = id;
                try { localStorage.setItem(STORAGE_KEY, id); } catch(e) {}
                mapConfig(cfg);
                applyAppearance();
                switchToChat();
            })
            .catch(function() {
                setupError.textContent = 'Invalid Bot ID or server unreachable';
                connectBtn.disabled = false;
                connectBtn.textContent = '🔗 Connect Bot';
            });
    }

    function mapConfig(cfg) {
        if (cfg.primaryColor) primaryColor = cfg.primaryColor;
        if (cfg.accentColor) accentColor = cfg.accentColor;
        if (cfg.headerTitle) headerTitle = cfg.headerTitle;
        if (cfg.welcomeMessage) welcomeMsg = cfg.welcomeMessage;
        if (cfg.accentMode !== undefined) accentMode = !!cfg.accentMode;
        if (cfg.shadowIntensity) shadowIntensity = cfg.shadowIntensity;
        if (cfg.spacing) spacing = cfg.spacing;
        if (cfg.glassmorphism !== undefined) glassmorphism = !!cfg.glassmorphism;
        if (cfg.buttonVariant) buttonVariant = cfg.buttonVariant;
        if (cfg.theme) theme = cfg.theme;
        if (cfg.borderRadius !== undefined) borderRadius = cfg.borderRadius;
        if (cfg.bubbleSize !== undefined) bubbleSize = cfg.bubbleSize;
        if (cfg.position) position = cfg.position;
    }

    function applyAppearance() {
        var rootEl = document.getElementById('av-root');
        if (!rootEl) return;

        var resolvedDark = theme === 'dark' || theme === 'system' || !theme;
        if (theme === 'system' && window.matchMedia) {
            resolvedDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        var textPrimary = resolvedDark ? '#ededed' : '#0f0f0f';
        var textMuted = resolvedDark ? '#a1a1aa' : '#71717a';
        var bgMainRaw = resolvedDark ? '#0c0c0c' : '#ffffff';
        var bgSecondaryRaw = resolvedDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';
        var borderColorRaw = resolvedDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
        var bgMain = glassmorphism ? (resolvedDark ? 'rgba(12, 12, 12, 0.85)' : 'rgba(255, 255, 255, 0.85)') : bgMainRaw;

        var shadowValue = {
            none: 'none',
            light: '0 2px 12px rgba(0, 0, 0, 0.12)',
            medium: '0 8px 30px rgba(0, 0, 0, 0.25)',
            heavy: '0 20px 50px rgba(0, 0, 0, 0.45)'
        }[shadowIntensity || 'medium'];

        var isCompact = spacing === 'compact';
        var msgPadding = isCompact ? '6px 10px' : '10px 14px';
        var innerGap = isCompact ? '6px' : '12px';

        var gradient = 'linear-gradient(135deg, ' + primaryColor + ', ' + (accentMode ? accentColor : primaryColor) + ')';

        rootEl.style.setProperty('--primary-color', primaryColor);
        rootEl.style.setProperty('--accent-color', accentMode ? accentColor : primaryColor);
        rootEl.style.setProperty('--bg-main', bgMain);
        rootEl.style.setProperty('--bg-secondary', bgSecondaryRaw);
        rootEl.style.setProperty('--border-color', borderColorRaw);
        rootEl.style.setProperty('--text-primary', textPrimary);
        rootEl.style.setProperty('--text-muted', textMuted);
        rootEl.style.setProperty('--radius', borderRadius + 'px');
        rootEl.style.setProperty('--bubble-size', Math.min(bubbleSize, 80) + 'px');
        rootEl.style.setProperty('--shadow', shadowValue);
        rootEl.style.setProperty('--backdrop', glassmorphism ? 'blur(12px)' : 'none');
        rootEl.style.setProperty('--spacing-gap', innerGap);
        rootEl.style.setProperty('--spacing-padding', msgPadding);

        header.style.background = gradient;
        bubble.style.background = gradient;
        sendBtn.style.background = gradient;
        connectBtn.style.background = gradient;

        rootEl.style.left = position === 'left' ? '0' : 'auto';
        rootEl.style.right = position === 'left' ? 'auto' : '0';

        win.style.left = position === 'left' ? '24px' : 'auto';
        win.style.right = position === 'left' ? 'auto' : '24px';
        bubble.style.left = position === 'left' ? '24px' : 'auto';
        bubble.style.right = position === 'left' ? 'auto' : '24px';

        header.querySelector('span').textContent = '💬 ' + headerTitle;
    }

    function switchToChat() {
        setupView.style.display = 'none';
        chatView.style.display = 'flex';
        initAgent();
    }

    // ===== CHAT LOGIC =====
    function addMessage(text, type) {
        var div = document.createElement('div');
        div.className = 'av-msg ' + type;

        if (type === 'user') {
            if (buttonVariant === 'outline') {
                div.classList.add('outline-fill');
                div.style.border = '1px solid ' + primaryColor;
                div.style.color = primaryColor;
            } else {
                div.classList.add('solid-fill');
                div.style.background = 'linear-gradient(135deg, ' + primaryColor + ', ' + (accentMode ? accentColor : primaryColor) + ')';
            }
        }

        if (type === 'bot') {
            div.innerHTML = text
                .replace(/!\\[([^\\]]*?)\\]\\(([^)]+?)\\)/g, '<img src="$2" alt="$1" />')
                .replace(/\\[([^\\]]+?)\\]\\(([^)]+?)\\)/g, '<a href="$2" target="_blank">$1</a>')
                .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
                .replace(/\\n/g, '<br>');
        } else {
            div.textContent = text;
        }
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    function showTyping() {
        var t = document.createElement('div');
        t.className = 'av-typing';
        t.id = 'av-typing';
        t.innerHTML = '<span></span><span></span><span></span>';
        messages.appendChild(t);
        messages.scrollTop = messages.scrollHeight;
    }
    function hideTyping() {
        var t = document.getElementById('av-typing');
        if (t) t.remove();
    }

    function initAgent() {
        addMessage("Setting up your assistant...", 'status');
        sendBtn.disabled = true;

        originalFetch(SERVER_URL + '/autoverse/api/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: SITE_URL, botId: currentBotId, sessionId: currentSessionId })
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            var s = messages.querySelector('.av-msg.status:last-child');
            if (s) s.remove();
            
            if (data.history && data.history.length > 0) {
                messages.innerHTML = '';
                data.history.forEach(function(msg) {
                    addMessage(msg.content, msg.role === 'assistant' ? 'bot' : 'user');
                });
                isReady = true;
                sendBtn.disabled = false;
            } else if (data.status === 'ready' || data.status === 'ignored') {
                isReady = true;
                sendBtn.disabled = false;
                addMessage(welcomeMsg, 'bot');
            } else {
                addMessage(data.error || 'Could not load store data.', 'status');
            }
        }).catch(function() {
            var s = messages.querySelector('.av-msg.status:last-child');
            if (s) s.remove();
            addMessage('Server unreachable. Please check your connection.', 'status');
        });
    }

    function sendMessage() {
        var text = chatInput.value.trim();
        if (!text || !isReady) return;
        addMessage(text, 'user');
        chatInput.value = '';
        sendBtn.disabled = true;
        showTyping();

        originalFetch(SERVER_URL + '/autoverse/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: SITE_URL,
                botId: currentBotId,
                pageUrl: window.location.href,
                query: text,
                sessionId: currentSessionId
            })
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            hideTyping();
            sendBtn.disabled = false;
            
            if (data.success && data.answer) {
                addMessage(data.answer, 'bot');
                if (data.sessionId && data.sessionId !== currentSessionId) {
                    currentSessionId = data.sessionId;
                    try { localStorage.setItem(SESSION_KEY, currentSessionId); } catch(e) {}
                }
            } else if (data.error) {
                // Show the ACTUAL error message to help debugging
                addMessage('\u26A0\uFE0F Error: ' + data.error, 'status');
            } else {
                addMessage('Sorry, something went wrong. Please try again.', 'status');
            }
        }).catch(function() {
            hideTyping();
            sendBtn.disabled = false;
            addMessage('Connection lost. Please try again.', 'status');
        });
    }

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });

    // ===== NETWORK INTERCEPTION (captures API data for richer context) =====
    try {
        var _origFetch = window.fetch;
        window.fetch = function() {
            var args = arguments;
            return _origFetch.apply(this, args).then(function(response) {
                try {
                    var url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
                    if (url && !url.includes('/autoverse/') && (url.includes('/api/') || url.includes('/products') || url.includes('/cart'))) {
                        var clone = response.clone();
                        clone.json().then(function(data) {
                            if (data && currentBotId && isReady) {
                                originalFetch(SERVER_URL + '/autoverse/api/index-data', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ url: SITE_URL, botId: currentBotId, sessionId: currentSessionId, data: data })
                                }).catch(function() {});
                            }
                        }).catch(function() {});
                    }
                } catch(e) {}
                return response;
            });
        };
    } catch(e) {}

    // ===== AUTO-CONNECT IF BOT ID EXISTS =====
    if (currentBotId) {
        originalFetch(SERVER_URL + '/autoverse/api/bots/' + currentBotId + '/config')
            .then(function(r) { return r.json(); })
            .then(function(cfg) {
                mapConfig(cfg);
                applyAppearance();
                switchToChat();
            })
            .catch(function() {
                currentBotId = '';
                try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
                applyAppearance();
            });
    } else {
        applyAppearance();
    }
})();
`;
}

/**
 * Default cloud server URL. Update this to your deployed server.
 */
const AUTOVERSE_CLOUD_URL = "https://autoverse-production-be8b.up.railway.app";

/**
 * Initialize the Autoverse chat widget.
 *
 * Usage:
 *   import "autoverse-fyp";                          // auto-init
 *   import { initWidget } from "autoverse-fyp";      // manual
 *   initWidget({ botId: "abc123" });
 *
 * Safety:
 *   - Returns immediately in SSR/Node (no window)
 *   - Waits for DOM ready if called early
 *   - Prevents duplicate mounts
 *   - Never throws — fails silently
 */
export function initWidget(options?: { serverUrl?: string; botId?: string }): void {
    try {
        // SSR guard — never touch DOM in Node
        if (typeof window === "undefined" || typeof document === "undefined") return;

        const opts = options || {};
        const origin = opts.serverUrl
            || (window as any).AUTOVERSE_SERVER_URL
            || AUTOVERSE_CLOUD_URL;
        const botId = opts.botId || (window as any).AUTOVERSE_BOT_ID || "";

        function inject() {
            try {
                // Prevent duplicate mounts
                if (document.getElementById("av-root")) return;
                // Body must exist
                if (!document.body) return;

                const script = document.createElement("script");
                script.id = "autoverse-widget-script";
                script.textContent = getWidgetHTML(origin, botId);
                document.body.appendChild(script);
            } catch (_) {
                // Silent failure — never crash host app
            }
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", inject, { once: true });
        } else {
            inject();
        }
    } catch (_) {
        // Outermost safety net
    }
}
