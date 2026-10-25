import React from "react";
import { interpolate, staticFile, useCurrentFrame } from "remotion";
import { THEME } from "../theme";

export const KineticBeat4Outro: React.FC = () => {
  const frame = useCurrentFrame();

  // Entrance animations
  const enterProgress = interpolate(frame, [0, 35], [0, 1], {
    extrapolateRight: "clamp",
    easing: THEME.easing.easeOut,
  });

  const logoScale = interpolate(enterProgress, [0, 1], [0.84, 1]);
  const logoOpacity = interpolate(enterProgress, [0, 1], [0, 1]);
  const logoY = interpolate(enterProgress, [0, 1], [30, 0]);

  // CTA Pill pop: frames 30 to 55
  const ctaProgress = interpolate(frame, [30, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: THEME.easing.pop,
  });

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        background: THEME.colors.charcoal,
        position: "relative",
        overflow: "hidden",
        padding: "160px 80px 100px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        textAlign: "center",
      }}
    >
      {/* Top Value Statement */}
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
            padding: "8px 24px",
            background: "rgba(232, 89, 12, 0.15)",
            borderRadius: 24,
            marginBottom: 20,
          }}
        >
          START TODAY
        </span>

        <h2
          style={{
            fontFamily: THEME.typography.heading,
            fontSize: 72,
            fontWeight: 900,
            color: "#ffffff",
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            margin: 0,
          }}
        >
          Stop typing. <br />
          <span style={{ color: THEME.colors.primary }}>Start sending.</span>
        </h2>
      </div>

      {/* Brand Icon & Wordmark Lockup */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `scale(${logoScale}) translateY(${logoY}px)`,
          opacity: logoOpacity,
        }}
      >
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: 48,
            boxShadow: "0 24px 60px rgba(232, 89, 12, 0.35)",
            background: "#ffffff",
            padding: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <img
            src={staticFile("logo.png")}
            alt="Proofa Logo"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>

        <h1
          style={{
            fontFamily: THEME.typography.heading,
            fontSize: 84,
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "-0.04em",
            margin: 0,
            lineHeight: 1,
          }}
        >
          Proofa
        </h1>

        <p
          style={{
            fontFamily: THEME.typography.sans,
            fontSize: 22,
            color: "rgba(255, 255, 255, 0.7)",
            marginTop: 16,
            marginBottom: 0,
            maxWidth: 580,
            lineHeight: 1.4,
          }}
        >
          The fastest way to send official business receipts on WhatsApp.
        </p>
      </div>

      {/* CTA Button */}
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          transform: `scale(${ctaProgress})`,
          opacity: ctaProgress,
        }}
      >
        <div
          style={{
            background: THEME.colors.primary,
            color: "#ffffff",
            padding: "24px 64px",
            borderRadius: 30,
            display: "flex",
            alignItems: "center",
            gap: 18,
            boxShadow: "0 20px 50px rgba(232, 89, 12, 0.4)",
          }}
        >
          <span
            style={{
              fontFamily: THEME.typography.heading,
              fontSize: 34,
              fontWeight: 900,
              letterSpacing: "0.02em",
            }}
          >
            proofa.ng
          </span>
          <span style={{ fontFamily: THEME.typography.mono, fontSize: 24, fontWeight: 800 }}>→</span>
        </div>

        <span style={{ fontSize: 16, fontFamily: THEME.typography.mono, color: "rgba(255,255,255,0.6)" }}>
          Free to start · No app download needed
        </span>
      </div>
    </div>
  );
};
