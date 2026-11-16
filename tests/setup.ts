import { beforeEach, vi } from "vitest";

import { keys } from "@auaust/toolkit/object";
import { startsWith } from "@auaust/toolkit/string";

for (const name of keys(process.env)) {
  if (startsWith(name, "GIT_")) {
    delete process.env[name];
  }
}

// Warnings such as a missing engrenage config are expected in temporary projects, and memoized
// per process, so whichever test triggers one first depends on scheduling. Tests asserting a
// warning observe this spy, as `vi.spyOn` reuses an existing spy.
// @debt Every warning is silenced, unexpected ones included; routing them through a logger engrenage owns would let tests silence only the expected ones.
beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

// `process.exitCode` is global and tests share workers, so no test may observe another's exit code.
beforeEach(() => {
  process.exitCode = undefined;
});
