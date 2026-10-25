import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { THEME } from "../theme";

interface CaptionProps {
  text: string;
  startFrame?: number;
  durationInFrames: number;
}

export const Caption: React.FC<CaptionProps> = ({
  text,
  startFrame = 0,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const relFrame = frame - startFrame;

  // Exit animation over the last 15 frames
  const exitProgress = interpolate(
    relFrame,
    [durationInFrames - 15, durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const exitY = interpolate(exitProgress, [0, 1], [0, -18]);
  const exitBlur = interpolate(exitProgress, [0, 1], [0, 12]);
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  // Parse words with `*starred*` syntax
  const words = text.split(" ").map((w) => {
    const isStarred = w.startsWith("*") && w.endsWith("*");
    return {
      word: isStarred ? w.slice(1, -1) : w,
      starred: isStarred,
    };
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 140,
        left: 60,
        right: 60,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: "12px 14px",
        zIndex: 50,
        transform: `translateY(${exitY}px)`,
        filter: `blur(${exitBlur}px)`,
        opacity: exitOpacity,
      }}
    >
      {words.map((item, idx) => {
        // Stagger entrance: 4 frames per word
        const wordStart = idx * 4;
        const enterProgress = interpolate(
          relFrame - wordStart,
          [0, 14],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: THEME.easing.easeOut,
          }
        );

        const translateY = interpolate(enterProgress, [0, 1], [24, 0]);
        const opacity = interpolate(enterProgress, [0, 1], [0, 1]);
        const blur = interpolate(enterProgress, [0, 1], [10, 0]);

        return (
          <span
            key={idx}
            style={{
              fontFamily: THEME.typography.heading,
              fontSize: 52,
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              color: item.starred ? THEME.colors.primary : THEME.colors.charcoal,
              display: "inline-block",
              transform: `translateY(${translateY}px)`,
              opacity,
              filter: `blur(${blur}px)`,
            }}
          >
            {item.word}
          </span>
        );
      })}
    </div>
  );
};
