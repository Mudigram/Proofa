import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { THEME } from "../theme";
import { Caption } from "../components/Caption";
import { PhoneMockup } from "../components/PhoneMockup";

export const Scene1DocTypes: React.FC = () => {
  const frame = useCurrentFrame();

  // Entrance tilt: frame 0 to 30
  const enterProgress = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
    easing: THEME.easing.easeOut,
  });
  const rotateX = interpolate(enterProgress, [0, 1], [18, 0]);
  const enterY = interpolate(enterProgress, [0, 1], [140, 0]);

  // Active Tab: 0 (Receipt, f0-60), 1 (Invoice, f60-120), 2 (Order, f120-180)
  let activeTab = 0;
  if (frame >= 60 && frame < 120) activeTab = 1;
  if (frame >= 120) activeTab = 2;

  // Click pulses on tab switch
  const clickPulse = (triggerFrame: number) => {
    return interpolate(frame, [triggerFrame, triggerFrame + 4, triggerFrame + 12], [1, 0.86, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  };

  const tab1Scale = clickPulse(0);
  const tab2Scale = clickPulse(60);
  const tab3Scale = clickPulse(120);

  // Morph transition progress for card contents
  const morphProgress = interpolate(
    activeTab === 1 ? frame - 60 : activeTab === 2 ? frame - 120 : frame,
    [0, 16],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: THEME.easing.pop }
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
        text="Every document your business needs."
        durationInFrames={180}
      />

      <PhoneMockup scale={1.05} translateY={enterY} rotateX={rotateX}>
        {/* App Topbar */}
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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: THEME.colors.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 900,
                fontSize: 20,
                fontFamily: THEME.typography.heading,
              }}
            >
              P
            </div>
            <div>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: THEME.typography.mono,
                  textTransform: "uppercase",
                  color: THEME.colors.muted,
                  letterSpacing: "0.1em",
                  display: "block",
                }}
              >
                PROOFA STUDIO
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
                Quick Generator
              </h2>
            </div>
          </div>

          <span
            style={{
              padding: "4px 12px",
              borderRadius: 16,
              background: THEME.colors.primaryLight,
              color: THEME.colors.primary,
              fontSize: 12,
              fontFamily: THEME.typography.mono,
              fontWeight: 800,
            }}
          >
            FREE TIER
          </span>
        </div>

        {/* 3 Document Type Pills Switcher */}
        <div style={{ padding: "24px 32px 12px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
              background: "#f4f4f5",
              padding: 6,
              borderRadius: 20,
            }}
          >
            {/* Tab 1: Receipt */}
            <div
              style={{
                padding: "14px 8px",
                borderRadius: 16,
                background: activeTab === 0 ? "#ffffff" : "transparent",
                color: activeTab === 0 ? THEME.colors.primary : THEME.colors.muted,
                fontFamily: THEME.typography.heading,
                fontSize: 15,
                fontWeight: 900,
                textAlign: "center",
                boxShadow: activeTab === 0 ? "0 4px 12px rgba(0,0,0,0.06)" : "none",
                transform: `scale(${tab1Scale})`,
                transition: "all 0.1s ease",
              }}
            >
              Receipt
            </div>

            {/* Tab 2: Invoice */}
            <div
              style={{
                padding: "14px 8px",
                borderRadius: 16,
                background: activeTab === 1 ? "#ffffff" : "transparent",
                color: activeTab === 1 ? THEME.colors.primary : THEME.colors.muted,
                fontFamily: THEME.typography.heading,
                fontSize: 15,
                fontWeight: 900,
                textAlign: "center",
                boxShadow: activeTab === 1 ? "0 4px 12px rgba(0,0,0,0.06)" : "none",
                transform: `scale(${tab2Scale})`,
                transition: "all 0.1s ease",
              }}
            >
              Invoice
            </div>

            {/* Tab 3: Order */}
            <div
              style={{
                padding: "14px 8px",
                borderRadius: 16,
                background: activeTab === 2 ? "#ffffff" : "transparent",
                color: activeTab === 2 ? THEME.colors.primary : THEME.colors.muted,
                fontFamily: THEME.typography.heading,
                fontSize: 15,
                fontWeight: 900,
                textAlign: "center",
                boxShadow: activeTab === 2 ? "0 4px 12px rgba(0,0,0,0.06)" : "none",
                transform: `scale(${tab3Scale})`,
                transition: "all 0.1s ease",
              }}
            >
              Order
            </div>
          </div>
        </div>

        {/* Dynamic Morphing Document Preview Card */}
        <div style={{ padding: "16px 32px 32px", flex: 1 }}>
          <div
            style={{
              background: "#ffffff",
              border: `1.5px solid ${THEME.colors.border}`,
              borderRadius: 28,
              padding: 32,
              boxShadow: "0 12px 36px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: 20,
              transform: `scale(${interpolate(morphProgress, [0, 1], [0.97, 1])})`,
            }}
          >
            {/* Header / Type Label */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: THEME.typography.mono,
                    fontWeight: 800,
                    color: THEME.colors.primary,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    display: "block",
                  }}
                >
                  {activeTab === 0 ? "PAYMENT RECEIPT" : activeTab === 1 ? "TAX INVOICE" : "ORDER SUMMARY"}
                </span>
                <h3
                  style={{
                    fontSize: 26,
                    fontWeight: 900,
                    fontFamily: THEME.typography.heading,
                    margin: "4px 0 0",
                    color: THEME.colors.charcoal,
                  }}
                >
                  Zaria Couture Lagos
                </h3>
              </div>

              {/* Status Badge */}
              <span
                style={{
                  padding: "6px 14px",
                  borderRadius: 12,
                  fontSize: 12,
                  fontFamily: THEME.typography.mono,
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  background:
                    activeTab === 0 ? THEME.colors.greenLight : activeTab === 1 ? "#e1f3fe" : THEME.colors.primaryLight,
                  color: activeTab === 0 ? THEME.colors.green : activeTab === 1 ? "#1f6c9f" : THEME.colors.primary,
                }}
              >
                {activeTab === 0 ? "PAID" : activeTab === 1 ? "DUE IN 7 DAYS" : "READY TO SHIP"}
              </span>
            </div>

            {/* Document Specific Breakdown */}
            <div
              style={{
                background: "#fafafa",
                borderRadius: 20,
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700 }}>
                <span style={{ color: THEME.colors.charcoal }}>
                  {activeTab === 0
                    ? "2× Silk Kimono Set"
                    : activeTab === 1
                    ? "Branding & Tailoring Retainer"
                    : "1× Bespoke Agbada + Cap"}
                </span>
                <span style={{ fontFamily: THEME.typography.mono, fontWeight: 800 }}>
                  {activeTab === 0 ? "₦45,000" : activeTab === 1 ? "₦120,000" : "₦85,000"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: THEME.colors.muted }}>
                <span>Customer: Amina Lawal</span>
                <span style={{ fontFamily: THEME.typography.mono }}>
                  {activeTab === 0 ? "Ref: #PRF-401" : activeTab === 1 ? "Inv: #INV-102" : "Track: #ORD-89"}
                </span>
              </div>
            </div>

            {/* Bottom Total Bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                borderTop: `1px solid ${THEME.colors.border}`,
                paddingTop: 16,
              }}
            >
              <span style={{ fontSize: 14, fontFamily: THEME.typography.mono, color: THEME.colors.muted }}>
                Total Document Amount
              </span>
              <span
                style={{
                  fontSize: 34,
                  fontWeight: 900,
                  fontFamily: THEME.typography.heading,
                  color: THEME.colors.charcoal,
                }}
              >
                {activeTab === 0 ? "₦45,000" : activeTab === 1 ? "₦120,000" : "₦85,000"}
              </span>
            </div>
          </div>
        </div>
      </PhoneMockup>
    </div>
  );
};
