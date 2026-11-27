import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  createConsoleReporter,
  type Verbosity,
} from "#foundation/reports/index";

function written(stream: NodeJS.WriteStream): string {
  return vi
    .mocked(stream.write)
    .mock.calls.map(([chunk]) => {
      return String(chunk);
    })
    .join("");
}

beforeEach(() => {
  vi.spyOn(process.stderr, "write").mockImplementation(() => true);
  vi.spyOn(process.stdout, "write").mockImplementation(() => true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createConsoleReporter", () => {
  test("writes warnings to stderr with their source and fix", () => {
    createConsoleReporter().warn("text", { source: "a.json", fix: "do x" });

    expect(written(process.stderr)).toBe("a.json: text\n  do x\n");
    expect(written(process.stdout)).toBe("");
  });

  test("writes results to stdout", () => {
    createConsoleReporter().log("done");

    expect(written(process.stdout)).toBe("done\n");
  });

  test("writes each report only while its level is shown", () => {
    let verbosity: Verbosity = "default";

    const reporter = createConsoleReporter({
      verbosity: () => {
        return verbosity;
      },
    });

    reporter.info("hidden");
    reporter.debug("hidden");

    expect(written(process.stderr)).toBe("");

    verbosity = "silent";
    reporter.error("hidden");
    reporter.log("hidden");

    expect(written(process.stderr)).toBe("");
    expect(written(process.stdout)).toBe("");

    verbosity = "debug";
    reporter.info("progress");
    reporter.debug("stack");

    expect(written(process.stderr)).toBe("progress\nstack\n");
  });
});
