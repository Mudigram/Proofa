import React from "react";
import { Audio, Sequence, interpolate, staticFile } from "remotion";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Form } from "./scenes/Scene2Form";
import { Scene3BankVault } from "./scenes/Scene3BankVault";
import { Scene4ReceiptHero } from "./scenes/Scene4ReceiptHero";
import { Scene5LogoSting } from "./scenes/Scene5LogoSting";

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
      {/* Background Soundtrack: Synthesized 124 BPM Tech-House Beat */}
      <Audio
        src={staticFile("audio/deep-urban.wav")}
        volume={(f) =>
          interpolate(f, [0, 20, 1160, 1200], [0, 0.7, 0.7, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />

      {/* Scene 1: Hook (Frames 0 to 210 / 3.5s) */}
      <Sequence from={0} durationInFrames={210}>
        <Scene1Hook />
      </Sequence>

      {/* Scene 2: Form Input (Frames 210 to 480 / 4.5s) */}
      <Sequence from={210} durationInFrames={270}>
        <Scene2Form />
      </Sequence>

      {/* Scene 3: Bank Vault (Frames 480 to 720 / 4.0s) */}
      <Sequence from={480} durationInFrames={240}>
        <Scene3BankVault />
      </Sequence>

      {/* Scene 4: Receipt Hero 3D Card (Frames 720 to 990 / 4.5s) */}
      <Sequence from={720} durationInFrames={270}>
        <Scene4ReceiptHero />
      </Sequence>

      {/* Scene 5: Logo Sting & CTA (Frames 990 to 1200 / 3.5s) */}
      <Sequence from={990} durationInFrames={210}>
        <Scene5LogoSting />
      </Sequence>
    </div>
  );
};
