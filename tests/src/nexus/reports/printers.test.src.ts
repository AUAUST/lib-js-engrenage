import { afterEach, describe, expect, test, vi } from "vitest";

import { createRichPrinter } from "#nexus/reports/adapters/createRichPrinter";
import { jsonPrinter } from "#nexus/reports/adapters/jsonPrinter";
import {
  completionEntry,
  dataEntry,
  lineEntry,
  styled,
  tableEntry,
  treeEntry,
} from "#nexus/reports/index";

function captureWrites() {
  const stdout = vi.spyOn(process.stdout, "write").mockImplementation(() => {
    return true;
  });

  const stderr = vi.spyOn(process.stderr, "write").mockImplementation(() => {
    return true;
  });

  return {
    stdout: () => stdout.mock.calls.map(([chunk]) => String(chunk)).join(""),
    stderr: () => stderr.mock.calls.map(([chunk]) => String(chunk)).join(""),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("jsonPrinter", () => {
  test("prints a data entry as its value and other entries as their fields", () => {
    const { stdout, stderr } = captureWrites();

    jsonPrinter.print(
      dataEntry([{ file: "a.ts" }], [lineEntry("a.ts")]),
      "log",
    );

    jsonPrinter.print(
      lineEntry([styled("failure", "broken")], {
        source: "a.json",
        fix: "do x",
      }),
      "warn",
    );

    jsonPrinter.print(
      treeEntry([
        {
          label: "root",
          children: [{ label: [styled("path", "a")], children: [] }],
        },
      ]),
      "log",
    );

    jsonPrinter.print(
      tableEntry({ columns: [{ align: "start" }], rows: [{ cells: ["x"] }] }),
      "info",
    );

    jsonPrinter.print(completionEntry("Done", 12), "complete");

    expect(
      stdout()
        .split("\n")
        .map((line) => {
          return line && JSON.parse(line);
        }),
    ).toStrictEqual([
      [
        {
          file: "a.ts",
        },
      ],
      {
        report: "log",
        kind: "tree",
        compact: false,
        nodes: [{ label: "root", children: [{ label: "a", children: [] }] }],
      },
      {
        report: "complete",
        kind: "completion",
        text: "Done",
        duration: 12,
      },
      "",
    ]);

    expect(
      stderr()
        .split("\n")
        .map((line) => {
          return line && JSON.parse(line);
        }),
    ).toStrictEqual([
      {
        report: "warn",
        kind: "line",
        text: "broken",
        source: "a.json",
        fix: "do x",
      },
      {
        report: "info",
        kind: "table",
        columns: [{ align: "start" }],
        rows: [{ cells: ["x"] }],
      },
      "",
    ]);
  });
});

describe("createRichPrinter", () => {
  test("colors semantic styles and spaces blocks apart from lines", () => {
    vi.stubEnv("FORCE_COLOR", "1");
    vi.stubEnv("NO_COLOR", undefined);

    const { stdout } = captureWrites();

    const printer = createRichPrinter();

    printer.print(
      lineEntry([styled("success", "ok"), " ", styled("path", "a.ts")]),
      "log",
    );

    printer.print(lineEntry("plain"), "log");
    printer.print(completionEntry([styled("failure", "Failed")]), "complete");

    expect(stdout()).toBe(
      "\u001B[32mok\u001B[39m \u001B[36ma.ts\u001B[39m\nplain\n\n\u001B[31m✖\u001B[39m \u001B[31mFailed\u001B[39m\n",
    );
  });

  test("prints plain text without colors under NO_COLOR", () => {
    vi.stubEnv("NO_COLOR", "1");
    vi.stubEnv("FORCE_COLOR", undefined);

    const { stderr } = captureWrites();

    createRichPrinter().print(lineEntry([styled("path", "a.ts")]), "warn");

    expect(stderr()).toBe("⚠ a.ts\n");
  });
});
