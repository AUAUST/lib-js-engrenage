import { existsSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/extensions";
import { syncAgents } from "@auaust/engrenage/metalbrain";
import { components, createRolePreset, entry } from "@auaust/engrenage/roles";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { renderCodeRoles } from "#tests/utils/renderCodeRoles";

const handlers = createRolePreset({
  name: "handlers",
  exports: "named-match",
  purpose: "Request handlers.",
});

const workspacePlaceholder = "{dir}";

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
    structure: {
      layers: ["base", "*"],
      namespaces: { isolated: { relation: "isolated" } },
      domains: { feature: { purpose: "The feature." } },
    },
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
  const config = await loadConfig(project.root, {
    reporter: createTestReporter(),
  });

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
    expect(overview).toMatch(/^---\npaths:\n {2}- src\/\*\*\n/u);
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
      "| `handlers` | Request handlers. |  |  | values `named-match`, types `named-match` | confined |  | `src`, `scripts` |",
    );

    expect(rows).toContain(
      "| `handlers` | Request handlers. |  |  | values `named-match`, types `named-match` | effectful |  | `tests` |",
    );
  });

  test("renders nested file globs as written, global file roles and root tooling paths", async () => {
    const { project } = await syncProject(
      createTemporaryProject({
        "package.json": '{ "name": "project", "type": "module" }',
        "engrenage.config.ts": `export default {
        preset: "library",
        agents: { preferred: ["claude"] },
        src: { roles: [
          { name: "constants", file: "constants.ts", effects: "pure", public: true },
          { name: "config", roles: [{
            name: "definers",
            file: "define<Domain>Config.ts",
            effects: { evaluation: "pure", invocation: "effectful" }
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
      "| `config/definers` |  | `define<Domain>Config.ts` |  |  | evaluation pure, invocation effectful |",
    );

    expect(project.read(sourceFile)).toContain(
      "(global roles: *.d.ts *.config.ts constants.ts)",
    );

    expect(project.read(".claude/rules/project-map/tooling.md")).toContain(
      "  - engrenage.config.ts",
    );
  });

  test("lists and describes the configured effect levels", async () => {
    const { project } = await syncProject(
      createTemporaryProject({
        "package.json": '{ "name": "project", "type": "module" }',
        "engrenage.config.ts": `export default {
        preset: "library",
        agents: { preferred: ["claude"] },
        structure: { effects: { levels: [
          "pure",
          { name: "logging", purpose: "Write logs only." },
          "printing",
          "confined",
          "observing",
          "effectful",
        ] } },
      };`,
        "src/feature/index.ts": "",
      }),
    );

    const overview = project.read(overviewFile);

    expect(overview).toContain(
      "Effect levels, purest first: `pure` < `logging` < `printing` < `confined` < `observing` < `effectful`.",
    );

    expect(overview).toContain("- `logging`: Write logs only.");
  });

  test("renders companions and barrel options", async () => {
    const { project } = await syncProject(
      createTemporaryProject({
        "package.json": '{ "name": "project", "type": "module" }',
        "engrenage.config.ts": `export default {
        preset: "library",
        agents: { preferred: ["claude"] },
        src: { roles: [
          { name: "guards", companions: "src/assert/assert<Name>.ts" },
          { name: "models", index: true, public: true, subpath: "root" },
          { name: "notes" },
        ] },
      };`,
        "src/feature/index.ts": "",
      }),
    );

    const overview = project.read(overviewFile);

    expect(overview).toContain(
      "| `guards` |  |  | `src/assert/assert<Name>.ts` |  |",
    );

    expect(overview).toContain(
      "| `models` |  |  |  | `index`, subpath `root` |",
    );

    expect(overview).toContain("| `notes` |  |  |  |  |");
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

  test("writes no map for an environment without files and removes a stale one", async () => {
    const project = createTemporaryProject({
      "package.json": '{ "name": "project", "type": "module" }',
      "engrenage.config.ts": `export default {
        preset: "library", agents: { preferred: ["claude"] },
        scripts: { roles: [] },
      };`,
      "src/feature/index.ts": "",
      ".claude/rules/project-map/scripts.md": "stale\n",
    });

    await syncProject(project);

    expect(
      existsSync(project.resolve(".claude/rules/project-map/scripts.md")),
    ).toBe(false);
  });

  test.each([true, false])(
    "renders enforced grants for published=%s",
    async (published) => {
      const project = createProject(0, published);

      project.write("data/.gitkeep", "");
      project.write("scripts/run.ts", "");
      project.write("tests/run.test.ts", "");

      await syncProject(project);

      const overview = project.read(overviewFile);

      const lines = overview.split("\n");

      function cells(prefix: string) {
        return lines
          .findLast((line) => line.startsWith(prefix))
          ?.split("|")
          .map((cell) => cell.trim());
      }

      const column = cells("| from / to |")?.indexOf("data") ?? -1;

      expect(cells("| `src` |")?.[column]).toBe("yes");

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

      const never = cells("| `**/*.test.ts` |")?.at(-2);

      expect(never).toContain("`scripts`");
      expect(never).toContain("`tooling`");
    },
  );

  test("renders each environment's and workspace's purpose", async () => {
    const project = createTemporaryProject({
      "package.json": '{ "name": "project", "type": "module" }',
      "engrenage.config.ts": `export default {
        preset: "library",
        agents: { preferred: ["claude"] },
        workspaces: { globs: { "extensions/*": { name: "@x/${workspacePlaceholder}" } } },
        src: { structure: { purpose: "The code." } },
      };`,
      "src/feature/index.ts": "",
      "data/.namespace.json": '{ "purpose": "Shipped JSON | YAML files." }',
      "data/a.json": "{}",
      "extensions/a/package.json": '{ "name": "@x/a", "type": "module" }',
      "extensions/a/.workspace.json": '{ "purpose": "The extension." }',
    });

    await syncProject(project);

    const overview = project.read(overviewFile);

    expect(overview).toContain("| `src` | The code. |");
    expect(overview).toContain("| `data` | Shipped JSON \\| YAML files. |");
    expect(overview).toContain("| `extensions/a` | The extension. | none |");
    expect(project.read(sourceFile)).toContain("src/  feature  The code.");
  });

  test("renders each directory of a namespace with its own purpose and global roles", async () => {
    const project = createTemporaryProject({
      "package.json": '{ "name": "project", "type": "module" }',
      "engrenage.config.ts": `export default {
        preset: "library",
        agents: { preferred: ["claude"] },
        environments: {
          src: { dirs: ["src"] },
          admin: {
            preset: "src",
            dirs: ["admin"],
            languages: [{ name: "typescript", options: { tsx: "preact" } }],
            execution: { syntax: "2026-10" },
          },
          storefront: { preset: "src", dirs: ["storefront"], languages: ["javascript"] },
        },
        src: {
          dirs: ["src", "admin", "storefront"],
          roles: ${JSON.stringify([entry(), components()])},
          omitRoles: ["enums"],
          structure: { purpose: "The app.", layers: ["src", "*"], domains: { ui: { public: true } } },
        },
      };`,
      "src/.namespace.json": '{ "purpose": "The core." }',
      "src/core/index.ts": "",
      "src/core/components/Button.tsx": "",
      "admin/.namespace.json": '{ "purpose": "The App Home UI.", "roles": { "enable": ["components"] } }',
      "admin/components/Panel.tsx": "",
      "admin/ui/index.ts": "",
      "admin/ui/entry.ts": "",
      "storefront/cart/index.ts": "",
    });

    const { config } = await syncProject(project);

    const { src } = await config.resolve("structure");

    const [core, admin] = src!.root.children;

    const coreDomain = core?.children.find(({ name }) => name === "core");

    expect(
      coreDomain?.children.find(({ name }) => name === "components")?.kind,
    ).not.toBe("role");

    expect(
      admin?.children.find(({ name }) => name === "components")?.kind,
    ).toBe("role");

    const overview = project.read(overviewFile);

    expect(overview).toContain("| `src` | The app. |");
    expect(overview).toContain("| `src` › `src/` | The core. |");
    expect(overview).toContain("| `src` › `admin/` | The App Home UI. |");
    expect(overview).toContain("| `src` › `storefront/` |  |");

    const lines = project.read(sourceFile).split("\n");

    const row = (prefix: string) => {
      return lines.find((line) => line.includes(prefix)) ?? "";
    };

    expect(row("src  ")).not.toContain("admin/");
    expect(row("src/  ")).toContain("The core.");
    expect(row("src/  ")).toContain("constants.ts");
    expect(row("src/  ")).not.toContain("components");
    expect(row("admin/  ")).toContain("(global roles: components constants.ts");
    expect(row("storefront/  ")).not.toContain("global roles");
  });

  test("renders each namespace's and domain's debt beside its purpose", async () => {
    const project = createTemporaryProject({
      "package.json": '{ "name": "project", "type": "module" }',
      "engrenage.config.ts": `export default {
        preset: "library",
        agents: { preferred: ["claude"] },
        src: { structure: { purpose: "The code.", debt: "Hosts a tool." } },
      };`,
      "src/feature/index.ts": "",
      "src/feature/.domain.json": '{ "debt": "Belongs elsewhere." }',
      "data/.namespace.json": '{ "purpose": "Shipped files.", "debt": "Too broad." }',
      "data/a.json": "{}",
    });

    await syncProject(project);

    const overview = project.read(overviewFile);
    const source = project.read(sourceFile);

    expect(overview).toContain("| `src` | The code.  [debt: Hosts a tool.] |");

    expect(overview).toContain(
      "| `data` | Shipped files.  [debt: Too broad.] |",
    );

    expect(source).toContain("src/  The code.  [debt: Hosts a tool.]");
    expect(source).toContain("└─ feature  [debt: Belongs elsewhere.]");
  });

  test("renders each role's and workspace's debt beside its purpose", async () => {
    const project = createTemporaryProject({
      "package.json": '{ "name": "project", "type": "module" }',
      "engrenage.config.ts": `export default {
        preset: "library",
        agents: { preferred: ["claude"] },
        workspaces: {
          globs: {
            "extensions/*": { name: "@x/${workspacePlaceholder}", debt: "Hosted here." },
          },
        },
        src: {
          roles: ${renderCodeRoles(handlers({ debt: "Too generic." }))},
          structure: { purpose: "The code." },
        },
      };`,
      "src/feature/index.ts": "",
      "src/feature/handlers/run.ts": "",
      "extensions/a/package.json": '{ "name": "@x/a", "type": "module" }',
      "extensions/a/.workspace.json": '{ "purpose": "The extension." }',
    });

    await syncProject(project);

    const overview = project.read(overviewFile);

    expect(overview).toContain(
      "| `handlers` | Request handlers.  [debt: Too generic.] |",
    );

    expect(overview).toContain(
      "| `extensions/a` | The extension.  [debt: Hosted here.] | none |",
    );
  });

  test("omits the test files section without a test namespace", async () => {
    const project = createProject();

    await syncProject(project);

    expect(project.read(overviewFile)).not.toContain("## Test files");
  });

  test("seals a root namespace whose `.namespace.json` names the static kind", async () => {
    const project = createProject();

    project.write("data/.namespace.json", '{ "kind": "static" }');
    project.write("data/a.json", "{}");
    project.write("scripts/run.ts", "");

    await syncProject(project);

    const lines = project.read(overviewFile).split("\n");

    const header = lines.find((line) => line.startsWith("| from / to |"));

    const column = header
      ?.split("|")
      .map((cell) => {
        return cell.trim();
      })
      .indexOf("data");

    const rows = lines.filter((line) => {
      return /^\| `[^*]/u.test(line) && line.endsWith(".md` |");
    });

    expect(column).toBeGreaterThan(0);
    expect(rows.length).toBeGreaterThan(1);

    for (const row of rows) {
      expect(row.split("|").map((cell) => cell.trim())[column ?? -1]).toBe(
        "never",
      );
    }
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

  test("tags a domain collecting roles in the src map", async () => {
    const { project } = await syncProject(
      createTemporaryProject({
        "package.json": '{ "name": "project", "type": "module" }',
        "engrenage.config.ts": `export default {
  preset: "library",
  agents: { preferred: ["claude"] },
  src: {
    roles: ${renderCodeRoles(entry(), handlers({ collected: true, public: true }))},
    structure: {
      domains: { guard: { purpose: "The guards.", public: true, collects: ["handlers"] } },
    },
  },
};\n`,
        "src/guard/handlers/run.ts": "",
      }),
    );

    expect(project.read(sourceFile)).toContain(
      "guard*[collects: handlers]  The guards.",
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
        {
          file: sourceFile,
          status: "synced",
        },
        {
          file: ".claude/rules/project-map/gone.md",
          status: "deleted",
        },
      ]),
    );

    await syncAgents(config);

    expect(config.context.filesystem.discard()).toEqual([]);
    expect(project.read(sourceFile)).toContain("# Project map: src");
  });
});
