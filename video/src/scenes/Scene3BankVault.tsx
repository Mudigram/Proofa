import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { THEME } from "../theme";
import { Caption } from "../components/Caption";
import { PhoneMockup } from "../components/PhoneMockup";

export const Scene3BankVault: React.FC = () => {
  const frame = useCurrentFrame();

  // Cursor glide animation: frame 20 to 65
  const cursorProgress = interpolate(frame, [20, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: THEME.easing.easeInOut,
  });

  const cursorX = interpolate(cursorProgress, [0, 1], [400, 260]);
  const cursorY = interpolate(cursorProgress, [0, 1], [680, 480]);

  // Click pulse & ripple at frame 68
  const isClicked = frame >= 68;
  const clickScale = interpolate(frame, [65, 68, 75], [1, 0.88, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rippleProgress = interpolate(frame, [68, 95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rippleScale = interpolate(rippleProgress, [0, 1], [0.5, 2.2]);
  const rippleOpacity = interpolate(rippleProgress, [0, 1], [0.6, 0]);

  // Bank details reveal pop: frame 72 to 105
  const popProgress = interpolate(frame, [72, 105], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: THEME.easing.pop,
  });

  const detailsScale = interpolate(popProgress, [0, 1], [0.92, 1]);
  const detailsOpacity = interpolate(popProgress, [0, 1], [0, 1]);

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
        text="Tap your *Bank Vault* once."
        durationInFrames={240}
      />

      <PhoneMockup scale={1.08}>
        {/* Header */}
        <div
          style={{
            padding: "54px 32px 20px",
            background: "#ffffff",
            borderBottom: `1px solid ${THEME.colors.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span
              style={{
                fontFamily: THEME.typography.mono,
                fontSize: 14,
                fontWeight: 800,
                color: THEME.colors.primary,
                letterSpacing: "0.1em",
              }}
            >
              STEP 2 OF 2
            </span>
          </div>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: 20,
              background: THEME.colors.primaryLight,
              color: THEME.colors.primary,
              fontSize: 12,
              fontFamily: THEME.typography.mono,
              fontWeight: 800,
            }}
          >
            PRO VAULT
          </span>
        </div>

        {/* Bank Selection Section */}
        <div
          style={{
            padding: 32,
            display: "flex",
            flexDirection: "column",
            gap: 24,
            position: "relative",
          }}
        >
          <div>
            <label
              style={{
                fontSize: 13,
                fontFamily: THEME.typography.mono,
                textTransform: "uppercase",
                color: THEME.colors.muted,
                fontWeight: 700,
                letterSpacing: "0.08em",
                display: "block",
                marginBottom: 12,
              }}
            >
              1-Tap Bank Accounts
            </label>

            {/* Quick Select Bank Chips */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Target Chip: Access Bank */}
              <div
                style={{
                  padding: "18px 24px",
                  borderRadius: 18,
                  background: isClicked ? THEME.colors.primaryLight : "#ffffff",
                  border: `2px solid ${isClicked ? THEME.colors.primary : THEME.colors.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transform: `scale(${clickScale})`,
                  transition: "background 0.1s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div>
                  <span
                    style={{
                      fontFamily: THEME.typography.sans,
                      fontSize: 20,
                      fontWeight: 800,
                      color: THEME.colors.charcoal,
                      display: "block",
                    }}
                  >
                    Access Bank
                  </span>
                  <span
                    style={{
                      fontFamily: THEME.typography.mono,
                      fontSize: 14,
                      color: THEME.colors.muted,
                    }}
                  >
                    0124991823 · Amina Luxury Fabrics
                  </span>
                </div>

                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    border: `2px solid ${isClicked ? THEME.colors.primary : THEME.colors.subtle}`,
                    background: isClicked ? THEME.colors.primary : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isClicked && (
                    <span style={{ color: "#fff", fontSize: 14, fontWeight: 900 }}>
                      ✓
                    </span>
                  )}
                </div>

                {/* Expanding click ripple */}
                {isClicked && (
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      width: 80,
                      height: 80,
                      marginLeft: -40,
                      marginTop: -40,
                      borderRadius: "50%",
                      background: THEME.colors.primary,
                      transform: `scale(${rippleScale})`,
                      opacity: rippleOpacity,
                      pointerEvents: "none",
                    }}
                  />
                )}
              </div>

              {/* Second chip: GTBank */}
              <div
                style={{
                  padding: "18px 24px",
                  borderRadius: 18,
                  background: "#ffffff",
                  border: `1.5px solid ${THEME.colors.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  opacity: 0.7,
                }}
              >
                <div>
                  <span
                    style={{
                      fontFamily: THEME.typography.sans,
                      fontSize: 20,
                      fontWeight: 700,
                      color: THEME.colors.charcoal,
                      display: "block",
                    }}
                  >
                    Guaranty Trust Bank
                  </span>
                  <span
                    style={{
                      fontFamily: THEME.typography.mono,
                      fontSize: 14,
                      color: THEME.colors.muted,
                    }}
                  >
                    2041882001 · Primary Store
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Auto-filled verification preview box */}
          {isClicked && (
            <div
              style={{
                marginTop: 8,
                background: THEME.colors.greenLight,
                border: `1.5px solid ${THEME.colors.green}`,
                borderRadius: 20,
                padding: "20px 24px",
                transform: `scale(${detailsScale})`,
                opacity: detailsOpacity,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    color: THEME.colors.green,
                    fontWeight: 900,
                    fontSize: 16,
                  }}
                >
                  ✓ ACCOUNT ATTACHED
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontFamily: THEME.typography.sans,
                  color: THEME.colors.green,
                  fontWeight: 600,
                }}
              >
                Account number and recipient name locked into receipt automatically.
              </p>
            </div>
          )}
        </div>

        {/* Floating cursor */}
        <div
          style={{
            position: "absolute",
            left: cursorX,
            top: cursorY,
            width: 38,
            height: 38,
            pointerEvents: "none",
            zIndex: 99,
          }}
        >
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 4L10.5 20L13.5 13.5L20 10.5L4 4Z"
              fill={THEME.colors.charcoal}
              stroke="#ffffff"
              strokeWidth="2"
            />
          </svg>
        </div>
      </PhoneMockup>
    </div>
  );
};
