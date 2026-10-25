import barrels from "#bin/support/codegen/barrels";
import { Command } from "@commander-js/extra-typings";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const emptyBlock = "// @reference config/tool\n// @end\n";

let root: string;

function writeProjectFile(path: string, content: string) {
  mkdirSync(join(root, path, ".."), {
    recursive: true,
  });

  writeFileSync(join(root, path), content);
}

async function runBarrels(...args: string[]) {
  await barrels(new Command("barrels")).parseAsync(args, {
    from: "user",
  });
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "engrenage-barrels-"));

  writeProjectFile(
    "package.json",
    JSON.stringify({
      imports: {
        "#config/*": "./config/*.ts",
      },
    }),
  );

  writeProjectFile("config/tool/preset.ts", "export const preset = 1;\n");
  writeProjectFile("src/tool/index.ts", emptyBlock);

  vi.spyOn(process, "cwd").mockReturnValue(root);
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  rmSync(root, {
    recursive: true,
    force: true,
  });

  vi.restoreAllMocks();

  process.exitCode = undefined;
});

describe("support codegen barrels", () => {
  test("re-exports the named directory so a later check passes", async () => {
    await runBarrels("tool");

    expect(readFileSync(join(root, "src/tool/index.ts"), "utf8")).toBe(
      [
        "// @reference config/tool",
        'export * from "#config/tool/preset";',
        "// @end",
        "",
      ].join("\n"),
    );

    await runBarrels("--check");

    expect(process.exitCode).toBeUndefined();
  });

  test("rejects an unknown barrel name", async () => {
    await expect(runBarrels("missing")).rejects.toThrow(
      'Unknown barrel "missing"',
    );
  });
});
