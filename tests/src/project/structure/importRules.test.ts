import { describe, expect, test } from "vitest";

import { importRulesSection, loadConfig } from "@auaust/engrenage";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const placeholder = "{dir}";

const files = {
  "package.json": '{ "name": "project", "type": "module" }',
  "src/index.ts": "",
  "src/foundation/base/index.ts": "",
  "src/project/model/index.ts": "",
  "src/project/model/utils/a.ts": "",
  "src/project/model/sub/index.ts": "",
  "src/project/model/sub/utils/b.ts": "",
  "src/tools/tool/index.ts": "",
  "src/tools/tool/utils/c.ts": "",
  "tests/a.test.ts": "",
};

async function resolveRules(preset: string) {
  const project = createTemporaryProject({
    ...files,
    "engrenage.config.ts": `export default { ${preset}src: { namespaces: { ".": { layers: ["foundation", "project", "tools"] } } } };\n`,
  });

  const config = await loadConfig(project.root);

  return config.resolve(importRulesSection);
}

type Rules = Awaited<ReturnType<typeof resolveRules>>;

function reached(rules: Rules, path: string, typeOnly = false) {
  return rules
    .filter(({ source, effect, typeOnly: only }) => {
      return (
        source.kind === "element" &&
        source.path === path &&
        effect === "allow" &&
        only === typeOnly
      );
    })
    .flatMap(({ targets }) => targets)
    .map((target) => {
      return target.kind === "category"
        ? target.category
        : `${target.kind}:${target.path}`;
    });
}

describe("import rules", () => {
  test("orders domains by layer and applies the role exceptions", async () => {
    const rules = await resolveRules('preset: "library", ');

    const base = reached(rules, "src/foundation/base");

    expect(base).not.toContain("index:src/project/model");
    expect(base).not.toContain("index:src/tools/tool");

    expect(reached(rules, "src/tools/tool")).toEqual(
      expect.arrayContaining([
        "index:src/project/model",
        "index:src/foundation/base",
      ]),
    );

    expect(reached(rules, "src/project/model/sub/utils")).toContain(
      "modules:src/project/model/utils",
    );

    expect(reached(rules, "src/tools/tool/utils")).toContain(
      "index:src/project/model",
    );
  });

  test("drops peer reach in an isolated namespace and types every rule", async () => {
    const project = createTemporaryProject({
      ...files,
      "src/features/a/index.ts": "",
      "src/features/b/index.ts": "",
      "src/tools/other/index.ts": "",
      "ext/a/src/index.ts": "",
      "ext/b/src/index.ts": "",
      "engrenage.config.ts": `export default { preset: "library", src: { namespaces: { ".": { layers: ["foundation", "project", "tools", "*"] }, features: { relation: "isolated" } } }, workspaces: { "ext/*": { name: "@s/${placeholder}" } } };\n`,
    });

    const config = await loadConfig(project.root);
    const rules = await config.resolve(importRulesSection);

    expect(reached(rules, "src/features/a")).not.toContain(
      "index:src/features/b",
    );

    expect(reached(rules, "src/features/a")).toContain(
      "index:src/foundation/base",
    );

    expect(reached(rules, "src/tools/tool")).toContain(
      "index:src/project/model",
    );

    const relations = new Set(rules.map(({ relation }) => relation));

    expect(relations.has(undefined as never)).toBe(false);

    expect([...relations]).toEqual(
      expect.arrayContaining([
        "own-roles",
        "global-roles",
        "ancestor-roles",
        "sub-domain",
        "lower-layer",
        "peer",
        "environment",
        "test-variant",
        "root-entry",
        "workspace",
      ]),
    );
  });

  test("restricts test files by variant in a library and not in an app", async () => {
    const library = await resolveRules('preset: "library", ');
    const app = await resolveRules("");

    function forbidden(rules: Rules) {
      return rules
        .filter(({ source, effect }) => {
          return source.kind === "test-variant" && effect === "forbid";
        })
        .map(({ source }) => {
          return source.kind === "test-variant" ? source.variant : "";
        });
    }

    expect(forbidden(library)).toEqual(
      expect.arrayContaining(["plain", "src", "dist"]),
    );

    expect(
      library.find(({ source, effect, targets }) => {
        return (
          source.kind === "test-variant" &&
          source.variant === "src" &&
          effect === "forbid" &&
          targets.some((target) => {
            return (
              target.kind === "category" && target.category === "public-entries"
            );
          })
        );
      }),
    ).toBeDefined();

    expect(forbidden(app)).toEqual([]);

    expect(
      app.some(({ source, targets }) => {
        return (
          source.kind === "environment" &&
          source.environment === "tests" &&
          targets.some((target) => {
            return (
              target.kind === "category" &&
              target.category === "internal-aliases"
            );
          })
        );
      }),
    ).toBe(true);

    expect(library.some(({ enforceable }) => !enforceable)).toBe(true);
  });
});
