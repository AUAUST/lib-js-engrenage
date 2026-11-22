import "#bin/engrenage/actions/init";

import { existsSync, readdirSync } from "node:fs";
import { basename } from "node:path";

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { parse } from "yaml";

import { sort } from "@auaust/toolkit/array";
import { keys } from "@auaust/toolkit/object";

import { spawnProcess } from "#foundation/processes/operations/spawnProcess";
import { findCurrentMonth } from "#project/baseline/index";
import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { linkSourcePackage } from "#tests/utils/linkSourcePackage";
import { mockCwd } from "#tests/utils/mockCwd";
import { readTestPnpmVersions } from "#tests/utils/readTestPnpmVersions";
import { runDefinition } from "#tests/utils/runDefinition";
import { scratchpadPlaceholder } from "#tools/agents/constants";
import { defineGroup } from "#workflows/cli/index";
import type { Prompter } from "#project/steps/index";

import * as prompts from "#workflows/init/operations/createPrompter";

import init from "#bin/engrenage/init";
import sync from "#bin/engrenage/sync";
import manifest from "#package.json" with { type: "json" };

vi.mock(import("#foundation/processes/operations/spawnProcess"));

vi.mock(import("#tools/pnpm/operations/resolveLatestPnpm"), () => {
  return {
    resolveLatestPnpm: () => Promise.resolve(readTestPnpmVersions().latest),
  };
});

const visibilityQuestion = "Who can install the package?";

function answerSelect(question: string, answer: string): Prompter["select"] {
  return (message, values, initial) => {
    const chosen = values.find((value) => value === answer);

    return Promise.resolve(
      message === question && chosen !== undefined ? chosen : initial,
    );
  };
}

function createProject(files: Record<string, string>) {
  const project = createTemporaryProject(files);

  linkSourcePackage(project.resolve("node_modules/@auaust/engrenage"));

  mockCwd(project.root);

  return project;
}

const program = defineGroup({
  commands: { init, sync },
});

let messages: Awaited<
  ReturnType<typeof runDefinition>
>["messages"][number][] = [];

async function run(...args: string[]) {
  const reporter = await runDefinition(program, ...args);

  messages.push(...reporter.messages);
}

function printed(level?: (typeof messages)[number]["level"]) {
  return messages
    .filter((message) => {
      return level === undefined || message.level === level;
    })
    .map(({ text }) => text);
}

beforeEach(() => {
  messages = [];

  vi.mocked(spawnProcess).mockResolvedValue({
    stdout: "",
    stderr: "",
    status: 0,
    signal: null,
    error: undefined,
  });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("engrenage init", () => {
  test("exits successfully without changes when the setup review is declined", async () => {
    const packageJson = '{"name":"project","type":"module"}';
    const config = "export default { agents: { preferred: [] } };\n";

    const project = createProject({
      "package.json": packageJson,
      "engrenage.config.ts": config,
    });

    const confirm = vi.fn().mockResolvedValue(false);

    vi.spyOn(prompts, "createPrompter").mockReturnValue({
      ...prompts.createPrompter({
        yes: true,
      }),
      confirm,
    });

    await run("init");

    expect(confirm).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining("Review the missing setup"),
    );

    expect(project.read("package.json")).toBe(packageJson);
    expect(project.read("engrenage.config.ts")).toBe(config);

    expect(sort(readdirSync(project.root))).toEqual([
      "engrenage.config.ts",
      "node_modules",
      "package.json",
    ]);

    expect(spawnProcess).not.toHaveBeenCalled();
    expect(process.exitCode ?? 0).toBe(0);
  });

  test.each(["vite", "tsdown", "vitest"])(
    "reviews missing setup without implicitly creating a %s config or filling package fields",
    async (tool) => {
      const packageJson = JSON.stringify({
        name: "project",
        type: "module",
        devDependencies: {
          [tool]: "*",
        },
      });

      const config = "export default { agents: { preferred: [] } };\n";

      const project = createProject({
        "package.json": packageJson,
        "engrenage.config.ts": config,
      });

      const confirm = vi
        .fn()
        .mockResolvedValue(false)
        .mockResolvedValueOnce(true);

      vi.spyOn(prompts, "createPrompter").mockReturnValue({
        ...prompts.createPrompter({
          yes: true,
        }),
        confirm,
      });

      await run("init");

      expect(confirm).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("Review the missing setup"),
      );

      expect(confirm).toHaveBeenCalledWith(`Create ${tool}.config.ts?`, true);

      expect(confirm).toHaveBeenCalledWith(
        "Fill in the missing package.json fields?",
        true,
      );

      expect(existsSync(project.resolve(`${tool}.config.ts`))).toBe(false);

      expect(JSON.parse(project.read("package.json"))).toEqual({
        ...JSON.parse(packageJson),
        private: true,
        imports: {
          "#package.json": "./package.json",
        },
        devEngines: {
          runtime: {
            name: "node",
            version: "24",
            onFail: "error",
          },
        },
      });

      expect(project.read("engrenage.config.ts")).toBe(config);
      expect(spawnProcess).not.toHaveBeenCalled();
      expect(process.exitCode ?? 0).toBe(0);
    },
  );

  test("fills the gaps of a configured project, installs added dependencies and syncs", async () => {
    const project = createProject({
      "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] } };\n',
      "package.json": '{\n  "name": "project",\n  "type": "module"\n}\n',
      ".gitignore": "node_modules\n.DS_Store\n\n# Scratch\n/scratch\n",
    });

    await run("init", "--yes");

    const packageJson: unknown = JSON.parse(project.read("package.json"));

    expect(packageJson).toMatchObject({
      name: "project",
      version: "0.0.0",
      private: true,
      license: "UNLICENSED",
      author: manifest.author,
      scripts: {
        "ci": "pnpm run ci:check && pnpm run ci:test",
        "ci:check": "engrenage gate --all",
        "test": "engrenage vitest && engrenage typecheck",
        "typecheck": "engrenage typecheck",
        "coverage": "engrenage vitest:coverage",
        "format": "engrenage prettier",
        "lint": "engrenage eslint",
        "lint:fix": "engrenage eslint:fix",
        "lint:suppress": "engrenage eslint:suppress",
        "ready": "pnpm install --frozen-lockfile && engrenage sync && pnpm run ci",
      },
      devDependencies: {
        "@vitest/coverage-istanbul": manifest.peerDependencies[
          "@vitest/coverage-istanbul"
        ],
        "@auaust/engrenage": `^${manifest.version}`,
        "eslint": manifest.peerDependencies.eslint,
        "prettier": manifest.peerDependencies.prettier,
        "typescript": manifest.devDependencies.typescript,
        "vitest": manifest.peerDependencies.vitest,
        "@changesets/cli": manifest.peerDependencies["@changesets/cli"],
      },
    });

    expect(packageJson).not.toHaveProperty("scripts.build");
    expect(packageJson).not.toHaveProperty("scripts.ci:publish");
    expect(packageJson).not.toHaveProperty(["scripts", "lint:check"]);

    expect(JSON.parse(project.read("tsconfig.json"))).toEqual({
      extends: "@auaust/engrenage/tsconfig/base.json",
      files: [],
      references: [{ path: "./tsconfig.scripts.json" }],
    });

    expect(packageJson).toHaveProperty(
      "prettier",
      "@auaust/engrenage/prettier/config",
    );

    expect(existsSync(project.resolve("prettier.config.ts"))).toBe(false);

    expect(project.read("vitest.config.ts")).toContain(
      "export default defineVitestConfig.at(import.meta.url)();",
    );

    expect(spawnProcess).toHaveBeenCalledTimes(3);

    expect(spawnProcess).toHaveBeenNthCalledWith(3, "claude", ["--version"], {
      cwd: project.root,
    });

    expect(spawnProcess).toHaveBeenNthCalledWith(1, "pnpm", ["install"], {
      cwd: project.root,
      stdio: "inherit",
    });

    expect(spawnProcess).toHaveBeenNthCalledWith(
      2,
      "pnpm",
      ["exec", "lefthook", "install"],
      {
        cwd: project.root,
        stdio: "inherit",
      },
    );

    expect(packageJson).toHaveProperty("scripts.prepare", "lefthook install");

    expect(project.read("lefthook.yml")).toContain("$CLAUDECODE");

    expect(printed()).toContain("Run pnpm changeset init to finish the setup.");

    expect(project.read("pnpm-workspace.yaml")).toBe(
      'allowBuilds:\n  "esbuild": true\n  "lefthook": false\n  "unrs-resolver": true\nminimumReleaseAgeExclude:\n  - "@auaust/*"\nverifyDepsBeforeRun: error\n',
    );

    expect(project.read("eslint.config.ts")).toContain(
      'import { defineEslintConfig } from "@auaust/engrenage/eslint";',
    );

    expect(project.read("CLAUDE.md")).toBe("@AGENTS.md\n");

    expect(project.read("AGENTS.md")).toContain("## Precedence and conflicts");

    expect(project.read(".prettierignore")).toContain("# @ignore defaults");

    expect(JSON.parse(project.read(".vscode/settings.json"))).toMatchObject({
      "editor.formatOnSave": true,
    });

    const gitignore = project.read(".gitignore");

    expect(gitignore).toMatch(
      /^# @ignore defaults\n\n# JavaScript\nnode_modules\n/,
    );

    expect(gitignore).toMatch(/# @end\n\n# Scratch\n\/scratch\n$/);
    expect(gitignore.match(/^node_modules$/gm)).toHaveLength(1);
  });

  test.each(["Want coverage?", "Test with Vitest?"])(
    "omits the provider and coverage script when declining %s",
    async (declined) => {
      const project = createProject({
        "package.json": '{"name":"project","type":"module"}',
        "engrenage.config.ts": "export default { agents: { preferred: [] } };\n",
      });

      const confirm = vi.fn((message: string) => {
        return Promise.resolve(message !== declined);
      });

      vi.spyOn(prompts, "createPrompter").mockReturnValue({
        ...prompts.createPrompter({ yes: true }),
        confirm,
      });

      await run("init");

      const packageJson: unknown = JSON.parse(project.read("package.json"));

      expect(packageJson).not.toHaveProperty(
        "devDependencies.@vitest/coverage-istanbul",
      );

      expect(packageJson).not.toHaveProperty("scripts.coverage");

      if (declined === "Test with Vitest?") {
        expect(confirm).not.toHaveBeenCalledWith("Want coverage?", true);
      } else {
        expect(packageJson).toHaveProperty("devDependencies.vitest");
      }
    },
  );

  test.each(["dependencies", "devDependencies"])(
    "offers a missing coverage script on re-init with Istanbul in %s",
    async (dependencies) => {
      const project = createProject({
        "package.json": JSON.stringify({
          name: "project",
          type: "module",
          [dependencies]: { "@vitest/coverage-istanbul": "*" },
        }),
        "engrenage.config.ts": "export default { agents: { preferred: [] } };\n",
        ".changeset/config.json": "{}\n",
      });

      await run("init", "--yes");

      const completed = JSON.parse(project.read("package.json"));

      delete completed.scripts.coverage;

      project.write("package.json", JSON.stringify(completed));

      loadConfig.refresh(project.root);

      vi.clearAllMocks();

      const confirm = vi.fn().mockResolvedValue(true);

      vi.spyOn(prompts, "createPrompter").mockReturnValue({
        ...prompts.createPrompter({ yes: true }),
        confirm,
      });

      await run("init");

      expect(confirm).toHaveBeenCalledWith("Add the standard scripts?", true);

      expect(confirm).not.toHaveBeenCalledWith("Want coverage?", true);

      expect(JSON.parse(project.read("package.json"))).toMatchObject({
        [dependencies]: { "@vitest/coverage-istanbul": "*" },
        scripts: { coverage: "engrenage vitest:coverage" },
      });

      expect(spawnProcess).not.toHaveBeenCalled();
    },
  );

  test("leaves a complete project untouched", async () => {
    const project = createProject({
      "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] } };\n',
      "package.json": '{\n  "name": "project",\n  "type": "module"\n}\n',
      ".changeset/config.json": "{}\n",
    });

    await run("init", "--yes");

    const completed = project.read("package.json");
    const scratchpad = project.read(".ai/scratchpad.md");

    messages = [];

    vi.clearAllMocks();

    await run("init", "--yes");

    expect(spawnProcess).not.toHaveBeenCalled();

    expect(printed()).toStrictEqual([
      "Engrenage is set up, nothing is missing.",
    ]);

    expect(project.read("package.json")).toBe(completed);
    expect(project.read(".ai/scratchpad.md")).toBe(scratchpad);

    expect(keys(JSON.parse(completed))).toEqual([
      "name",
      "version",
      "private",
      "license",
      "author",
      "type",
      "scripts",
      "imports",
      "devDependencies",
      "prettier",
      "devEngines",
    ]);
  });

  test.each([false, true])(
    "starts an uninstalled library with an existing tsconfig: %s",
    async (hasTsconfig) => {
      const project = createTemporaryProject(
        hasTsconfig
          ? {
              "tsconfig.json": JSON.stringify({
                extends: "@auaust/engrenage/tsconfig/library.json",
              }),
              ".gitignore": "node_modules\n\n# Custom output\n/custom-output\n",
              "pnpm-workspace.yaml": "# Existing workspace\nallowBuilds:\n  unrs-resolver: true\n",
            }
          : {},
      );

      mockCwd(project.root);

      vi.mocked(spawnProcess).mockImplementation((command, args) => {
        if (args?.[0] === "init") {
          project.write("package.json", '{\n  "type": "module"\n}\n');
        }

        if (args?.[0] === "install") {
          expect(
            existsSync(project.resolve("node_modules/@auaust/engrenage")),
          ).toBe(false);

          expect(parse(project.read("pnpm-workspace.yaml"))).toMatchObject({
            allowBuilds: { "esbuild": true, "unrs-resolver": true },
          });

          linkSourcePackage(project.resolve("node_modules/@auaust/engrenage"));
        }

        return Promise.resolve({
          stdout: "",
          stderr: "",
          status: 0,
          signal: null,
          error: undefined,
        });
      });

      await run("init", "--yes");

      const name = basename(project.root);

      expect(vi.mocked(spawnProcess).mock.calls).toEqual([
        [
          "pnpm",
          ["init", "--bare"],
          {
            cwd: project.root,
            stdio: "inherit",
          },
        ],
        [
          "pnpm",
          ["install"],
          {
            cwd: project.root,
            stdio: "inherit",
          },
        ],
        [
          "pnpm",
          ["exec", "lefthook", "install"],
          {
            cwd: project.root,
            stdio: "inherit",
          },
        ],
      ]);

      expect(parse(project.read("lefthook.yml"))).toEqual({
        "pre-commit": {
          commands: {
            "engrenage-local": {
              run: "pnpm --silent --config.verify-deps-before-run=false engrenage gate --staged --everyone",
            },
          },
        },
        "commit-msg": {
          commands: {
            "engrenage-local": {
              run: 'pnpm --silent --config.verify-deps-before-run=false engrenage gate --message "{1}" --everyone',
            },
          },
        },
      });

      expect(project.read("engrenage.config.ts")).toContain(
        'preset: "library"',
      );

      expect(project.read("engrenage.config.ts")).toContain(
        "attribution: false",
      );

      expect(JSON.parse(project.read("package.json"))).toMatchObject({
        name,
        version: "0.0.0",
        license: "GPL-3.0-only",
        scripts: {
          "build": "engrenage tsdown && engrenage typecheck:dist && engrenage vitest:dist",
          "ci:build": "pnpm run build",
          "ci:publish": "changeset publish",
          "ci:test": "engrenage vitest",
        },
        devDependencies: {
          tsdown: manifest.peerDependencies.tsdown,
          tsx: manifest.peerDependencies.tsx,
          vitest: manifest.peerDependencies.vitest,
        },
      });

      expect(JSON.parse(project.read("package.json"))).not.toHaveProperty(
        "private",
      );

      expect(project.read("engrenage.config.ts")).toContain(
        'visibility: "public"',
      );

      expect(JSON.parse(project.read("package.json")).publishConfig).toEqual({
        access: "public",
      });

      expect(existsSync(project.resolve("vite.config.ts"))).toBe(false);

      expect(project.read("tsdown.config.ts")).toContain("defineTsdownConfig");

      expect(project.read("vitest.config.ts")).toContain("defineVitestConfig");

      expect(JSON.parse(project.read("tsconfig.json"))).toEqual({
        extends: "@auaust/engrenage/tsconfig/library.json",
        files: [],
        references: [
          { path: "./tsconfig.src.json" },
          { path: "./tsconfig.scripts.json" },
        ],
      });

      expect(project.read("src/index.ts")).toBe("export {};\n");

      expect(JSON.parse(project.read("tsconfig.src.json"))).toMatchObject({
        extends: "./tsconfig.json",
      });

      expect(existsSync(project.resolve("tsconfig.tests.dist.json"))).toBe(
        false,
      );

      messages = [];

      await run("sync", "--check");

      expect(process.exitCode ?? 0).toBe(0);

      expect(printed("warn")).toStrictEqual([]);

      expect(
        JSON.parse(project.read("package.json")).devEngines.packageManager,
      ).toEqual({
        name: "pnpm",
        version: `^${readTestPnpmVersions().latest}`,
        onFail: "download",
      });

      expect(project.read(".github/workflows/ci.yml")).toContain(
        "pnpm run ci:check",
      );

      expect(project.read(".gitignore")).toContain("# Output\n/dist");

      expect(project.read(".prettierignore")).toContain("# Output\n/dist");

      if (hasTsconfig) {
        expect(project.read(".gitignore")).toContain(
          "# Custom output\n/custom-output",
        );
      }
    },
  );

  test("writes the public visibility and license of a scoped library answering public", async () => {
    const project = createProject({
      "package.json": '{\n  "name": "@scope/library",\n  "type": "module"\n}\n',
    });

    const prompter = {
      ...prompts.createPrompter({ yes: true }),
      select: answerSelect(visibilityQuestion, "public"),
    };

    const select = vi.spyOn(prompter, "select");

    vi.spyOn(prompts, "createPrompter").mockReturnValue(prompter);

    await run("init", "--yes");

    expect(select).toHaveBeenCalledWith(
      visibilityQuestion,
      ["public", "private"],
      "private",
    );

    expect(project.read("engrenage.config.ts")).toContain(
      'visibility: "public"',
    );

    expect(JSON.parse(project.read("package.json"))).toMatchObject({
      name: "@scope/library",
      license: "GPL-3.0-only",
      publishConfig: {
        access: "public",
      },
    });
  });

  test("offers public by default to an unscoped library and reports its final sync check failing answering private", async () => {
    const project = createProject({
      "package.json": '{\n  "name": "library",\n  "type": "module"\n}\n',
    });

    const prompter = {
      ...prompts.createPrompter({ yes: true }),
      select: answerSelect(visibilityQuestion, "private"),
    };

    const select = vi.spyOn(prompter, "select");

    vi.spyOn(prompts, "createPrompter").mockReturnValue(prompter);

    await run("init", "--yes");

    expect(printed("error")).toContainEqual(
      expect.stringContaining("the package library is unscoped"),
    );

    expect(process.exitCode).toBe(1);

    expect(select).toHaveBeenCalledWith(
      visibilityQuestion,
      ["public", "private"],
      "public",
    );

    expect(project.read("engrenage.config.ts")).toContain(
      'visibility: "private"',
    );

    expect(JSON.parse(project.read("package.json"))).toMatchObject({
      license: "UNLICENSED",
    });
  });

  test("asks no visibility of an other project", async () => {
    const project = createProject({
      "package.json": '{\n  "name": "project",\n  "type": "module"\n}\n',
    });

    const prompter = {
      ...prompts.createPrompter({ yes: true }),
      select: answerSelect("What kind of project is this?", "other"),
    };

    const select = vi.spyOn(prompter, "select");

    vi.spyOn(prompts, "createPrompter").mockReturnValue(prompter);

    await run("init", "--yes");

    expect(select).not.toHaveBeenCalledWith(
      visibilityQuestion,
      expect.anything(),
      expect.anything(),
    );

    expect(project.read("engrenage.config.ts")).not.toContain("visibility");

    expect(JSON.parse(project.read("package.json"))).toMatchObject({
      private: true,
      license: "UNLICENSED",
    });
  });
});

test("defaults an app's build tool to vite and its source host to the browser", async () => {
  const project = createProject({
    "package.json": '{\n  "name": "app",\n  "type": "module"\n}\n',
  });

  const prompter = {
    ...prompts.createPrompter({ yes: true }),
    select: answerSelect("What kind of project is this?", "app"),
  };

  const select = vi.spyOn(prompter, "select");

  vi.spyOn(prompts, "createPrompter").mockReturnValue(prompter);

  await run("init", "--yes");

  expect(select).toHaveBeenCalledWith(
    "Which build tool?",
    expect.anything(),
    "vite",
  );

  expect(project.read("engrenage.config.ts")).toContain('preset: "app"');

  const config = await loadConfig(project.root);

  expect(await config.resolve("build.tool")).toMatchObject({ name: "vite" });

  expect((await config.resolve("src")).host).toBe("browser");
});

test("writes an empty library's config without role lists", async () => {
  const project = createProject({
    "package.json": '{\n  "name": "library",\n  "type": "module"\n}\n',
  });

  await run("init", "--yes");

  expect(project.read("engrenage.config.ts"))
    .toBe(`import { defineConfig } from "@auaust/engrenage/config";

export default defineConfig({
  preset: "library",
  visibility: "public",
  src: { baseline: "${findCurrentMonth()}" },
  agents: { preferred: [], attribution: false },
});
`);
});

test("ranks the operations role of an empty library's project map as effectful", async () => {
  const project = createProject({
    "package.json": '{\n  "name": "library",\n  "type": "module"\n}\n',
  });

  vi.spyOn(prompts, "createPrompter").mockReturnValue({
    ...prompts.createPrompter({ yes: true }),
    multiselect: (message, values, initial = []) => {
      return Promise.resolve(
        message === "Which coding agents do you use?"
          ? values.filter((value) => value === "claude")
          : [...initial],
      );
    },
  });

  await run("init", "--yes");

  const row = project
    .read(".claude/rules/project-map.md")
    .split("\n")
    .find((line) => line.startsWith("| `operations`"));

  expect(row).toContain("| effectful |");
});

test("does not generate agent setup without selected agents", async () => {
  const project = createProject({
    "package.json": '{"name":"project","type":"module"}',
    "engrenage.config.ts": "export default {};\n",
  });

  await run("init", "--yes");

  expect(project.read("engrenage.config.ts")).toBe("export default {};\n");

  for (const file of [
    "AGENTS.md",
    "CLAUDE.md",
    ".claude/settings.json",
    ".ai/backlog/index.md",
    ".ai/scratchpad.md",
    ".claude/rules/backlog.md",
  ]) {
    expect(existsSync(project.resolve(file))).toBe(false);
  }

  expect(printed()).toContainEqual(
    expect.stringContaining("Add agents.preferred: []"),
  );
});

test("sets up the backlog guidance without installing coding rules", async () => {
  const input = 'export default { agents: { preferred: ["claude"] } };\n';

  const project = createProject({
    "package.json": '{"name":"project","type":"module"}',
    "engrenage.config.ts": input,
  });

  await run("init", "--yes");

  expect(project.read("engrenage.config.ts")).toBe(input);

  expect(project.read(".ai/backlog/index.md")).not.toContain(
    "## Open categories",
  );

  expect(project.read(".ai/backlog/index.yml")).toContain("{}");

  expect(project.read(".ai/backlog/index.md")).toContain(
    "metalbrain/templates/backlog.md -->\n\nDeferred questions, bugs, tasks and improvements.\n",
  );

  expect(project.read(".claude/skills/curation/SKILL.md")).toContain(
    "# Curation",
  );

  expect(project.read(".ai/scratchpad.md")).toBe(
    `# Scratchpad\n\n<!-- scratchpad-placeholder -->\n\n${scratchpadPlaceholder}\n`,
  );

  expect(existsSync(project.resolve(".claude/rules/code-style.md"))).toBe(
    false,
  );
});

test("uses an interactive selection for this init without rewriting an existing config", async () => {
  const project = createProject({
    "package.json": '{"name":"project","type":"module"}',
    "engrenage.config.ts": "export default {};\n",
  });

  const prompter = prompts.createPrompter({
    yes: true,
  });

  vi.spyOn(prompts, "createPrompter").mockReturnValue({
    ...prompter,
    multiselect(_message, values) {
      return Promise.resolve([...values]);
    },
  });

  await run("init", "--yes");

  expect(project.read("engrenage.config.ts")).toBe("export default {};\n");

  expect(project.read("CLAUDE.md")).toBe("@AGENTS.md\n");

  expect(project.read(".claude/settings.json")).toContain(
    "metalbrain hook claude PreToolUse guardToolUse",
  );

  expect(printed()).toContainEqual(
    expect.stringContaining('Add agents.preferred: ["claude"]'),
  );
});

test("declining backlog setup leaves no backlog instructions or files", async () => {
  const project = createProject({
    "package.json": '{"name":"project","type":"module"}',
    "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] } };\n',
  });

  const confirm = vi.fn((message: string) => {
    return Promise.resolve(!message.startsWith("Set up the shared backlog"));
  });

  vi.spyOn(prompts, "createPrompter").mockReturnValue({
    ...prompts.createPrompter({ yes: true }),
    confirm,
  });

  await run("init");

  expect(confirm).toHaveBeenCalledWith(
    expect.stringContaining("Set up the shared backlog"),
    true,
  );

  expect(existsSync(project.resolve(".ai/backlog/index.md"))).toBe(false);

  expect(existsSync(project.resolve(".claude/rules/backlog.md"))).toBe(false);

  expect(existsSync(project.resolve(".ai/scratchpad.md"))).toBe(false);

  expect(existsSync(project.resolve(".claude/skills/curation"))).toBe(false);

  expect(project.read("AGENTS.md")).not.toContain("## Backlog");

  expect(printed().join("\n")).not.toContain("Instruction fragments reference");
});

test("adds a scratchpad to an existing backlog setup", async () => {
  const project = createProject({
    "package.json": '{"name":"project","type":"module"}',
    "engrenage.config.ts": 'export default { agents: { preferred: ["claude"] } };\n',
    "AGENTS.md": "# Agents\n\n<!-- @reference @auaust/engrenage/metalbrain/sections/backlog.md -->\n<!-- @end -->\n",
    ".ai/backlog/index.md": "# Backlog\n\nOutdated guidance.\n\n## Open categories\n\nNo open categories yet.\n",
    ".claude/rules/backlog.md": "<!-- @reference @auaust/engrenage/metalbrain/rules/backlog.md -->\n<!-- @end -->\n",
  });

  await run("init", "--yes");

  expect(project.read(".ai/scratchpad.md")).toContain(
    "<!-- scratchpad-placeholder -->",
  );

  expect(project.read(".ai/backlog/index.md")).toMatch(
    /^# Backlog\n\n<!-- @reference @auaust\/engrenage\/metalbrain\/templates\/backlog\.md -->\n[^]*<!-- @end -->\n$/,
  );

  expect(project.read(".claude/skills/curation/SKILL.md")).toContain(
    "# Curation",
  );
});
