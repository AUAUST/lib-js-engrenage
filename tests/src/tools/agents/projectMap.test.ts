import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage";
import { syncAgents } from "@auaust/engrenage/agents";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const overviewFile = ".claude/rules/project-map.md";
const sourceFile = ".claude/rules/project-map/src.md";

function createProject(peers = 0) {
  const extra: Record<string, string> = {};

  for (let index = 0; index < peers; index++) {
    extra[`src/feature${index}/index.ts`] = "";
  }

  return createTemporaryProject({
    "package.json": '{ "name": "project", "type": "module" }',
    "engrenage.config.ts": `export default {
  preset: "library",
  agents: { preferred: ["claude"] },
  roles: { define: { handlers: { exports: "named-match", purpose: "Request handlers." } } },
  src: {
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

async function sync(peers?: number) {
  const project = createProject(peers);
  const config = await loadConfig(project.root);

  await syncAgents(config);
  (await config.get("filesystem")).flush();

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

    (await config.get("filesystem")).write(sourceFile, "stale\n");

    (await config.get("filesystem")).write(
      ".claude/rules/project-map/gone.md",
      "extra\n",
    );

    (await config.get("filesystem")).flush();
    await syncAgents(config);

    expect((await config.get("filesystem")).flush()).toEqual(
      expect.arrayContaining([
        { file: sourceFile, status: "synced" },
        { file: ".claude/rules/project-map/gone.md", status: "deleted" },
      ]),
    );

    await syncAgents(config);

    expect((await config.get("filesystem")).discard()).toEqual([]);
    expect(project.read(sourceFile)).toContain("# Project map: src");
  });
});
