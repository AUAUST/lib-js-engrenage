import { afterEach, beforeEach, vi } from "vitest";

import { keys } from "@auaust/toolkit/object";
import { startsWith } from "@auaust/toolkit/string";

for (const name of keys(process.env)) {
  if (startsWith(name, "GIT_")) {
    delete process.env[name];
  }
}

const unexpectedStderr: string[] = [];

beforeEach(() => {
  unexpectedStderr.length = 0;

  vi.spyOn(process.stderr, "write").mockImplementation((chunk) => {
    const text = String(chunk);

    if (!startsWith(text, "No engrenage config found in ")) {
      unexpectedStderr.push(text);
    }

    return true;
  });
});

afterEach(() => {
  if (unexpectedStderr.length > 0) {
    throw new Error(`Unexpected stderr output:\n${unexpectedStderr.join("")}`);
  }
});

// `process.exitCode` is global and tests share workers, so no test may observe another's exit code.
beforeEach(() => {
  process.exitCode = undefined;
});
