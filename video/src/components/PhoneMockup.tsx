import React from "react";
import { THEME } from "../theme";

interface PhoneMockupProps {
  children: React.ReactNode;
  scale?: number;
  translateY?: number;
  rotateX?: number;
  rotateY?: number;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  children,
  scale = 1,
  translateY = 0,
  rotateX = 0,
  rotateY = 0,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 360,
        left: "50%",
        marginLeft: -380,
        width: 760,
        height: 1420,
        perspective: 1200,
        zIndex: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 64,
          background: "#18181b",
          padding: 16,
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.18), 0 4px 20px rgba(0,0,0,0.08), inset 0 0 0 2px rgba(255,255,255,0.15)",
          transform: `scale(${scale}) translateY(${translateY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformOrigin: "center center",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Dynamic Island / Speaker notch */}
        <div
          style={{
            position: "absolute",
            top: 28,
            left: "50%",
            transform: "translateX(-50%)",
            width: 180,
            height: 36,
            background: "#000000",
            borderRadius: 20,
            zIndex: 100,
          }}
        />

        {/* Screen Viewport */}
        <div
          style={{
            flex: 1,
            borderRadius: 50,
            background: THEME.colors.background,
            overflow: "hidden",
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
