import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createEslintConfig } from "#tools/eslint/operations/createEslintConfig";
import { loadInfoRules } from "#tools/eslint/operations/loadInfoRules";
import type { Options } from "#tools/eslint/types/Options";

declare global {
  namespace Engrenage {
    interface ConventionCategories {
      sample: "preferFoo";
    }
  }
}

function createProject(category: string) {
  return createTemporaryProject({
    "package.json": JSON.stringify({ name: "sample", type: "module" }),
    "engrenage.config.ts": `const convention = {
  enabled: true,
  traits: [],
  requires: [],
  files: ["files.code"],
  ignores: [],
  typeAware: false,
  severity: "info",
  sections: [],
  delegates: () => [],
  rule: () => ({ meta: { type: "suggestion", schema: [] }, create: () => ({}) }),
};

export default {
  extensions: [
    {
      name: "sample-extension",
      contributes: {
        "eslint.conventions": [
          { name: "preferFoo", category: "${category}", load: async () => convention },
        ],
      },
    },
  ],
};
`,
  });
}

function hasRule(configs: Awaited<ReturnType<typeof createEslintConfig>>) {
  return configs.some((config) => {
    return config.rules?.["auaust/prefer-foo"] !== undefined;
  });
}

async function createConfig(root: string, options?: Options) {
  return createEslintConfig(await loadConfig(root), {
    typeAware: false,
    ...options,
  });
}

describe("eslint.conventions", () => {
  test("registers a contributed convention, configurable by its category", async () => {
    const project = createProject("sample");

    const configs = await createConfig(project.root);

    const plugin = configs.find((config) => {
      return config.plugins?.auaust !== undefined;
    })?.plugins?.auaust;

    expect(plugin?.rules?.["prefer-foo"]).toBeDefined();

    expect(hasRule(configs)).toBe(true);

    expect(
      hasRule(
        await createConfig(project.root, {
          sample: { preferFoo: false },
        }),
      ),
    ).toBe(false);

    expect(await loadInfoRules(project.root)).toContain("auaust/prefer-foo");
  });

  test("rejects a contribution to a built-in category", async () => {
    const project = createProject("comparisons");

    await expect(createConfig(project.root)).rejects.toThrow(
      /sample-extension.*"comparisons"/,
    );
  });
});
