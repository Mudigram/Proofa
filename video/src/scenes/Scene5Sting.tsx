import React from "react";
import { interpolate, staticFile, useCurrentFrame } from "remotion";
import { THEME } from "../theme";
import { Caption } from "../components/Caption";

export const Scene5Sting: React.FC = () => {
  const frame = useCurrentFrame();

  // Logo entrance: frame 0 to 40
  const enterProgress = interpolate(frame, [0, 40], [0, 1], {
    extrapolateRight: "clamp",
    easing: THEME.easing.easeOut,
  });

  const logoScale = interpolate(enterProgress, [0, 1], [0.8, 1]);
  const logoOpacity = interpolate(enterProgress, [0, 1], [0, 1]);
  const logoY = interpolate(enterProgress, [0, 1], [40, 0]);

  // CTA Pill entrance: frame 35 to 65
  const urlProgress = interpolate(frame, [35, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: THEME.easing.pop,
  });

  const urlScale = interpolate(urlProgress, [0, 1], [0.9, 1]);
  const urlOpacity = interpolate(urlProgress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        background: THEME.colors.background,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Caption
        text="Start free at *proofa.ng*."
        durationInFrames={210}
      />

      {/* Brand Lockup */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `scale(${logoScale}) translateY(${logoY}px)`,
          opacity: logoOpacity,
          marginTop: 80,
        }}
      >
        {/* Real Proofa Logo Image */}
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: 48,
            boxShadow: "0 24px 60px rgba(232, 89, 12, 0.25)",
            background: "#ffffff",
            padding: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 36,
          }}
        >
          <img
            src={staticFile("logo.png")}
            alt="Proofa"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>

        {/* Wordmark */}
        <h1
          style={{
            fontFamily: THEME.typography.heading,
            fontSize: 76,
            fontWeight: 900,
            color: THEME.colors.charcoal,
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
            fontSize: 24,
            fontWeight: 600,
            color: THEME.colors.muted,
            marginTop: 16,
            marginBottom: 48,
            textAlign: "center",
            maxWidth: 580,
            lineHeight: 1.4,
          }}
        >
          Receipts, invoices, and sales tracking on WhatsApp.
        </p>

        {/* Call-to-Action URL Pill */}
        <div
          style={{
            background: THEME.colors.charcoal,
            color: "#ffffff",
            padding: "22px 56px",
            borderRadius: 28,
            display: "flex",
            alignItems: "center",
            gap: 16,
            transform: `scale(${urlScale})`,
            opacity: urlOpacity,
            boxShadow: "0 16px 40px rgba(0,0,0,0.15)",
          }}
        >
          <span
            style={{
              fontFamily: THEME.typography.heading,
              fontSize: 32,
              fontWeight: 900,
              letterSpacing: "0.02em",
            }}
          >
            proofa.ng
          </span>
          <span
            style={{
              fontFamily: THEME.typography.mono,
              fontSize: 20,
              color: THEME.colors.primary,
              fontWeight: 800,
            }}
          >
            →
          </span>
        </div>
      </div>
    </div>
  );
};
