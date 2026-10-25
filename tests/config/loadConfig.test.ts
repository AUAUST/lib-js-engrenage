import { loadConfig } from "@auaust/engrenage/config";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, test, vi } from "vitest";

const lockFiles = [
  "pnpm-lock.yaml",
  "package-lock.json",
  "yarn.lock",
  "bun.lock",
  "bun.lockb",
  "coverage/**",
];

const temporaryRoots: string[] = [];

function getFixture(name: string): string {
  return fileURLToPath(new URL(`../fixtures/config/${name}`, import.meta.url));
}

function createProject(): string {
  const root = mkdtempSync(join(tmpdir(), "engrenage-config-"));

  writeFileSync(
    join(root, "package.json"),
    JSON.stringify({
      name: "temporary",
      version: "0.0.0",
    }),
  );

  temporaryRoots.push(root);

  return root;
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, {
      recursive: true,
      force: true,
    });
  }

  vi.restoreAllMocks();
});

describe("loadConfig", () => {
  test("falls back to defaults and warns once without a config file", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const first = createProject();

    const config = await loadConfig(first);

    await loadConfig(createProject());

    expect(warn).toHaveBeenCalledExactlyOnceWith(
      `No engrenage.config.ts found in ${first}, using defaults`,
    );
    expect(config.root).toBe(first);
    expect(config.directories).toEqual({
      source: ["src"],
      test: ["tests"],
    });
    expect(config.files.generated).toEqual(lockFiles);
    expect(config.typescript).toEqual({});
  });

  test("replaces defaults, appends generated files and infers project values", async () => {
    const root = getFixture("custom");

    const config = await loadConfig(root);

    expect(config.directories.test).toEqual(["test"]);
    expect(config.files.generated).toEqual([
      ...lockFiles,
      "src/generated/**",
      "dist/**",
    ]);
    expect(config.package).toEqual({
      name: "custom-fixture",
      version: "1.2.3",
    });
    expect(config.typescript.outDir).toBe("dist");
    expect(loadConfig(root)).toBe(loadConfig(root));
  });

  test("resolves paths against the root and rejects escaping ones", async () => {
    const root = getFixture("custom");

    const config = await loadConfig(root);

    expect(config.resolve(config.files.gitignore)).toBe(
      join(root, ".gitignore"),
    );
    expect(() => {
      return config.resolve("../outside");
    }).toThrow("escapes");
  });

  test("rejects unknown keys, naming the file and each key path", async () => {
    const root = getFixture("invalid");

    const error = loadConfig(root);

    await expect(error).rejects.toThrow(join(root, "engrenage.config.ts"));
    await expect(error).rejects.toThrow("at sources");
    await expect(error).rejects.toThrow("at files.generatd");
  });
});
