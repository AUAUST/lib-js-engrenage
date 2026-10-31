import { freeze } from "@auaust/toolkit/object";

import { listTsconfigPresets } from "#typescript/utils/listTsconfigPresets";
import type { Runtime } from "#config/types/Runtime";

export function resolveNodeRuntime(
  major: number,
  subject: string,
): Extract<Runtime, { kind: "node" }> {
  const available = listTsconfigPresets("node");

  if (!available.includes(String(major))) {
    throw new Error(
      `${subject} is Node ${major}, which has no tsconfig preset. Available majors: ${available.join(", ")}`,
    );
  }

  return freeze({
    kind: "node",
    major,
  });
}
