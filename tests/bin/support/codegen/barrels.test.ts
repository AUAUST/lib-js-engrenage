import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { Command } from "@commander-js/extra-typings";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import barrels from "#bin/support/codegen/barrels";

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
        "#rules/*": "./src/rules/*.ts",
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

  test("registers default exports matched relative to the barrel, or to the root with a leading slash, except the barrel itself", async () => {
    const registry = [
      'export { default as first } from "#rules/first";',
      'export { default as second } from "#rules/second";',
    ];

    writeProjectFile("src/rules/first.ts", "export default 1;\n");
    writeProjectFile("src/rules/second.ts", "export default 2;\n");
    writeProjectFile("src/rules/index.ts", "// @registry *.ts\n// @end\n");

    writeProjectFile(
      "src/all/index.ts",
      "// @registry /src/rules/*.ts\n// @end\n",
    );

    await runBarrels("rules", "all");

    expect(readFileSync(join(root, "src/rules/index.ts"), "utf8")).toBe(
      ["// @registry *.ts", ...registry, "// @end", ""].join("\n"),
    );

    expect(readFileSync(join(root, "src/all/index.ts"), "utf8")).toBe(
      [
        "// @registry /src/rules/*.ts",
        'export { default as first } from "#rules/first";',
        'export { default as index } from "#rules/index";',
        'export { default as second } from "#rules/second";',
        "// @end",
        "",
      ].join("\n"),
    );
  });

  test("orders re-exports naturally, as the export ordering convention does", async () => {
    writeProjectFile(
      "config/tool/preset10.ts",
      "export const preset10 = 10;\n",
    );
    writeProjectFile("config/tool/preset2.ts", "export const preset2 = 2;\n");

    await runBarrels("tool");

    expect(readFileSync(join(root, "src/tool/index.ts"), "utf8")).toBe(
      [
        "// @reference config/tool",
        'export * from "#config/tool/preset";',
        'export * from "#config/tool/preset2";',
        'export * from "#config/tool/preset10";',
        "// @end",
        "",
      ].join("\n"),
    );
  });

  test("rejects an unknown barrel name", async () => {
    await expect(runBarrels("missing")).rejects.toThrow(
      'Unknown barrel "missing"',
    );
  });
});
