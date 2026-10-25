import React from "react";
import { Audio, Sequence, interpolate, staticFile } from "remotion";
import { Scene1DocTypes } from "./scenes/Scene1DocTypes";
import { Scene2Templates } from "./scenes/Scene2Templates";
import { Scene3VaultCatalog } from "./scenes/Scene3VaultCatalog";
import { Scene4ShareDashboard } from "./scenes/Scene4ShareDashboard";
import { Scene5Sting } from "./scenes/Scene5Sting";

export const ProofaLaunch: React.FC = () => {
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
          interpolate(f, [0, 20, 1040, 1080], [0, 0.72, 0.72, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />

      {/* Scene 1: 3 Document Types Switcher (Frames 0 to 180 / 3.0s) */}
      <Sequence from={0} durationInFrames={180}>
        <Scene1DocTypes />
      </Sequence>

      {/* Scene 2: Templates & Logo Upload (Frames 180 to 390 / 3.5s) */}
      <Sequence from={180} durationInFrames={210}>
        <Scene2Templates />
      </Sequence>

      {/* Scene 3: 1-Tap Bank Vault & Customer Catalog (Frames 390 to 600 / 3.5s) */}
      <Sequence from={390} durationInFrames={210}>
        <Scene3VaultCatalog />
      </Sequence>

      {/* Scene 4: WhatsApp Delivery & Live Sales Dashboard (Frames 600 to 870 / 4.5s) */}
      <Sequence from={600} durationInFrames={270}>
        <Scene4ShareDashboard />
      </Sequence>

      {/* Scene 5: Logo Sting & CTA (Frames 870 to 1080 / 3.5s) */}
      <Sequence from={870} durationInFrames={210}>
        <Scene5Sting />
      </Sequence>
    </div>
  );
};
