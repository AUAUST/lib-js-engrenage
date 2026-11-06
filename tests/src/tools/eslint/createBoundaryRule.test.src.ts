import { ESLint } from "eslint";
import boundaries from "eslint-plugin-boundaries";
import { describe, expect, test, vi } from "vitest";

import { createBoundaryProject } from "#tests/utils/createBoundaryProject";
import { createEslintConfig } from "#tools/eslint/operations/createEslintConfig";
import { loadConfig } from "#workflows/registry/operations/loadConfig";
import type { Plugin } from "#tools/eslint/types/Plugin";

interface EnvironmentsOptions {
  readonly policies: readonly {
    readonly message?: string;
  }[];
}

async function lintEnvironments(files: readonly string[]) {
  const dependencies = (boundaries as unknown as Plugin).rules?.dependencies;

  if (dependencies === undefined) {
    throw new Error("The boundaries plugin has no dependencies rule");
  }

  const create = vi.spyOn(dependencies, "create");
  const project = createBoundaryProject();

  const eslint = new ESLint({
    cwd: project.root,
    overrideConfigFile: true,
    overrideConfig: await createEslintConfig(await loadConfig(project.root), {
      typeAware: false,
    }),
  });

  for (const file of files) {
    await eslint.lintText('export { value } from "#project/other/index";\n', {
      filePath: project.resolve(file),
    });
  }

  const options = create.mock.calls.map(([context]) => {
    return context.options[0] as EnvironmentsOptions;
  });

  create.mockRestore();

  return options.filter(({ policies }) => {
    return policies.some(({ message }) => {
      return message?.startsWith("src never imports bin") === true;
    });
  });
}

describe("createBoundaryRule", () => {
  test("reuses the merged options across files of one config", async () => {
    const [first, second] = await lintEnvironments([
      "src/project/feature/index.ts",
      "src/project/other/utils/priv.ts",
    ]);

    expect(first).toBeDefined();
    expect(second).toBe(first);
  });
});
