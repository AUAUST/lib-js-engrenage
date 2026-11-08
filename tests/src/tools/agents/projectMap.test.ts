import { existsSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { syncAgents } from "@auaust/engrenage/agents";
import { loadConfig } from "@auaust/engrenage/config";
import { createRolePreset, entry } from "@auaust/engrenage/roles";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { renderCodeRoles } from "#tests/utils/renderCodeRoles";

const handlers = createRolePreset({
  name: "handlers",
  exports: "named-match",
  purpose: "Request handlers.",
});

const overviewFile = ".claude/rules/project-map.md";
const sourceFile = ".claude/rules/project-map/src.md";

function createProject(peers = 0, published = true) {
  const extra: Record<string, string> = {};

  for (let index = 0; index < peers; index++) {
    extra[`src/feature${index}/index.ts`] = "";
  }

  return createTemporaryProject({
    "package.json": '{ "name": "project", "type": "module" }',
    "engrenage.config.ts": `export default {
  preset: "library",
  traits: { disable: ${published ? "[]" : '["published"]'} },
  agents: { preferred: ["claude"] },
  src: {
    roles: ${renderCodeRoles(entry(), handlers())},
    namespaces: {
      ".": { layers: ["base", "*"] },
      "isolated": { relation: "isolated" },
    },
    domains: { "feature": { purpose: "The feature." } },
  },
};\n`,
    "src/base/core/index.ts": "",
    "src/feature/index.ts": "",
    "src/feature/entry.ts": "",
    "src/feature/handlers/run.ts": "",
    "src/isolated/one/index.ts": "",
    "src/isolated/two/index.ts": "",
    ...extra,
  });
}

async function sync(peers?: number, published?: boolean) {
  const project = createProject(peers, published);

  return syncProject(project);
}

async function syncProject(project: ReturnType<typeof createTemporaryProject>) {
  const config = await loadConfig(project.root);

  await syncAgents(config);

  await config.context.filesystem.flush();

  return { project, config };
}

describe("project map", () => {
  test("renders the overview and the src map from the structure", async () => {
    const { project } = await sync();

    const overview = project.read(overviewFile);
    const map = project.read(sourceFile);

    expect(overview).toContain("| `peer`");
    expect(overview).toContain("| `src`");
    expect(overview).toContain(".claude/rules/project-map/src.md");
    expect(map).toContain("paths:\n  - src/**");
    expect(map).toContain("base < *");
    expect(map).toContain("isolated/  #isolated/…  [isolated]  one two");
    expect(map).toContain("feature*  The feature.");
    expect(overview).toContain("| `handlers` | Request handlers. |");
    expect(map).not.toContain("| Role |");
  });

  test("groups identical role contracts across environments and retains different levels", async () => {
    const common = JSON.stringify([entry(), handlers({ effects: "confined" })]);
    const different = JSON.stringify([
      entry(),
      handlers({ effects: "effectful" }),
    ]);

    const { project } = await syncProject(
      createTemporaryProject({
        "package.json": '{ "name": "project", "type": "module" }',
        "engrenage.config.ts": `export default {
        preset: "library",
        agents: { preferred: ["claude"] },
        src: { roles: ${common} },
        scripts: { roles: ${common} },
        tests: { mirror: false, roles: ${different} },
      };`,
        "src/feature/index.ts": "",
        "scripts/task/index.ts": "",
        "tests/feature/index.ts": "",
      }),
    );

    const rows = project
      .read(overviewFile)
      .split("\n")
      .filter((line) => line.startsWith("| `handlers` |"));

    expect(rows).toHaveLength(2);
    expect(rows).toContain(
      "| `handlers` | Request handlers. |  | confined |  | `src`, `scripts` |",
    );
    expect(rows).toContain(
      "| `handlers` | Request handlers. |  | effectful |  | `tests` |",
    );
  });

  test("renders nested file descriptions, global file roles and root tooling paths", async () => {
    const { project } = await syncProject(
      createTemporaryProject({
        "package.json": '{ "name": "project", "type": "module" }',
        "engrenage.config.ts": `export default {
        preset: "library",
        agents: { preferred: ["claude"] },
        src: { roles: [
          { name: "constants", file: "constants.ts", effects: "pure", public: true },
          { name: "config", roles: [{
            name: "definers", file: () => "defineFeatureConfig.ts",
            fileDescription: "define<Domain>Config.ts", effects: "effectful"
          }] }
        ] },
        tooling: { dirs: ["."], files: ["engrenage.config.ts"] },
      };`,
        "src/constants.ts": "",
        "src/feature/index.ts": "",
        "src/feature/config/defineFeatureConfig.ts": "",
      }),
    );

    expect(project.read(overviewFile)).toContain(
      "| `config/definers` |  | `define<Domain>Config.ts` | effectful |",
    );
    expect(project.read(sourceFile)).toContain("(global roles: constants.ts)");
    expect(project.read(".claude/rules/project-map/tooling.md")).toContain(
      "  - engrenage.config.ts",
    );
  });

  test("omits a tooling map and link when neither directories nor root files match", async () => {
    const { project } = await syncProject(
      createTemporaryProject({
        "package.json": '{ "name": "project", "type": "module" }',
        "engrenage.config.ts": `export default {
        preset: "library", agents: { preferred: ["claude"] },
        tooling: { dirs: [".", "missing-tooling"], files: ["missing.config.ts"] },
      };`,
        "src/feature/index.ts": "",
      }),
    );

    expect(
      existsSync(project.resolve(".claude/rules/project-map/tooling.md")),
    ).toBe(false);
    expect(project.read(overviewFile)).not.toContain(
      ".claude/rules/project-map/tooling.md",
    );
  });

  test.each([true, false])(
    "renders enforced grants for published=%s",
    async (published) => {
      const { project } = await sync(0, published);

      const overview = project.read(overviewFile);

      const sourceRow = overview
        .split("\n")
        .find((line) => line.startsWith("| `src` |"));

      expect(sourceRow?.split("|")[6]?.trim()).toBe(
        published ? "never" : "yes",
      );

      expect(overview.includes("## Test files")).toBe(published);
      expect(overview).toContain("the package name and its subpaths");
      expect(overview).toContain("the target's `index.ts` and public roles");
      expect(overview).not.toContain("⚠");
      expect(overview).not.toContain("Lint enforces every rule");

      if (!published) {
        return;
      }

      expect(overview).toContain("| source and dist |");
      expect(overview).toContain("| source |");
      expect(overview).toContain("| dist |");
    },
  );

  test("peer domains add no line to the src map", async () => {
    const few = await sync();

    const many = await sync(10);

    expect(many.project.read(sourceFile)?.split("\n")).toHaveLength(
      few.project.read(sourceFile)?.split("\n").length ?? 0,
    );

    expect(many.project.read(overviewFile)?.split("\n")).toHaveLength(
      few.project.read(overviewFile)?.split("\n").length ?? 0,
    );
  });

  test("reports a stale or extra map as synced and a fresh one as unchanged", async () => {
    const { project, config } = await sync();

    await config.context.filesystem.write(sourceFile, "stale\n");

    await config.context.filesystem.write(
      ".claude/rules/project-map/gone.md",
      "extra\n",
    );

    await config.context.filesystem.flush();

    await syncAgents(config);

    expect(await config.context.filesystem.flush()).toEqual(
      expect.arrayContaining([
        { file: sourceFile, status: "synced" },
        { file: ".claude/rules/project-map/gone.md", status: "deleted" },
      ]),
    );

    await syncAgents(config);

    expect(config.context.filesystem.discard()).toEqual([]);
    expect(project.read(sourceFile)).toContain("# Project map: src");
  });
});
