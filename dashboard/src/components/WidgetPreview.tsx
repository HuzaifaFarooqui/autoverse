import type { BotAppearance } from "../api/client";

interface Props {
  appearance: BotAppearance;
}

export default function WidgetPreview({ appearance }: Props) {
  const {
    primaryColor,
    accentColor,
    position,
    bubbleSize,
    headerTitle,
    welcomeMessage,
    theme,
    borderRadius,
    accentMode,
    shadowIntensity,
    spacing,
    glassmorphism,
    buttonVariant,
  } = appearance;

  // Resolve Theme
  const isDark = theme === "dark" || theme === "system" || !theme; // Default system to dark for premium look
  const textColor = isDark ? "#ededed" : "#0f0f0f";
  const textMuted = isDark ? "#a1a1aa" : "#71717a";
  const bgSecondary = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)";
  const borderColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)";
  const bgMainRaw = isDark ? "#0c0c0c" : "#ffffff";
  const bgMain = glassmorphism 
    ? (isDark ? "rgba(12, 12, 12, 0.85)" : "rgba(255, 255, 255, 0.85)") 
    : bgMainRaw;

  // Resolve Colors (Accent Mode vs Single)
  const mainColor = primaryColor || "#000000";
  const secondColor = accentMode ? (accentColor || "#666666") : mainColor;
  const gradient = `linear-gradient(135deg, ${mainColor}, ${secondColor})`;

  // Resolve Shadow
  const shadowValue = {
    none: "none",
    light: "0 2px 12px rgba(0, 0, 0, 0.15)",
    medium: "0 8px 30px rgba(0, 0, 0, 0.3)",
    heavy: "0 20px 50px rgba(0, 0, 0, 0.5)",
  }[shadowIntensity || "medium"];

  // Resolve Spacing
  const isCompact = spacing === "compact";
  const msgPadding = isCompact ? "6px 10px" : "10px 14px";
  const innerGap = isCompact ? "6px" : "12px";

  const positionStyle = position === "left" ? { left: 16 } : { right: 16 };
  const chatPositionStyle = position === "left" ? { left: 16 } : { right: 16 };

  return (
    <div className="preview-container" style={{ position: "relative" }}>
      <span className="preview-label">Live Preview</span>

      {/* Simulated Website Canvas */}
      <div style={{
        width: "100%",
        height: "100%",
        background: isDark
          ? "linear-gradient(180deg, #020202 0%, #0c0c0c 100%)"
          : "linear-gradient(180deg, #f5f5f7 0%, #ffffff 100%)",
        position: "relative",
      }}>
        {/* Mock background content to showcase glassmorphism blur */}
        <div style={{ padding: "60px 24px", opacity: 0.15 }}>
          <div style={{ width: "40%", height: 16, background: textColor, borderRadius: 4, marginBottom: 16 }} />
          <div style={{ width: "80%", height: 10, background: textColor, borderRadius: 2, marginBottom: 8 }} />
          <div style={{ width: "70%", height: 10, background: textColor, borderRadius: 2, marginBottom: 8 }} />
          <div style={{ width: "60%", height: 10, background: textColor, borderRadius: 2 }} />
        </div>

        {/* Premium Chat Window */}
        <div style={{
          position: "absolute",
          bottom: Math.min(bubbleSize, 50) + 28,
          ...chatPositionStyle,
          width: 290,
          height: 350,
          borderRadius: `${borderRadius || 12}px`,
          background: bgMain,
          backdropFilter: glassmorphism ? "blur(12px)" : "none",
          WebkitBackdropFilter: glassmorphism ? "blur(12px)" : "none",
          boxShadow: shadowValue,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: `1px solid ${borderColor}`,
          fontSize: 12,
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          {/* Header */}
          <div style={{
            background: gradient,
            padding: isCompact ? "10px 14px" : "14px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${borderColor}`,
          }}>
            <span style={{ color: "#ffffff", fontWeight: 600, fontSize: 13, letterSpacing: "-0.01em" }}>
              {headerTitle || "Customer Support"}
            </span>
            <span style={{ color: "#ffffff", opacity: 0.6, fontSize: 12 }}>✕</span>
          </div>

          {/* Messages Transcript */}
          <div style={{
            flex: 1,
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: innerGap,
            overflow: "hidden",
          }}>
            {/* Bot Message */}
            <div style={{
              alignSelf: "flex-start",
              background: bgSecondary,
              color: textColor,
              padding: msgPadding,
              borderRadius: `${borderRadius || 12}px`,
              borderBottomLeftRadius: "3px",
              maxWidth: "85%",
              lineHeight: 1.4,
              border: `1px solid ${borderColor}`,
            }}>
              {welcomeMessage || "Hi! How can I help you today?"}
            </div>

            {/* User Message */}
            <div style={{
              alignSelf: "flex-end",
              background: buttonVariant === "outline" ? "transparent" : gradient,
              color: buttonVariant === "outline" ? mainColor : "#ffffff",
              padding: msgPadding,
              borderRadius: `${borderRadius || 12}px`,
              borderBottomRightRadius: "3px",
              border: buttonVariant === "outline" ? `1px solid ${mainColor}` : "none",
              maxWidth: "85%",
              lineHeight: 1.4,
            }}>
              How does the customization work?
            </div>
          </div>

          {/* Chat Footer Input */}
          <div style={{
            padding: "10px 14px",
            display: "flex",
            gap: 8,
            borderTop: `1px solid ${borderColor}`,
            background: glassmorphism ? "transparent" : bgMainRaw,
          }}>
            <div style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: "20px",
              border: `1px solid ${borderColor}`,
              background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
              color: textMuted,
              fontSize: 12,
            }}>
              Type a message...
            </div>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Refined Floating Bubble */}
        <div style={{
          position: "absolute",
          bottom: 16,
          ...positionStyle,
          width: Math.min(bubbleSize, 52),
          height: Math.min(bubbleSize, 52),
          borderRadius: "50%",
          background: gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: shadowIntensity === "none" ? "none" : `0 4px 20px ${mainColor}44`,
          cursor: "pointer",
          transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
