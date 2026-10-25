import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { THEME } from "../theme";
import { Caption } from "../components/Caption";

export const Scene4ReceiptHero: React.FC = () => {
  const frame = useCurrentFrame();

  // Receipt Card 3D entrance: frame 0 to 45
  const cardEnter = interpolate(frame, [0, 45], [0, 1], {
    extrapolateRight: "clamp",
    easing: THEME.easing.easeOut,
  });

  const cardScale = interpolate(cardEnter, [0, 1], [0.84, 1]);
  const cardRotateX = interpolate(cardEnter, [0, 1], [14, 0]);
  const cardRotateY = interpolate(cardEnter, [0, 1], [-8, 0]);
  const cardY = interpolate(cardEnter, [0, 1], [120, 0]);
  const cardOpacity = interpolate(cardEnter, [0, 1], [0, 1]);

  // Green "PAID" stamp pop: frame 50 to 80
  const stampProgress = interpolate(frame, [50, 78], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: THEME.easing.pop,
  });
  const stampScale = interpolate(stampProgress, [0, 1], [2.2, 1]);
  const stampRotate = interpolate(stampProgress, [0, 1], [-25, -12]);
  const stampOpacity = interpolate(stampProgress, [0, 1], [0, 1]);

  // Subtle continuous 3D camera drift: frame 45 to 270
  const driftScale = interpolate(frame, [45, 270], [1, 1.04], {
    extrapolateLeft: "clamp",
  });

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        background: THEME.colors.background,
        position: "relative",
        overflow: "hidden",
        perspective: 1400,
      }}
    >
      <Caption
        text="Send the *official receipt* on WhatsApp."
        durationInFrames={270}
      />

      {/* Floating 3D Minimalist Receipt Card */}
      <div
        style={{
          position: "absolute",
          top: 360,
          left: "50%",
          marginLeft: -340,
          width: 680,
          background: "#ffffff",
          borderRadius: 36,
          boxShadow:
            "0 40px 100px rgba(0,0,0,0.12), 0 4px 24px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(0,0,0,0.06)",
          padding: 56,
          display: "flex",
          flexDirection: "column",
          transform: `scale(${cardScale * driftScale}) translateY(${cardY}px) rotateX(${cardRotateX}deg) rotateY(${cardRotateY}deg)`,
          opacity: cardOpacity,
          zIndex: 30,
        }}
      >
        {/* Receipt Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: `2px dashed ${THEME.colors.border}`,
            paddingBottom: 32,
            marginBottom: 32,
          }}
        >
          <div>
            <span
              style={{
                fontFamily: THEME.typography.mono,
                fontSize: 13,
                fontWeight: 800,
                color: THEME.colors.primary,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 6,
              }}
            >
              OFFICIAL RECEIPT
            </span>
            <h2
              style={{
                fontFamily: THEME.typography.heading,
                fontSize: 34,
                fontWeight: 900,
                color: THEME.colors.charcoal,
                margin: 0,
              }}
            >
              Amina Luxury Fabrics
            </h2>
            <span
              style={{
                fontFamily: THEME.typography.mono,
                fontSize: 14,
                color: THEME.colors.muted,
              }}
            >
              Doc #PRF-2026-0891 · Lagos, NG
            </span>
          </div>

          {/* PAID Stamp with overshoot */}
          <div
            style={{
              padding: "10px 24px",
              borderRadius: 14,
              border: `3px solid ${THEME.colors.green}`,
              background: THEME.colors.greenLight,
              transform: `scale(${stampScale}) rotate(${stampRotate}deg)`,
              opacity: stampOpacity,
            }}
          >
            <span
              style={{
                fontFamily: THEME.typography.heading,
                fontSize: 24,
                fontWeight: 900,
                color: THEME.colors.green,
                letterSpacing: "0.15em",
              }}
            >
              PAID
            </span>
          </div>
        </div>

        {/* Customer & Date Meta */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginBottom: 32,
          }}
        >
          <div>
            <span
              style={{
                fontFamily: THEME.typography.mono,
                fontSize: 12,
                color: THEME.colors.muted,
                textTransform: "uppercase",
              }}
            >
              Billed To
            </span>
            <div
              style={{
                fontFamily: THEME.typography.sans,
                fontSize: 18,
                fontWeight: 700,
                color: THEME.colors.charcoal,
                marginTop: 2,
              }}
            >
              Chinedu Okafor
            </div>
          </div>
          <div>
            <span
              style={{
                fontFamily: THEME.typography.mono,
                fontSize: 12,
                color: THEME.colors.muted,
                textTransform: "uppercase",
              }}
            >
              Payment Method
            </span>
            <div
              style={{
                fontFamily: THEME.typography.sans,
                fontSize: 18,
                fontWeight: 700,
                color: THEME.colors.charcoal,
                marginTop: 2,
              }}
            >
              Bank Transfer (Verified)
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div
          style={{
            background: THEME.colors.background,
            borderRadius: 20,
            padding: 24,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 18,
              fontWeight: 700,
              fontFamily: THEME.typography.sans,
              color: THEME.colors.charcoal,
            }}
          >
            <span>2× Luxury Adire Silk Fabric</span>
            <span style={{ fontFamily: THEME.typography.mono }}>₦35,000.00</span>
          </div>
        </div>

        {/* Total Callout */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            borderTop: `1px solid ${THEME.colors.border}`,
            paddingTop: 24,
            marginBottom: 36,
          }}
        >
          <span
            style={{
              fontFamily: THEME.typography.heading,
              fontSize: 22,
              fontWeight: 800,
              color: THEME.colors.charcoal,
            }}
          >
            Total Paid
          </span>
          <span
            style={{
              fontFamily: THEME.typography.heading,
              fontSize: 46,
              fontWeight: 900,
              color: THEME.colors.primary,
              letterSpacing: "-0.02em",
            }}
          >
            ₦35,000.00
          </span>
        </div>

        {/* WhatsApp Share Button */}
        <div
          style={{
            background: THEME.colors.whatsapp,
            borderRadius: 20,
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            boxShadow: "0 8px 24px rgba(37,211,102,0.3)",
          }}
        >
          <span
            style={{
              color: "#ffffff",
              fontFamily: THEME.typography.heading,
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            ✓ Sent to WhatsApp (Instant)
          </span>
        </div>
      </div>
    </div>
  );
};
