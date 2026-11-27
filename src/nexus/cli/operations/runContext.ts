import { AsyncLocalStorage } from "node:async_hooks";

import type { RunContext } from "#nexus/cli/types/RunContext";

// eslint-disable-next-line auaust/import-effects -- #986
export const runContext = new AsyncLocalStorage<RunContext>();
