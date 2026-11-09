import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { getFixture } from "#tests/utils/getFixture";
import { recordLoadedModules } from "#tests/utils/recordLoadedModules";

const repositoryRoot = fileURLToPath(new URL("../../../../", import.meta.url));

const allowed = /\/(?:extension|constants)\.ts$/u;

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
    const urls = await recordLoadedModules(
      `const { loadConfig } = await import("#project/config/index");\nconst config = await loadConfig(${JSON.stringify(getFixture("projects/external"))}, { searchParents: false });\nconfig.context.registry.list("slots");`,
    );

    const files = urls
      .filter((url) => url.startsWith("file:"))
      .map((url) => fileURLToPath(url).slice(repositoryRoot.length));

    expect(files).toContain("src/tools/git/extension.ts");

    const checked = [
      ...within(files, "src/tools/"),
      ...within(files, "src/workflows/", "src/workflows/builtins/"),
      ...within(files, "src/project/", "src/project/config/"),
    ];

    expect(checked.filter((file) => !allowed.test(file))).toEqual([]);
  });
});
