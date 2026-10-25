import React from "react";
import { Audio, Sequence, interpolate, staticFile } from "remotion";
import { KineticBeat1Hook } from "./kinetic/KineticBeat1Hook";
import { KineticBeat2Truth } from "./kinetic/KineticBeat2Truth";
import { KineticBeat3Solution } from "./kinetic/KineticBeat3Solution";
import { KineticBeat4Outro } from "./kinetic/KineticBeat4Outro";

export const ProofaKinetic: React.FC = () => {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: "#fafafa",
        position: "relative",
        width: 1080,
        height: 1920,
      }}
    >
      {/* Background Soundtrack: 124 BPM Tech-House Beat */}
      <Audio
        src={staticFile("audio/deep-urban.wav")}
        volume={(f) =>
          interpolate(f, [0, 20, 920, 960], [0, 0.75, 0.75, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />

      {/* Beat 1: The Provocative Hook (Frames 0 to 240 / 4.0s) */}
      <Sequence from={0} durationInFrames={240}>
        <KineticBeat1Hook />
      </Sequence>

      {/* Beat 2: The Uncomfortable Truth (Frames 240 to 480 / 4.0s) */}
      <Sequence from={240} durationInFrames={240}>
        <KineticBeat2Truth />
      </Sequence>

      {/* Beat 3: The Structured Solution (Frames 480 to 750 / 4.5s) */}
      <Sequence from={480} durationInFrames={270}>
        <KineticBeat3Solution />
      </Sequence>

      {/* Beat 4: Outro & Call to Action (Frames 750 to 960 / 3.5s) */}
      <Sequence from={750} durationInFrames={210}>
        <KineticBeat4Outro />
      </Sequence>
    </div>
  );
};
