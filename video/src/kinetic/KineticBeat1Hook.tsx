import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { THEME } from "../theme";

export const KineticBeat1Hook: React.FC = () => {
  const frame = useCurrentFrame();

  // Kinetic headline lines staggering in
  // Line 1: "Ever wondered why" (frame 10 to 30)
  // Line 2: "customers ghost" (frame 35 to 55)
  // Line 3: "your business?" (frame 60 to 80)
  const line1Progress = interpolate(frame, [10, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: THEME.easing.easeOut,
  });

  const line2Progress = interpolate(frame, [35, 53], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: THEME.easing.easeOut,
  });

  const line3Progress = interpolate(frame, [60, 78], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: THEME.easing.easeOut,
  });

  // Micro-prop: WhatsApp ghost notification card entering at frame 90
  const cardProgress = interpolate(frame, [90, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: THEME.easing.pop,
  });

  // Camera drift
  const cameraScale = interpolate(frame, [0, 240], [1, 1.04], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        background: THEME.colors.background,
        position: "relative",
        overflow: "hidden",
        padding: "180px 80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transform: `scale(${cameraScale})`,
      }}
    >
      {/* Top Tag */}
      <div>
        <span
          style={{
            fontFamily: THEME.typography.mono,
            fontSize: 18,
            fontWeight: 800,
            color: THEME.colors.primary,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            display: "inline-block",
            padding: "8px 20px",
            background: THEME.colors.primaryLight,
            borderRadius: 24,
          }}
        >
          THE HARSH TRUTH
        </span>
      </div>

      {/* Main Kinetic Typography Block */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Line 1 */}
        <div
          style={{
            fontFamily: THEME.typography.heading,
            fontSize: 82,
            fontWeight: 900,
            color: THEME.colors.charcoal,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            transform: `translateY(${interpolate(line1Progress, [0, 1], [40, 0])}px)`,
            opacity: line1Progress,
            filter: `blur(${interpolate(line1Progress, [0, 1], [10, 0])}px)`,
          }}
        >
          Ever wondered why
        </div>

        {/* Line 2 with Burnt Orange Accent */}
        <div
          style={{
            fontFamily: THEME.typography.heading,
            fontSize: 88,
            fontWeight: 900,
            color: THEME.colors.primary,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            transform: `translateY(${interpolate(line2Progress, [0, 1], [40, 0])}px)`,
            opacity: line2Progress,
            filter: `blur(${interpolate(line2Progress, [0, 1], [10, 0])}px)`,
          }}
        >
          customers ghost
        </div>

        {/* Line 3 */}
        <div
          style={{
            fontFamily: THEME.typography.heading,
            fontSize: 82,
            fontWeight: 900,
            color: THEME.colors.charcoal,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            transform: `translateY(${interpolate(line3Progress, [0, 1], [40, 0])}px)`,
            opacity: line3Progress,
            filter: `blur(${interpolate(line3Progress, [0, 1], [10, 0])}px)`,
          }}
        >
          your business?
        </div>
      </div>

      {/* Micro-Prop: Floating WhatsApp "Left on Read" Notification */}
      <div
        style={{
          background: "#ffffff",
          border: `1.5px solid ${THEME.colors.border}`,
          borderRadius: 28,
          padding: "28px 36px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
          transform: `scale(${interpolate(cardProgress, [0, 1], [0.88, 1])}) translateY(${interpolate(
            cardProgress,
            [0, 1],
            [60, 0]
          )}px)`,
          opacity: cardProgress,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>💬</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: THEME.colors.charcoal }}>
              WhatsApp DM
            </span>
          </div>
          <span style={{ fontSize: 13, fontFamily: THEME.typography.mono, color: "#9ca3af" }}>
            2 hours ago
          </span>
        </div>

        <p style={{ margin: 0, fontSize: 22, fontWeight: 600, color: THEME.colors.charcoal }}>
          "Price is ₦45,000. Send money to Access Bank..."
        </p>

        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#3b82f6", fontSize: 18, fontWeight: 900 }}>✓✓</span>
          <span style={{ fontSize: 14, fontFamily: THEME.typography.mono, color: THEME.colors.primary, fontWeight: 800 }}>
            Read · No response received
          </span>
        </div>
      </div>
    </div>
  );
};
