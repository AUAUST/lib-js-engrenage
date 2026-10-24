import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

const tsc = createRequire(import.meta.url).resolve("typescript/lib/tsc.js");

const fixture = fileURLToPath(
  new URL("../fixtures/typescript/preset/", import.meta.url),
);

describe("typescript presets", () => {
  test("resolves the base preset through the package exports", () => {
    const output = execFileSync(
      process.execPath,
      [tsc, "--showConfig", "-p", fixture],
      {
        encoding: "utf8",
      },
    );

    const { compilerOptions } = JSON.parse(output);

    expect(compilerOptions).toMatchObject({
      strict: true,
      moduleResolution: "bundler",
      verbatimModuleSyntax: true,
    });
  });
});
