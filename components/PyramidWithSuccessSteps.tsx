import type { ReactNode } from "react";

type PyramidWithSuccessStepsProps = {
  pyramid: ReactNode;
};

export function PyramidWithSuccessSteps({
  pyramid,
}: PyramidWithSuccessStepsProps) {
  return (
    <div className="mx-auto w-full max-w-lg">{pyramid}</div>
  );
}
