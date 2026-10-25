import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { THEME } from "../theme";
import { Caption } from "../components/Caption";
import { PhoneMockup } from "../components/PhoneMockup";

export const Scene2Form: React.FC = () => {
  const frame = useCurrentFrame();

  // Camera drift / push
  const cameraScale = interpolate(frame, [0, 270], [1, 1.08], {
    extrapolateRight: "clamp",
    easing: THEME.easing.easeInOut,
  });

  // Entrance tilt
  const tiltProgress = interpolate(frame, [0, 40], [0, 1], {
    extrapolateRight: "clamp",
    easing: THEME.easing.easeOut,
  });
  const rotateX = interpolate(tiltProgress, [0, 1], [18, 0]);
  const enterY = interpolate(tiltProgress, [0, 1], [160, 0]);

  // Customer name typing (frames 20 to 80)
  const customerName = "Chinedu Okafor";
  const nameChars = Math.floor(
    interpolate(frame, [20, 80], [0, customerName.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Item name typing (frames 90 to 150)
  const itemName = "2× Luxury Adire Fabric";
  const itemChars = Math.floor(
    interpolate(frame, [90, 150], [0, itemName.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Amount rolling counter (frames 130 to 200)
  const currentAmount = Math.floor(
    interpolate(frame, [130, 200], [0, 35000], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: THEME.easing.easeOut,
    })
  );

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
        text="Type the order in *twenty seconds*."
        durationInFrames={270}
      />

      <PhoneMockup
        scale={cameraScale}
        translateY={enterY}
        rotateX={rotateX}
      >
        {/* Proofa App Header */}
        <div
          style={{
            padding: "54px 32px 24px",
            background: "#ffffff",
            borderBottom: `1px solid ${THEME.colors.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: THEME.colors.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 900,
                fontSize: 22,
                fontFamily: THEME.typography.heading,
              }}
            >
              P
            </div>
            <div>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: THEME.typography.mono,
                  textTransform: "uppercase",
                  color: THEME.colors.muted,
                  letterSpacing: "0.1em",
                  display: "block",
                }}
              >
                PROOFA DOCS
              </span>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  fontFamily: THEME.typography.heading,
                  margin: 0,
                  color: THEME.colors.charcoal,
                }}
              >
                New Receipt
              </h2>
            </div>
          </div>

          <span
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              background: THEME.colors.greenLight,
              color: THEME.colors.green,
              fontSize: 13,
              fontFamily: THEME.typography.mono,
              fontWeight: 800,
            }}
          >
            ACTIVE
          </span>
        </div>

        {/* Form Body */}
        <div
          style={{
            padding: 32,
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {/* Customer Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label
              style={{
                fontSize: 13,
                fontFamily: THEME.typography.mono,
                textTransform: "uppercase",
                color: THEME.colors.muted,
                fontWeight: 700,
                letterSpacing: "0.08em",
              }}
            >
              Customer Name
            </label>
            <div
              style={{
                background: "#ffffff",
                border: `1.5px solid ${frame > 20 && frame < 90 ? THEME.colors.primary : THEME.colors.border}`,
                borderRadius: 18,
                padding: "20px 24px",
                fontSize: 22,
                fontWeight: 600,
                color: THEME.colors.charcoal,
                fontFamily: THEME.typography.sans,
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              }}
            >
              {customerName.slice(0, nameChars)}
              {frame >= 20 && frame < 85 && (
                <span
                  style={{
                    display: "inline-block",
                    width: 2.5,
                    height: 24,
                    background: THEME.colors.primary,
                    marginLeft: 4,
                    verticalAlign: "middle",
                  }}
                />
              )}
            </div>
          </div>

          {/* Item Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label
              style={{
                fontSize: 13,
                fontFamily: THEME.typography.mono,
                textTransform: "uppercase",
                color: THEME.colors.muted,
                fontWeight: 700,
                letterSpacing: "0.08em",
              }}
            >
              Item / Service
            </label>
            <div
              style={{
                background: "#ffffff",
                border: `1.5px solid ${frame > 90 && frame < 150 ? THEME.colors.primary : THEME.colors.border}`,
                borderRadius: 18,
                padding: "20px 24px",
                fontSize: 22,
                fontWeight: 600,
                color: THEME.colors.charcoal,
                fontFamily: THEME.typography.sans,
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              }}
            >
              {itemName.slice(0, itemChars)}
              {frame >= 90 && frame < 155 && (
                <span
                  style={{
                    display: "inline-block",
                    width: 2.5,
                    height: 24,
                    background: THEME.colors.primary,
                    marginLeft: 4,
                    verticalAlign: "middle",
                  }}
                />
              )}
            </div>
          </div>

          {/* Amount Display Card */}
          <div
            style={{
              marginTop: 12,
              background: "#ffffff",
              border: `1.5px solid ${THEME.colors.border}`,
              borderRadius: 24,
              padding: "28px 32px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 13,
                  fontFamily: THEME.typography.mono,
                  textTransform: "uppercase",
                  color: THEME.colors.muted,
                  fontWeight: 700,
                  display: "block",
                }}
              >
                Total Payable
              </span>
              <span
                style={{
                  fontSize: 42,
                  fontWeight: 900,
                  fontFamily: THEME.typography.heading,
                  color: THEME.colors.charcoal,
                  letterSpacing: "-0.02em",
                }}
              >
                ₦{currentAmount.toLocaleString()}
              </span>
            </div>

            <div
              style={{
                padding: "8px 16px",
                borderRadius: 14,
                background: THEME.colors.primaryLight,
                color: THEME.colors.primary,
                fontSize: 14,
                fontFamily: THEME.typography.mono,
                fontWeight: 800,
              }}
            >
              NGN
            </div>
          </div>
        </div>
      </PhoneMockup>
    </div>
  );
};
