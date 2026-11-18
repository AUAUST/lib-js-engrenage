import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createConsoleReporter } from "#foundation/reports/index";

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

  test("writes progress only while verbose", () => {
    let verbose = false;

    const reporter = createConsoleReporter({
      isVerbose: () => {
        return verbose;
      },
    });

    reporter.info("quiet");

    expect(written(process.stderr)).toBe("");

    verbose = true;
    reporter.info("loud");

    expect(written(process.stderr)).toBe("loud\n");
  });
});
