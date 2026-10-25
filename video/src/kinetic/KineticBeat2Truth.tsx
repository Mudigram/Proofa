import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { THEME } from "../theme";

export const KineticBeat2Truth: React.FC = () => {
  const frame = useCurrentFrame();

  // Part 1: Pain agitation (f0 to f110)
  // Part 2: Solution truth (f110 to f240)
  const isPart2 = frame >= 110;

  // Part 1 Animations
  const strikeProgress = interpolate(frame, [45, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: THEME.easing.easeOut,
  });

  // Part 2 Animations
  const part2Enter = interpolate(frame, [110, 135], [0, 1], {
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
        padding: "180px 80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {!isPart2 ? (
        /* ── Part 1: The Problem ── */
        <>
          <div>
            <span
              style={{
                fontFamily: THEME.typography.mono,
                fontSize: 18,
                fontWeight: 800,
                color: "#dc2626",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                display: "inline-block",
                padding: "8px 20px",
                background: "#fef2f2",
                borderRadius: 24,
              }}
            >
              BUYER PSYCHOLOGY
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontFamily: THEME.typography.heading,
                fontSize: 78,
                fontWeight: 900,
                color: THEME.colors.charcoal,
                lineHeight: 1.08,
                letterSpacing: "-0.04em",
              }}
            >
              Messy WhatsApp text
            </div>
            <div
              style={{
                fontFamily: THEME.typography.heading,
                fontSize: 82,
                fontWeight: 900,
                color: "#dc2626",
                lineHeight: 1.08,
                letterSpacing: "-0.04em",
                position: "relative",
                display: "inline-block",
              }}
            >
              feels risky to buyers.
              {/* Red strikeout line */}
              {strikeProgress > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    width: `${strikeProgress * 100}%`,
                    height: 8,
                    background: "#dc2626",
                    borderRadius: 4,
                  }}
                />
              )}
            </div>
          </div>

          {/* Micro Card: The Messy Text example */}
          <div
            style={{
              background: "#f4f4f5",
              borderRadius: 24,
              padding: "24px 32px",
              border: `1.5px dashed #d4d4d8`,
            }}
          >
            <span style={{ fontSize: 13, fontFamily: THEME.typography.mono, color: "#71717a", display: "block", marginBottom: 6 }}>
              UNOFFICIAL & UNTRUSTED
            </span>
            <p style={{ margin: 0, fontSize: 20, fontFamily: THEME.typography.mono, color: "#18181b" }}>
              "Pls pay 45k to 0124991823 GTB thanks"
            </p>
          </div>
        </>
      ) : (
        /* ── Part 2: The Solution Truth ── */
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transform: `scale(${part2Enter})`,
            opacity: part2Enter,
          }}
        >
          <div>
            <span
              style={{
                fontFamily: THEME.typography.mono,
                fontSize: 18,
                fontWeight: 800,
                color: THEME.colors.green,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                display: "inline-block",
                padding: "8px 20px",
                background: THEME.colors.greenLight,
                borderRadius: 24,
              }}
            >
              THE SOLUTION
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontFamily: THEME.typography.heading,
                fontSize: 80,
                fontWeight: 900,
                color: THEME.colors.charcoal,
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
              }}
            >
              Structured documents
            </div>
            <div
              style={{
                fontFamily: THEME.typography.heading,
                fontSize: 88,
                fontWeight: 900,
                color: THEME.colors.primary,
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
              }}
            >
              create instant trust.
            </div>
          </div>

          {/* Value pill */}
          <div
            style={{
              background: THEME.colors.charcoal,
              color: "#ffffff",
              borderRadius: 24,
              padding: "28px 36px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 16px 40px rgba(0,0,0,0.15)",
            }}
          >
            <div>
              <span style={{ fontSize: 13, fontFamily: THEME.typography.mono, color: THEME.colors.primary, fontWeight: 800 }}>
                PERCEPTION = SALES
              </span>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: THEME.typography.heading, marginTop: 4 }}>
                Look legitimate from the first tap.
              </div>
            </div>
            <span style={{ fontSize: 32 }}>⚡</span>
          </div>
        </div>
      )}
    </div>
  );
};
