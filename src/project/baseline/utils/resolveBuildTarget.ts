import { entries } from "@auaust/toolkit/object";

import { targetBrowsers } from "#project/baseline/constants";
import type { Runtime } from "#project/baseline/types/Runtime";

export function resolveBuildTarget(runtime: Runtime): string[] {
  if (runtime.kind === "node") {
    return [`node${runtime.major}`];
  }

  const browsers: string[] = [];

  for (const [browser, version] of entries(runtime.browsers)) {
    const name = targetBrowsers[browser];

    if (name !== undefined) {
      browsers.push(`${name}${version}`);
    }
  }

  return [...browsers, `node${runtime.node}`];
}
