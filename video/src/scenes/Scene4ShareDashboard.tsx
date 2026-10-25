import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { THEME } from "../theme";
import { Caption } from "../components/Caption";
import { PhoneMockup } from "../components/PhoneMockup";

export const Scene4ShareDashboard: React.FC = () => {
  const frame = useCurrentFrame();

  // Part 1: WhatsApp receipt share (frame 0 to 120)
  // Part 2: Live Business Dashboard (frame 120 to 270)
  const isDashboardView = frame >= 120;

  // WhatsApp Button Click & Paid Pop: frames 10 to 60
  const paidPop = interpolate(frame, [25, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: THEME.easing.pop,
  });

  // Dashboard transition entrance: frames 120 to 150
  const dashEnter = interpolate(frame, [120, 150], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: THEME.easing.easeOut,
  });

  // Revenue counter rolling: frames 140 to 220
  const revenueCounter = Math.floor(
    interpolate(frame, [140, 220], [0, 185000], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: THEME.easing.easeOut,
    })
  );

  // Bar chart stagger heights
  const bar1 = interpolate(frame, [150, 185], [0, 65], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: THEME.easing.pop });
  const bar2 = interpolate(frame, [158, 193], [0, 85], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: THEME.easing.pop });
  const bar3 = interpolate(frame, [166, 201], [0, 50], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: THEME.easing.pop });
  const bar4 = interpolate(frame, [174, 215], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: THEME.easing.pop });

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
        text="Send on WhatsApp. *Track sales live*."
        durationInFrames={270}
      />

      <PhoneMockup scale={1.05}>
        {!isDashboardView ? (
          /* ── Part 1: WhatsApp Receipt Delivery ── */
          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 32, justifyContent: "space-between" }}>
            <div
              style={{
                background: "#ffffff",
                border: `1.5px solid ${THEME.colors.border}`,
                borderRadius: 28,
                padding: 32,
                boxShadow: "0 16px 48px rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column",
                gap: 20,
                marginTop: 20,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={{ fontSize: 11, fontFamily: THEME.typography.mono, color: THEME.colors.primary, fontWeight: 800 }}>
                    OFFICIAL PROOF OF PAYMENT
                  </span>
                  <h3 style={{ fontSize: 26, fontWeight: 900, fontFamily: THEME.typography.heading, margin: "4px 0" }}>
                    Amina Luxury Fabrics
                  </h3>
                  <span style={{ fontSize: 13, color: THEME.colors.muted }}>Customer: Chinedu Okafor</span>
                </div>

                <div
                  style={{
                    padding: "8px 16px",
                    borderRadius: 12,
                    border: `2px solid ${THEME.colors.green}`,
                    background: THEME.colors.greenLight,
                    transform: `scale(${paidPop}) rotate(-8deg)`,
                  }}
                >
                  <span style={{ color: THEME.colors.green, fontWeight: 900, fontSize: 18, fontFamily: THEME.typography.heading }}>
                    PAID
                  </span>
                </div>
              </div>

              <div style={{ background: "#fafafa", borderRadius: 18, padding: 18, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>2× Luxury Adire Fabric</span>
                <span style={{ fontFamily: THEME.typography.mono, fontWeight: 800 }}>₦35,000.00</span>
              </div>

              <div style={{ borderTop: `1px solid ${THEME.colors.border}`, paddingTop: 16, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, fontFamily: THEME.typography.mono, color: THEME.colors.muted }}>Verified Amount</span>
                <span style={{ fontSize: 32, fontWeight: 900, fontFamily: THEME.typography.heading, color: THEME.colors.primary }}>
                  ₦35,000.00
                </span>
              </div>
            </div>

            {/* WhatsApp Send Action Button */}
            <div
              style={{
                background: THEME.colors.whatsapp,
                borderRadius: 24,
                padding: "22px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                boxShadow: "0 12px 32px rgba(37,211,102,0.35)",
              }}
            >
              <span style={{ color: "#ffffff", fontSize: 22 }}>💬</span>
              <span
                style={{
                  color: "#ffffff",
                  fontFamily: THEME.typography.heading,
                  fontSize: 20,
                  fontWeight: 900,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                ✓ Shared to WhatsApp
              </span>
            </div>
          </div>
        ) : (
          /* ── Part 2: Business Live Dashboard ── */
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: "54px 32px 32px",
              opacity: dashEnter,
              transform: `translateY(${interpolate(dashEnter, [0, 1], [40, 0])}px)`,
            }}
          >
            {/* Dashboard Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <span style={{ fontSize: 11, fontFamily: THEME.typography.mono, color: THEME.colors.primary, fontWeight: 800 }}>
                  TELEMETRY
                </span>
                <h2 style={{ fontSize: 26, fontWeight: 900, fontFamily: THEME.typography.heading, margin: 0 }}>
                  Business Dashboard
                </h2>
              </div>
              <span style={{ padding: "4px 12px", borderRadius: 16, background: THEME.colors.greenLight, color: THEME.colors.green, fontSize: 12, fontFamily: THEME.typography.mono, fontWeight: 800 }}>
                ● LIVE
              </span>
            </div>

            {/* Daily Revenue Card */}
            <div
              style={{
                background: "#ffffff",
                border: `1.5px solid ${THEME.colors.border}`,
                borderRadius: 24,
                padding: 24,
                boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                marginBottom: 20,
              }}
            >
              <span style={{ fontSize: 12, fontFamily: THEME.typography.mono, color: THEME.colors.muted, textTransform: "uppercase" }}>
                Today's Recorded Sales
              </span>
              <div
                style={{
                  fontSize: 42,
                  fontWeight: 900,
                  fontFamily: THEME.typography.heading,
                  color: THEME.colors.charcoal,
                  margin: "6px 0",
                }}
              >
                ₦{revenueCounter.toLocaleString()}
              </div>
              <span style={{ fontSize: 12, color: THEME.colors.green, fontWeight: 700 }}>
                ↑ +12 receipts issued today
              </span>
            </div>

            {/* Mini Activity Chart */}
            <div
              style={{
                background: "#ffffff",
                border: `1.5px solid ${THEME.colors.border}`,
                borderRadius: 24,
                padding: 24,
                marginBottom: 20,
              }}
            >
              <span style={{ fontSize: 12, fontFamily: THEME.typography.mono, color: THEME.colors.muted, textTransform: "uppercase", display: "block", marginBottom: 16 }}>
                Weekly Sales Velocity
              </span>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 110, padding: "0 12px" }}>
                <div style={{ width: 44, height: `${bar1}%`, background: "#e4e4e7", borderRadius: 8 }} />
                <div style={{ width: 44, height: `${bar2}%`, background: "#e4e4e7", borderRadius: 8 }} />
                <div style={{ width: 44, height: `${bar3}%`, background: "#e4e4e7", borderRadius: 8 }} />
                <div style={{ width: 44, height: `${bar4}%`, background: THEME.colors.primary, borderRadius: 8 }} />
              </div>
            </div>

            {/* Recent Item Stream */}
            <div
              style={{
                background: "#fafafa",
                borderRadius: 18,
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <span style={{ fontSize: 14, fontWeight: 800, color: THEME.colors.charcoal, display: "block" }}>
                  Amina Lawal · ₦35,000
                </span>
                <span style={{ fontSize: 12, color: THEME.colors.muted, fontFamily: THEME.typography.mono }}>
                  Receipt #PRF-401
                </span>
              </div>
              <span style={{ fontSize: 11, fontFamily: THEME.typography.mono, color: THEME.colors.green, fontWeight: 800 }}>
                JUST NOW
              </span>
            </div>
          </div>
        )}
      </PhoneMockup>
    </div>
  );
};
