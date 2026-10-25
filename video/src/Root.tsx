import React from "react";
import { Composition } from "remotion";
import { ProofaLaunch } from "./ProofaLaunch";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="ProofaLaunch"
        component={ProofaLaunch}
        durationInFrames={1200}
        fps={60}
        width={1080}
        height={1920}
      />
    </>
  );
};
