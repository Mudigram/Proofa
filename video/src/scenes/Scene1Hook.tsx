import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { THEME } from "../theme";
import { Caption } from "../components/Caption";

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();

  // Inbound WhatsApp bubble entrance: frame 15 to 45
  const bubbleEnter = interpolate(frame, [15, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: THEME.easing.pop,
  });

  const bubbleScale = interpolate(bubbleEnter, [0, 1], [0.85, 1]);
  const bubbleY = interpolate(bubbleEnter, [0, 1], [30, 0]);
  const bubbleOpacity = interpolate(bubbleEnter, [0, 1], [0, 1]);

  // Typing response text simulation: frames 60 to 140
  const typedText = "Thanks for buying 2 Adire fa...";
  const charsTyped = Math.floor(
    interpolate(frame, [60, 130], [0, typedText.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Red strikeout line over typed text: frame 140 to 170
  const strikeProgress = interpolate(frame, [140, 165], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: THEME.easing.easeOut,
  });

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        background: THEME.colors.background,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Caption
        text="*Stop typing receipts* as messy WhatsApp text."
        durationInFrames={210}
      />

      {/* WhatsApp Chat Simulation Card */}
      <div
        style={{
          position: "absolute",
          top: 480,
          left: 100,
          right: 100,
          height: 980,
          borderRadius: 40,
          background: THEME.colors.whatsappBg,
          boxShadow: "0 24px 60px rgba(0,0,0,0.08)",
          border: `1px solid ${THEME.colors.border}`,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* WhatsApp Header Bar */}
        <div
          style={{
            height: 120,
            background: "#075E54",
            padding: "0 36px",
            display: "flex",
            alignItems: "center",
            gap: 20,
            color: "#ffffff",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#128C7E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 22,
            }}
          >
            CO
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>Chinedu Okafor</div>
            <div style={{ fontSize: 16, opacity: 0.85 }}>online</div>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div
          style={{
            flex: 1,
            padding: "48px 36px",
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}
        >
          {/* Incoming Customer Message Bubble */}
          <div
            style={{
              alignSelf: "flex-start",
              maxWidth: "80%",
              background: "#ffffff",
              borderRadius: "18px 18px 18px 4px",
              padding: "24px 28px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              transform: `scale(${bubbleScale}) translateY(${bubbleY}px)`,
              opacity: bubbleOpacity,
              transformOrigin: "bottom left",
            }}
          >
            <p
              style={{
                fontFamily: THEME.typography.sans,
                fontSize: 26,
                fontWeight: 600,
                color: "#111827",
                lineHeight: 1.4,
                margin: 0,
              }}
            >
              Sent ₦35,000 to your Access bank now. Pls send receipt 🙏
            </p>
            <span
              style={{
                display: "block",
                textAlign: "right",
                fontSize: 16,
                color: "#9ca3af",
                marginTop: 8,
              }}
            >
              14:22
            </span>
          </div>

          {/* Seller Messy Draft Bubble */}
          {frame >= 60 && (
            <div
              style={{
                alignSelf: "flex-end",
                maxWidth: "80%",
                background: "#E7FFDB",
                borderRadius: "18px 18px 4px 18px",
                padding: "24px 28px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                position: "relative",
              }}
            >
              <p
                style={{
                  fontFamily: THEME.typography.sans,
                  fontSize: 26,
                  fontWeight: 600,
                  color: "#111827",
                  lineHeight: 1.4,
                  margin: 0,
                  position: "relative",
                }}
              >
                {typedText.slice(0, charsTyped)}
                {/* Blinking cursor */}
                <span
                  style={{
                    display: "inline-block",
                    width: 3,
                    height: 28,
                    background: "#075E54",
                    marginLeft: 4,
                    verticalAlign: "middle",
                    opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                  }}
                />
              </p>

              {/* Red Strikeout line */}
              {strikeProgress > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: 20,
                    width: `${strikeProgress * 85}%`,
                    height: 4,
                    background: "#dc2626",
                    borderRadius: 2,
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
