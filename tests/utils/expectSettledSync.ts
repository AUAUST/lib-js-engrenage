import { expect } from "vitest";

import { collectChanges, runSync } from "#project/sync/index";
import type { LoadedConfig } from "#project/config/index";

export async function expectSettledSync(config: LoadedConfig): Promise<void> {
  const copy = config.context.copy();

  expect(await runSync(copy)).toEqual([]);
  expect(await collectChanges(copy, { check: true })).toEqual([]);
}
