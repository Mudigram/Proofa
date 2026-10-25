import React from "react";
import { Composition } from "remotion";
import { ProofaLaunch } from "./ProofaLaunch";
import { ProofaKinetic } from "./ProofaKinetic";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="ProofaKinetic"
        component={ProofaKinetic}
        durationInFrames={960}
        fps={60}
        width={1080}
        height={1920}
      />
      <Composition
        id="ProofaLaunch"
        component={ProofaLaunch}
        durationInFrames={1080}
        fps={60}
        width={1080}
        height={1920}
      />
    </>
  );
};
