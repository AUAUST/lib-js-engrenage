import nodeReleases from "node-releases/data/processed/envs.json" with { type: "json" };

import { freeze } from "@auaust/toolkit/object";

import type { Runtime } from "#project/baseline/types/Runtime";

function listNodeMajors(): number[] {
  const majors = new Set<number>();

  for (const { name, version } of nodeReleases) {
    if (name === "nodejs") {
      majors.add(Number.parseInt(version, 10));
    }
  }

  return [...majors];
}

export function resolveNodeRuntime(
  major: number,
  subject: string,
): Extract<Runtime, { kind: "node" }> {
  if (!listNodeMajors().includes(major)) {
    throw new Error(
      `${subject} is Node ${major}, which node-releases does not list. Update node-releases or check the major`,
    );
  }

  return freeze({
    kind: "node",
    major,
  });
}
