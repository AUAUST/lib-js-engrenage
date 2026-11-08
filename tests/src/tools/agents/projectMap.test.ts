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
    expect(map).toContain("| `handlers` | Request handlers. |");
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
