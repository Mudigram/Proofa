import React from "react";
import { interpolate, staticFile, useCurrentFrame } from "remotion";
import { THEME } from "../theme";
import { Caption } from "../components/Caption";
import { PhoneMockup } from "../components/PhoneMockup";

export const Scene2Templates: React.FC = () => {
  const frame = useCurrentFrame();

  // Template switch index:
  // 0: Minimalist (0 to 65f)
  // 1: Bold (65 to 135f)
  // 2: Classic (135 to 210f)
  let activeTemplate = 0;
  if (frame >= 65 && frame < 135) activeTemplate = 1;
  if (frame >= 135) activeTemplate = 2;

  // Slide offset between templates
  const slideProgress = interpolate(
    activeTemplate === 1 ? frame - 65 : activeTemplate === 2 ? frame - 135 : frame,
    [0, 18],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: THEME.easing.easeOut }
  );

  const cardTranslateX = interpolate(slideProgress, [0, 1], [60, 0]);
  const cardOpacity = interpolate(slideProgress, [0, 1], [0.4, 1]);

  // Logo upload pop: frame 110 to 140
  const hasLogo = frame >= 110;
  const logoPop = interpolate(frame, [110, 130], [0, 1], {
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
      }}
    >
      <Caption
        text="Pick a style. Add *your logo*."
        durationInFrames={210}
      />

      <PhoneMockup scale={1.05}>
        {/* Template Selector Top Header */}
        <div
          style={{
            padding: "54px 32px 18px",
            background: "#ffffff",
            borderBottom: `1px solid ${THEME.colors.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <span
              style={{
                fontSize: 11,
                fontFamily: THEME.typography.mono,
                textTransform: "uppercase",
                color: THEME.colors.muted,
                letterSpacing: "0.1em",
              }}
            >
              BRAND STYLES
            </span>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 900,
                fontFamily: THEME.typography.heading,
                margin: 0,
                color: THEME.colors.charcoal,
              }}
            >
              {activeTemplate === 0 ? "Minimalist" : activeTemplate === 1 ? "Bold Accent" : "Classic Formal"}
            </h2>
          </div>

          {/* Logo badge indicator */}
          <div
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              background: hasLogo ? THEME.colors.primaryLight : "#f4f4f5",
              color: hasLogo ? THEME.colors.primary : THEME.colors.muted,
              fontSize: 12,
              fontFamily: THEME.typography.mono,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {hasLogo ? "✓ LOGO ATTACHED" : "+ ADD LOGO"}
          </div>
        </div>

        {/* Template Pills Bar */}
        <div style={{ padding: "18px 32px 10px", display: "flex", gap: 8 }}>
          {(["Minimalist", "Bold", "Classic"] as const).map((name, idx) => (
            <div
              key={name}
              style={{
                flex: 1,
                padding: "10px 4px",
                borderRadius: 14,
                background: activeTemplate === idx ? THEME.colors.charcoal : "#ffffff",
                color: activeTemplate === idx ? "#ffffff" : THEME.colors.muted,
                border: `1px solid ${activeTemplate === idx ? THEME.colors.charcoal : THEME.colors.border}`,
                textAlign: "center",
                fontSize: 13,
                fontFamily: THEME.typography.heading,
                fontWeight: 800,
              }}
            >
              {name}
            </div>
          ))}
        </div>

        {/* Sliding Template Stage */}
        <div style={{ padding: "12px 32px 32px", flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Template Card 1: Minimalist */}
          {activeTemplate === 0 && (
            <div
              style={{
                flex: 1,
                background: "#ffffff",
                border: `1.5px solid ${THEME.colors.border}`,
                borderRadius: 28,
                padding: 32,
                boxShadow: "0 12px 36px rgba(0,0,0,0.06)",
                transform: `translateX(${cardTranslateX}px)`,
                opacity: cardOpacity,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                  <div>
                    <h3 style={{ fontSize: 26, fontWeight: 900, margin: 0, fontFamily: THEME.typography.heading }}>
                      Amina Luxury Wigs
                    </h3>
                    <span style={{ fontSize: 13, color: THEME.colors.muted, fontFamily: THEME.typography.mono }}>
                      Lekki Phase 1, Lagos
                    </span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, fontFamily: THEME.typography.mono, color: THEME.colors.primary }}>
                    #PRF-0082
                  </span>
                </div>

                <div style={{ borderTop: `1px solid ${THEME.colors.border}`, padding: "18px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700 }}>
                    <span>1× 30” Bone Straight Frontal</span>
                    <span style={{ fontFamily: THEME.typography.mono }}>₦145,000</span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: `1.5px dashed ${THEME.colors.border}`, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 14, fontFamily: THEME.typography.mono, color: THEME.colors.muted }}>Amount Paid</span>
                <span style={{ fontSize: 32, fontWeight: 900, fontFamily: THEME.typography.heading, color: THEME.colors.charcoal }}>
                  ₦145,000
                </span>
              </div>
            </div>
          )}

          {/* Template Card 2: Bold Accent (with Logo Pop) */}
          {activeTemplate === 1 && (
            <div
              style={{
                flex: 1,
                background: "#ffffff",
                borderRadius: 28,
                boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
                transform: `translateX(${cardTranslateX}px)`,
                opacity: cardOpacity,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                border: `1px solid ${THEME.colors.border}`,
              }}
            >
              {/* Bold Burnt Orange Top Header */}
              <div
                style={{
                  background: THEME.colors.primary,
                  padding: "28px 32px",
                  color: "#ffffff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <span style={{ fontSize: 12, fontFamily: THEME.typography.mono, textTransform: "uppercase", opacity: 0.9 }}>
                    OFFICIAL INVOICE
                  </span>
                  <h3 style={{ fontSize: 26, fontWeight: 900, margin: "2px 0 0", fontFamily: THEME.typography.heading }}>
                    Amina Luxury Wigs
                  </h3>
                </div>

                {/* Animated Attached Logo */}
                {hasLogo && (
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      background: "#ffffff",
                      padding: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transform: `scale(${logoPop})`,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                    }}
                  >
                    <img
                      src={staticFile("logo.png")}
                      alt="Logo"
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  </div>
                )}
              </div>

              {/* Bold Card Body */}
              <div style={{ padding: 32, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700 }}>
                    <span>1× 30” Bone Straight Frontal</span>
                    <span style={{ fontFamily: THEME.typography.mono }}>₦145,000</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: THEME.colors.muted }}>
                    <span>Delivery: DHL Express</span>
                    <span style={{ fontFamily: THEME.typography.mono }}>₦5,000</span>
                  </div>
                </div>

                <div style={{ borderTop: `2px solid ${THEME.colors.charcoal}`, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 14, fontFamily: THEME.typography.mono, fontWeight: 800 }}>GRAND TOTAL</span>
                  <span style={{ fontSize: 34, fontWeight: 900, fontFamily: THEME.typography.heading, color: THEME.colors.primary }}>
                    ₦150,000
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Template Card 3: Classic */}
          {activeTemplate === 2 && (
            <div
              style={{
                flex: 1,
                background: "#fefefe",
                border: `2px solid #27272a`,
                borderRadius: 28,
                padding: 32,
                boxShadow: "0 12px 36px rgba(0,0,0,0.06)",
                transform: `translateX(${cardTranslateX}px)`,
                opacity: cardOpacity,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ textAlign: "center", borderBottom: `2px solid #27272a`, paddingBottom: 18, marginBottom: 20 }}>
                  <h3 style={{ fontSize: 24, fontWeight: 900, margin: 0, fontFamily: "serif", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Amina Luxury Wigs
                  </h3>
                  <span style={{ fontSize: 11, fontFamily: THEME.typography.mono, color: THEME.colors.muted }}>
                    COMMERCIAL INVOICE · NO: PRF-2026-90
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 600 }}>
                  <span>1× 30” Bone Straight Frontal</span>
                  <span style={{ fontFamily: THEME.typography.mono }}>₦145,000</span>
                </div>
              </div>

              <div style={{ borderTop: `2px solid #27272a`, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 14, fontFamily: THEME.typography.mono, fontWeight: 800 }}>NET PAYABLE</span>
                <span style={{ fontSize: 32, fontWeight: 900, fontFamily: THEME.typography.heading }}>₦150,000</span>
              </div>
            </div>
          )}
        </div>
      </PhoneMockup>
    </div>
  );
};
