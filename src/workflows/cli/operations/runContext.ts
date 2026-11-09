import { AsyncLocalStorage } from "node:async_hooks";

import type { RunContext } from "#workflows/cli/types/RunContext";

export const runContext = new AsyncLocalStorage<RunContext>();
