import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { THEME } from "../theme";
import { Caption } from "../components/Caption";
import { PhoneMockup } from "../components/PhoneMockup";

export const Scene3VaultCatalog: React.FC = () => {
  const frame = useCurrentFrame();

  // Part 1: Customer Selected at frame 60
  const isCustomerSelected = frame >= 60;
  const customerPop = interpolate(frame, [60, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: THEME.easing.pop,
  });

  // Part 2: Bank Vault Tapped at frame 120
  const isBankTapped = frame >= 120;
  const bankPop = interpolate(frame, [120, 145], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: THEME.easing.pop,
  });

  const rippleProgress = interpolate(frame, [120, 150], [0, 1], {
    extrapolateLeft: "clamp",
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
      }}
    >
      <Caption
        text="1-tap *Bank Vault* and saved clients."
        durationInFrames={210}
      />

      <PhoneMockup scale={1.05}>
        {/* Header */}
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
              SMART AUTOMATION
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
              Client & Vault Hub
            </h2>
          </div>

          <span
            style={{
              padding: "4px 12px",
              borderRadius: 16,
              background: THEME.colors.greenLight,
              color: THEME.colors.green,
              fontSize: 12,
              fontFamily: THEME.typography.mono,
              fontWeight: 800,
            }}
          >
            AUTO-SYNC
          </span>
        </div>

        <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Feature 1: Address Book / Customer auto-select */}
          <div>
            <label
              style={{
                fontSize: 12,
                fontFamily: THEME.typography.mono,
                textTransform: "uppercase",
                color: THEME.colors.muted,
                fontWeight: 700,
                display: "block",
                marginBottom: 8,
              }}
            >
              1. Saved Customer Directory
            </label>

            {!isCustomerSelected ? (
              <div
                style={{
                  background: "#ffffff",
                  border: `1.5px solid ${THEME.colors.primary}`,
                  borderRadius: 18,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 4px 14px rgba(232, 89, 12, 0.12)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18, color: THEME.colors.primary }}>🔍</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: THEME.colors.charcoal }}>
                    Amina Lawal
                  </span>
                </div>
                <span style={{ fontSize: 11, fontFamily: THEME.typography.mono, color: THEME.colors.primary, fontWeight: 800 }}>
                  TAP TO SELECT
                </span>
              </div>
            ) : (
              <div
                style={{
                  background: "#ffffff",
                  border: `1.5px solid ${THEME.colors.green}`,
                  borderRadius: 18,
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transform: `scale(${customerPop})`,
                  boxShadow: "0 4px 16px rgba(52, 101, 56, 0.1)",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: THEME.colors.charcoal }}>
                      Amina Lawal
                    </span>
                    <span style={{ fontSize: 11, color: THEME.colors.green, fontWeight: 900 }}>
                      ✓ VERIFIED CLIENT
                    </span>
                  </div>
                  <span style={{ fontSize: 13, color: THEME.colors.muted, fontFamily: THEME.typography.mono }}>
                    0803 123 4567 · 14 previous orders
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Feature 2: Bank Vault 1-Tap */}
          <div>
            <label
              style={{
                fontSize: 12,
                fontFamily: THEME.typography.mono,
                textTransform: "uppercase",
                color: THEME.colors.muted,
                fontWeight: 700,
                display: "block",
                marginBottom: 8,
              }}
            >
              2. 1-Tap Bank Account Vault
            </label>

            <div
              style={{
                background: isBankTapped ? THEME.colors.primaryLight : "#ffffff",
                border: `2px solid ${isBankTapped ? THEME.colors.primary : THEME.colors.border}`,
                borderRadius: 20,
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "relative",
                overflow: "hidden",
                boxShadow: isBankTapped ? "0 8px 24px rgba(232, 89, 12, 0.15)" : "none",
                transform: `scale(${isBankTapped ? bankPop : 1})`,
              }}
            >
              <div>
                <span style={{ fontSize: 18, fontWeight: 800, color: THEME.colors.charcoal, display: "block" }}>
                  Access Bank PLC
                </span>
                <span style={{ fontSize: 14, fontFamily: THEME.typography.mono, color: THEME.colors.muted }}>
                  0124991823 · Amina Luxury Fabrics
                </span>
              </div>

              <div
                style={{
                  padding: "8px 16px",
                  borderRadius: 12,
                  background: isBankTapped ? THEME.colors.primary : "#f4f4f5",
                  color: isBankTapped ? "#ffffff" : THEME.colors.charcoal,
                  fontSize: 12,
                  fontFamily: THEME.typography.mono,
                  fontWeight: 900,
                }}
              >
                {isBankTapped ? "LOCKED IN" : "1-TAP INSERT"}
              </div>

              {/* Tap Ripple */}
              {isBankTapped && (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: 100,
                    height: 100,
                    marginLeft: -50,
                    marginTop: -50,
                    borderRadius: "50%",
                    background: THEME.colors.primary,
                    transform: `scale(${interpolate(rippleProgress, [0, 1], [0.3, 2.5])})`,
                    opacity: interpolate(rippleProgress, [0, 1], [0.5, 0]),
                    pointerEvents: "none",
                  }}
                />
              )}
            </div>
          </div>

          {/* Value Banner */}
          <div
            style={{
              marginTop: 12,
              background: "#18181b",
              borderRadius: 20,
              padding: "20px 24px",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <span style={{ fontSize: 11, fontFamily: THEME.typography.mono, color: THEME.colors.primary, fontWeight: 800 }}>
                TIME SAVED PER SALE
              </span>
              <div style={{ fontSize: 20, fontWeight: 800, fontFamily: THEME.typography.heading }}>
                Zero Typing. Instant Send.
              </div>
            </div>
            <span style={{ fontSize: 28 }}>⚡</span>
          </div>
        </div>
      </PhoneMockup>
    </div>
  );
};
