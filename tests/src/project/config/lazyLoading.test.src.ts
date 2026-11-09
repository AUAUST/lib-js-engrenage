import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { entries } from "@auaust/toolkit/object";

import { getFixture } from "#tests/utils/getFixture";
import { recordLoadedModules } from "#tests/utils/recordLoadedModules";

const repositoryRoot = fileURLToPath(new URL("../../../../", import.meta.url));

const allowed = /\/(?:extension|constants)\.ts$/u;

const definers = {
  eslint: "#tools/eslint/config/defineEslintConfig",
  prettier: "#tools/prettier/config/definePrettierConfig",
  tsdown: "#tools/tsdown/config/defineTsdownConfig",
  vite: "#tools/vite/config/defineViteConfig",
};

async function recordLoadedFiles(script: string): Promise<string[]> {
  const urls = await recordLoadedModules(script);

  return urls
    .filter((url) => url.startsWith("file:"))
    .map((url) => fileURLToPath(url).slice(repositoryRoot.length));
}

function within(files: readonly string[], directory: string, except?: string) {
  return files.filter((file) => {
    return (
      file.startsWith(directory) &&
      (except === undefined || !file.startsWith(except))
    );
  });
}

describe("lazy loading", () => {
  test("loads only the extensions and constants of the domains a config reads through its registry", async () => {
    const files = await recordLoadedFiles(
      `const { loadConfig } = await import("#project/config/index");\nconst config = await loadConfig(${JSON.stringify(getFixture("projects/external"))}, { searchParents: false });\nconfig.context.registry.list("slots");`,
    );

    expect(files).toContain("src/tools/git/extension.ts");

    const checked = [
      ...within(files, "src/tools/"),
      ...within(files, "src/workflows/", "src/workflows/builtins/"),
      ...within(files, "src/project/", "src/project/config/"),
    ];

    expect(checked.filter((file) => !allowed.test(file))).toEqual([]);
  });

  test("loads no tool engine while locating the file resources", async () => {
    const files = await recordLoadedFiles(
      `const { loadConfig } = await import("#project/config/index");\nconst config = await loadConfig(${JSON.stringify(getFixture("projects/external"))}, { searchParents: false });\nawait config.resolve("resources");`,
    );

    const engines =
      /^src\/tools\/[^/]+\/(?:setup|adapters|plugins|conventions|rules)\/|(?:^|\/)node_modules\/(?:eslint|prettier|tsdown|vite|jscpd)\//u;

    expect(files.filter((file) => engines.test(file))).toEqual([]);
  });

  test.each(entries(definers))(
    "loads no other tool's engine with the %s definer",
    async (tool, definer) => {
      const files = await recordLoadedFiles(
        `await import(${JSON.stringify(definer)});`,
      );

      expect(files).toContain(`src/${definer.slice(1)}.ts`);

      const foreign = within(files, "src/tools/", `src/tools/${tool}/`);

      expect(foreign.filter((file) => !allowed.test(file))).toEqual([]);
    },
  );
});
