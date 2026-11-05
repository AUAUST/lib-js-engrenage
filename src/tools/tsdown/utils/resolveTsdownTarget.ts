import { entries } from "@auaust/toolkit/object";

import { targetBrowsers } from "#tools/tsdown/constants";
import type { Runtime } from "#project/baseline/index";

export function resolveTsdownTarget(runtime: Runtime): string[] {
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
