import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { THEME } from "../theme";

export const KineticBeat3Solution: React.FC = () => {
  const frame = useCurrentFrame();

  // Floating card 3D entrance: frames 10 to 45
  const cardEnter = interpolate(frame, [10, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: THEME.easing.easeOut,
  });

  // Green PAID stamp pop: frames 50 to 75
  const stampPop = interpolate(frame, [50, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: THEME.easing.pop,
  });

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        background: THEME.colors.background,
        position: "relative",
        overflow: "hidden",
        padding: "140px 80px 80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        perspective: 1200,
      }}
    >
      {/* Top Headline */}
      <div>
        <span
          style={{
            fontFamily: THEME.typography.mono,
            fontSize: 16,
            fontWeight: 800,
            color: THEME.colors.primary,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            display: "inline-block",
            padding: "8px 20px",
            background: THEME.colors.primaryLight,
            borderRadius: 24,
            marginBottom: 16,
          }}
        >
          THE PROOFA STANDARD
        </span>

        <h2
          style={{
            fontFamily: THEME.typography.heading,
            fontSize: 64,
            fontWeight: 900,
            color: THEME.colors.charcoal,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            margin: 0,
          }}
        >
          Official invoices before they pay. <span style={{ color: THEME.colors.primary }}>Stamped receipts after.</span>
        </h2>
      </div>

      {/* Floating 3D Receipt Prop */}
      <div
        style={{
          background: "#ffffff",
          border: `1.5px solid ${THEME.colors.border}`,
          borderRadius: 32,
          padding: 44,
          boxShadow: "0 32px 80px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(0,0,0,0.04)",
          transform: `translateY(${interpolate(cardEnter, [0, 1], [80, 0])}px) scale(${interpolate(
            cardEnter,
            [0, 1],
            [0.9, 1]
          )}) rotateX(${interpolate(cardEnter, [0, 1], [14, 0])}deg)`,
          opacity: cardEnter,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <span style={{ fontSize: 12, fontFamily: THEME.typography.mono, color: THEME.colors.primary, fontWeight: 800 }}>
              TAX INVOICE & RECEIPT
            </span>
            <h3 style={{ fontSize: 30, fontWeight: 900, fontFamily: THEME.typography.heading, margin: "2px 0" }}>
              Amina Luxury Fabrics
            </h3>
            <span style={{ fontSize: 13, color: THEME.colors.muted }}>Customer: Chinedu Okafor</span>
          </div>

          {/* Stamped PAID badge */}
          <div
            style={{
              padding: "10px 22px",
              borderRadius: 14,
              border: `3px solid ${THEME.colors.green}`,
              background: THEME.colors.greenLight,
              transform: `scale(${stampPop}) rotate(-10deg)`,
            }}
          >
            <span style={{ color: THEME.colors.green, fontWeight: 900, fontSize: 22, fontFamily: THEME.typography.heading }}>
              PAID
            </span>
          </div>
        </div>

        <div style={{ background: "#fafafa", borderRadius: 18, padding: 20, display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>2× Luxury Adire Fabric</span>
          <span style={{ fontFamily: THEME.typography.mono, fontWeight: 800 }}>₦35,000.00</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: `1px solid ${THEME.colors.border}`, paddingTop: 16 }}>
          <span style={{ fontSize: 14, fontFamily: THEME.typography.mono, color: THEME.colors.muted }}>Net Verified Total</span>
          <span style={{ fontSize: 38, fontWeight: 900, fontFamily: THEME.typography.heading, color: THEME.colors.primary }}>
            ₦35,000.00
          </span>
        </div>
      </div>

      {/* Bottom Subtitle / Speed Stat */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px" }}>
        <span style={{ fontSize: 16, fontFamily: THEME.typography.mono, color: THEME.colors.muted, fontWeight: 700 }}>
          ⚡ 20 seconds on your phone
        </span>
        <span style={{ fontSize: 16, fontFamily: THEME.typography.mono, color: THEME.colors.green, fontWeight: 800 }}>
          ✓ 100% WhatsApp Native
        </span>
      </div>
    </div>
  );
};
