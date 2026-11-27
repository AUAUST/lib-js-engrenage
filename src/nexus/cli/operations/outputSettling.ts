import { AsyncLocalStorage } from "node:async_hooks";

import type { ScenarioPrinters } from "#nexus/scenarios/index";

export const outputSettling = new AsyncLocalStorage<
  (bindings: ScenarioPrinters | undefined) => Promise<void>
>();
